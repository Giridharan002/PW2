import express from 'express';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import JobListing from '../models/JobListing.js';
import jobFetcher from '../utils/jobFetcher.js';
import jobRecommendationService from '../utils/jobRecommendationService.js';
import { sendJobDigestToUser } from '../utils/jobScheduler.js';

const router = express.Router();

/**
 * GET /api/jobs/recommendations/:userId
 * Get job recommendations for a specific user
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, location, experience } = req.query;

    // Fetch user's portfolio
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found for this user'
      });
    }

    // Extract ideal job titles using AI from user's portfolio
    const userProfile = jobRecommendationService.buildUserProfile(portfolio);
    const idealJobTitles = await jobRecommendationService.extractIdealJobTitles(portfolio);
    
    // Build search queries using AI-extracted job titles
    const queries = [...idealJobTitles];
    
    // Add location context if available
    const locationPart = userProfile.location || '';
    if (locationPart) {
      const titlesWithLocation = idealJobTitles.map(title => `${title} ${locationPart}`);
      queries.push(...titlesWithLocation.slice(0, 2));
    }
    
    console.log(`🔍 Searching for jobs with titles: ${queries.slice(0, 5).join(', ')}`);

    // Try search-based job fetching (fast, single API calls)
    let foundJobs = [];
    try {
      foundJobs = await jobFetcher.searchJobs(queries);
    } catch (err) {
      console.warn('⚠️ Search-based job fetch failed, falling back to DB:', err.message);
      foundJobs = [];
    }

    // If search returned few or no hits, fall back to cached DB jobs
    if (!foundJobs || foundJobs.length < parseInt(limit)) {
      const dbJobs = await jobFetcher.getActiveJobsFromDB();

      // quick local scoring using skill overlap as a lightweight alternative to AI
      const scored = dbJobs.map(j => {
        const fallback = jobRecommendationService.fallbackScoring(userProfile, j);
        return { job: j, score: Math.round((fallback.overallScore || 0) * 100) };
      }).sort((a, b) => b.score - a.score);

      // merge top DB results into foundJobs if needed
      const needed = Math.max(0, parseInt(limit) - (foundJobs ? foundJobs.length : 0));
      const topFromDb = scored.slice(0, needed).map(s => s.job);
      foundJobs = [...(foundJobs || []), ...topFromDb];
    }

    // Prepare final recommendations list
    const recommendations = (foundJobs || []).slice(0, parseInt(limit)).map((job, idx) => {
      // if job comes from DB (mongoose doc) or from API, normalize
      const j = job._doc ? job._doc : job;
      return {
        rank: idx + 1,
        jobId: j.jobId || j._id,
        title: j.title,
        company: j.company,
        location: j.location,
        jobType: j.jobType || j.type || 'N/A',
        sourceUrl: j.sourceUrl,
        source: j.source,
        description: j.description || '',
        requiredSkills: j.requiredSkills || [],
        preferredSkills: j.preferredSkills || [],
      };
    });

    res.json({
      success: true,
      userId,
      recommendationsCount: recommendations.length,
      recommendations,
      message: `Returning ${recommendations.length} instant recommendations`
    });
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job recommendations',
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/recommendations/session/:sessionId
 * Get job recommendations using session ID
 */
router.get('/recommendations/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 10 } = req.query;

    // Find user by session
    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    // Fetch recommendations using userId
    req.params.userId = user._id.toString();
    return router.stack
      .find(layer => layer.route && layer.route.path === '/recommendations/:userId')
      .handle(req, res);
  } catch (error) {
    console.error('❌ Error in session-based recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/recommendations/analyze
 * Analyze a job against user's resume
 */
router.post('/recommendations/analyze', async (req, res) => {
  try {
    const { portfolio, job } = req.body;

    if (!portfolio || !job) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio and job data required'
      });
    }

    // Score the job match
    const score = await jobRecommendationService.scoreJobMatch(
      jobRecommendationService.buildUserProfile(portfolio),
      job
    );

    res.json({
      success: true,
      jobTitle: job.title,
      company: job.company,
      matchScore: Math.round(score.overallScore * 100),
      analysis: score.details
    });
  } catch (error) {
    console.error('❌ Error analyzing job:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing job match',
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/list
 * Get available job listings
 */
router.get('/list', async (req, res) => {
  try {
    const { source, location, limit = 20, skip = 0 } = req.query;

    const query = { isActive: true };
    if (source) query.source = source;
    if (location) query.location = { $regex: location, $options: 'i' };

    const jobs = await JobListing
      .find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ postedDate: -1 });

    const totalCount = await JobListing.countDocuments(query);

    res.json({
      success: true,
      totalJobs: totalCount,
      jobsReturned: jobs.length,
      jobs,
      pagination: {
        skip: parseInt(skip),
        limit: parseInt(limit),
        hasMore: (parseInt(skip) + parseInt(limit)) < totalCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job listings',
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/fetch-fresh
 * Fetch fresh job listings from APIs and update database
 */
router.post('/fetch-fresh', async (req, res) => {
  try {
    console.log('🔄 Fetching fresh job listings...');

    // Fetch from GitHub Jobs API
    const jobs = await jobFetcher.fetchAndCacheJobs(true);

    // Save to database
    const savedJobs = await jobFetcher.saveJobsToDB(jobs);

    res.json({
      success: true,
      message: 'Successfully fetched and saved fresh job listings',
      totalFetched: jobs.length,
      totalSaved: savedJobs.length,
      sources: [...new Set(jobs.map(j => j.source))]
    });
  } catch (error) {
    console.error('❌ Error fetching fresh jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job listings',
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/stats
 * Get job statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalJobs = await JobListing.countDocuments({ isActive: true });
    const jobsBySource = await JobListing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const jobsByType = await JobListing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    const latestJobs = await JobListing
      .find({ isActive: true })
      .sort({ postedDate: -1 })
      .limit(5);

    res.json({
      success: true,
      statistics: {
        totalActiveJobs: totalJobs,
        bySource: Object.fromEntries(jobsBySource.map(s => [s._id, s.count])),
        byType: Object.fromEntries(jobsByType.map(t => [t._id, t.count])),
        lastUpdated: new Date()
      },
      latestJobs: latestJobs.map(j => ({
        title: j.title,
        company: j.company,
        postedDate: j.postedDate
      }))
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/cleanup
 * Remove expired/old job listings
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const deleted = await jobFetcher.cleanupOldJobs(daysOld);

    res.json({
      success: true,
      message: `Cleaned up old job listings`,
      jobsDeleted: deleted
    });
  } catch (error) {
    console.error('❌ Error cleaning up jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up job listings',
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/top-companies
 * Get top companies hiring
 */
router.get('/top-companies', async (req, res) => {
  try {
    const topCompanies = await JobListing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      topCompanies: topCompanies.map(c => ({
        company: c._id,
        openPositions: c.count
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching top companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company data',
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/send-digest/:userId
 * Manually trigger job digest email for a user (for testing)
 */
router.post('/send-digest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await sendJobDigestToUser(userId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Job digest email sent',
        jobsCount: result.jobsCount
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending digest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send job digest',
      error: error.message
    });
  }
});

export default router;
