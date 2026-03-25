import express from 'express';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import JobListing from '../models/JobListing.js';
import jobFetcher from '../utils/jobFetcher.js';
import jobRecommendationService from '../utils/jobRecommendationService.js';
import { sendJobDigestToUser } from '../utils/jobScheduler.js';
import groqAI from '../utils/groqAI.js';

const router = express.Router();

/**
 * GET /api/jobs/recommendations/:userId
 * Get job recommendations for a specific user
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      perPage = 10,
      location,
      experienceLevel, // 'fresher' or 'experienced'
      jobType,
      source,
      portfolioId,
      sortBy = 'score' // 'score', 'date', 'company'
    } = req.query;

    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.min(100, Math.max(1, parseInt(perPage)));

    // Fetch user's portfolio
    let portfolio;
    if (portfolioId) {
      portfolio = await Portfolio.findById(portfolioId);
    } else {
      portfolio = await Portfolio.findOne({ userId });
    }

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found for this user'
      });
    }

    // Build user profile for scoring
    const userProfile = jobRecommendationService.buildUserProfile(portfolio);

    // Normalize jobType variants: DB has 'Full-time', 'full_time', 'contract', 'Contractor', etc.
    const jobTypeMap = {
      'Full-time': /^(full.?time|ft)$/i,
      'Part-time': /^(part.?time|pt)$/i,
      'Contract': /^(contract|contractor)$/i,
      'Freelance': /^(freelance|freelancer)$/i,
      'Internship': /^(internship|intern)$/i
    };

    // Build DB filters
    const dbFilters = {};
    if (location) dbFilters.location = { $regex: location, $options: 'i' };
    if (jobType && jobType !== 'all') {
      const pattern = jobTypeMap[jobType];
      if (pattern) {
        dbFilters.jobType = { $regex: pattern };
      } else {
        dbFilters.jobType = jobType;
      }
    }
    if (source && source !== 'all') dbFilters.source = source;

    // Experience level filtering
    if (experienceLevel === 'fresher') {
      dbFilters.$or = [
        { experience: { $regex: /0|1|entry|junior|fresher|intern|graduate/i } },
        { experience: { $exists: false } },
        { experience: '' },
        { experience: null }
      ];
    } else if (experienceLevel === 'experienced') {
      dbFilters.experience = { $regex: /[2-9]|10|senior|mid|lead|principal|staff|manager/i };

      // If experienced, strictly filter out Internship roles
      if (!dbFilters.jobType) {
        dbFilters.jobType = { $ne: 'Internship' };
      }
    }

    // Fetch ALL matching jobs from DB (no artificial limit)
    const allJobs = await jobFetcher.getActiveJobsFromDB(dbFilters);

    console.log(`📊 Scoring ${allJobs.length} jobs against user profile...`);

    // Helper to normalize jobType for display
    const normalizeJobType = (raw) => {
      if (!raw) return 'Full-time';
      for (const [label, pattern] of Object.entries(jobTypeMap)) {
        if (pattern.test(raw)) return label;
      }
      return raw;
    };

    // Score ALL jobs against user profile using fallback scoring (fast, local)
    const allScoredJobs = allJobs.map(job => {
      const j = job._doc ? job._doc : job;
      const scoreResult = jobRecommendationService.fallbackScoring(userProfile, j);
      return {
        jobId: j.jobId || j._id,
        title: j.title,
        company: j.company,
        location: j.location || 'Remote',
        jobType: normalizeJobType(j.jobType),
        sourceUrl: j.sourceUrl,
        source: j.source,
        description: j.description || '',
        requiredSkills: j.requiredSkills || [],
        preferredSkills: j.preferredSkills || [],
        experience: j.experience || '',
        salaryRange: j.salaryRange || null,
        postedDate: j.postedDate || j.createdAt,
        matchScore: Math.round((scoreResult.overallScore || 0) * 100),
        skillMatch: scoreResult.details || {}
      };
    });

    // Filter out jobs with match score <= 40% (show more relevant matches)
    const scoredJobs = allScoredJobs.filter(job => job.matchScore > 40);

    console.log(`✅ ${scoredJobs.length} jobs above 40% match (filtered from ${allScoredJobs.length})`);

    // Sort based on user preference
    if (sortBy === 'date') {
      scoredJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    } else if (sortBy === 'company') {
      scoredJobs.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    } else {
      // Default: sort by match score (highest first)
      scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Add rank after sorting
    scoredJobs.forEach((job, idx) => { job.rank = idx + 1; });

    // Pagination
    const totalJobs = scoredJobs.length;
    const totalPages = Math.ceil(totalJobs / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);
    const startIdx = (safePage - 1) * itemsPerPage;
    const paginatedJobs = scoredJobs.slice(startIdx, startIdx + itemsPerPage);

    res.json({
      success: true,
      userId,
      recommendations: paginatedJobs,
      pagination: {
        currentPage: safePage,
        perPage: itemsPerPage,
        totalJobs,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
      },
      message: `Page ${safePage} of ${totalPages} (${totalJobs} total matches)`
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

    // Find user by session
    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    // Forward to userId-based handler (all query params pass through automatically)
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
    const { userId, sessionId, portfolioId } = req.body || {};
    console.log('🔄 Triggering Smart Job Fetch & Pruning...');


    let profile = null;

    // If we have a user context, personalize the fresh fetch
    let uId = userId;
    if (!uId && sessionId) {
      const user = await User.findOne({ sessionId });
      if (user) uId = user._id.toString();
    }

    if (uId || portfolioId) {
      let portfolio;
      if (portfolioId) {
        portfolio = await Portfolio.findById(portfolioId);
      } else if (uId) {
        portfolio = await Portfolio.findOne({ userId: uId });
      }

      if (portfolio) {
        profile = jobRecommendationService.buildUserProfile(portfolio);

        // 1. CLEAR OUT IRRELEVANT JOBS
        const allJobs = await JobListing.find({});
        const irrelevantJobIds = [];

        allJobs.forEach(job => {
          const score = jobRecommendationService.fallbackScoring(profile, job);
          // Only delete truly irrelevant jobs (<= 30% match) to keep a larger pool
          if (score.overallScore <= 0.30) {
            irrelevantJobIds.push(job._id);
          }
        });

        if (irrelevantJobIds.length > 0) {
          console.log(`🗑️ Deleting ${irrelevantJobIds.length} irrelevant jobs specifically for this user...`);
          await JobListing.deleteMany({ _id: { $in: irrelevantJobIds } });
        }

        // 2. LOOP FETCHING TO HIT 80% DB CAPACITY
        let currentJobCount = await JobListing.countDocuments();

        const MAX_LOOPS = 6; // Allow more loops to reach target
        const TARGET_DB_CAPACITY = 200; // Ultra-lean and fast capacity limit

        let loopCount = 0;
        let totalSavedJobCount = 0;
        let usedQueries = new Set();

        const titleKeywords = (profile.experience || []).map(e => e.title).filter(Boolean);
        const skillKeywords = (profile.skills || []).slice(0, 15);

        console.log(`🎯 Commencing DB Fill Loop. Target Capacity: ${TARGET_DB_CAPACITY} | Current DB Size: ${currentJobCount}`);

        while (loopCount < MAX_LOOPS && currentJobCount < TARGET_DB_CAPACITY) {
          loopCount++;
          console.log(`\n🔄 [Loop ${loopCount}/${MAX_LOOPS}] Fetching new batch of jobs... Current DB size: ${currentJobCount}/${TARGET_DB_CAPACITY}`);

          let loopQueries = [];

          try {
            // Ask LLM to deduce standard job titles based on the user's specific skills
            const avoidList = Array.from(usedQueries).join(', ');
            const aiPrompt = `Analyze the following user profile and return a JSON list of the top 3-5 most accurate professional Job Titles to use in a job search engine. \n\nSkills: ${skillKeywords.join(', ')}\nExperience: ${titleKeywords.join(', ')}\n${avoidList ? `CRITICAL: Provide completely NEW, DIFFERENT job titles from these previous ones to widen the search: ${avoidList}\n` : ''}\nOnly return valid JSON array of strings, no markdown. Example: ["Software Engineer", "Frontend Developer"]`;

            const groqResult = await groqAI.generateContent(aiPrompt);

            if (groqResult && !groqResult.rateLimited) {
              const responseText = await groqResult.response.text();
              let parsedTitles = [];
              let jsonText = responseText.trim();
              if (jsonText.startsWith('```json')) jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
              if (jsonText.startsWith('```')) jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');

              parsedTitles = JSON.parse(jsonText);

              if (Array.isArray(parsedTitles) && parsedTitles.length > 0) {
                console.log(`🤖 Groq AI suggested job titles for loop ${loopCount}:`, parsedTitles);
                loopQueries = parsedTitles.map(q => q.toLowerCase());
              }
            }
          } catch (_llmError) {
            console.warn('⚠️ Failed to get Groq AI suggested titles, falling back to basic extraction.');
          }

          // Fallback or combine if LLM failed
          if (loopQueries.length === 0) {
            const combined = [...titleKeywords.slice(0, 2), ...skillKeywords.slice(0, 3)];
            loopQueries = combined
              .filter(q => q && q.length > 2)
              .map(q => q.toLowerCase().replace(/senior|junior|lead|developer|engineer|manager/g, '').trim())
              .filter(Boolean);
          }

          // Deduplicate within loop
          loopQueries = [...new Set(loopQueries)];

          // Add to global used queries
          loopQueries.forEach(q => usedQueries.add(q));

          let rawJobs = [];

          if (loopQueries.length > 0) {
            const location = req.body.location || portfolio.header?.location || 'India';
            const customJobs = await jobFetcher.searchJobs(loopQueries, location);
            rawJobs.push(...customJobs);
          }
        }

        // Pull wide net from generic APIs on loops 1 and 3 for more variety
        if (loopCount === 1 || loopCount === 3) {
          console.log('🌐 Pulling a wider net of jobs from generic boards to find hidden matches...');
          try {
            const [remotiveJobs, arbeitJobs] = await Promise.all([
              jobFetcher.fetchRemotiveJobs(),
              jobFetcher.fetchArbeitNowJobs()
            ]);
            rawJobs.push(...remotiveJobs, ...arbeitJobs);
          } catch (e) {
            console.warn("⚠️ Wide net fetch partially failed", e);
          }
        }

        // Deduplicate the raw jobs for this loop using jobId or a generated key
        const uniqueRawJobsMap = new Map();
        for (const job of rawJobs) {
          const key = job.jobId || job.sourceUrl || `${job.title}-${job.company}`;
          if (key && !uniqueRawJobsMap.has(key)) {
            uniqueRawJobsMap.set(key, job);
          }
        }

        const uniqueRawJobs = Array.from(uniqueRawJobsMap.values());

        if (uniqueRawJobs.length > 0) {
          const highlyRelevantJobs = uniqueRawJobs.filter(job => {
            const score = jobRecommendationService.fallbackScoring(profile, job);
            return score.overallScore > 0.40; // Store jobs > 40% (display filter at 50% ensures quality)
          });

          console.log(`🧠 Loop ${loopCount}: Evaluated ${uniqueRawJobs.length} raw jobs against your resume. Keeping ${highlyRelevantJobs.length} >40% matched jobs.`);

          if (highlyRelevantJobs.length > 0) {
            await jobFetcher.saveJobsToDB(highlyRelevantJobs);
            totalSavedJobCount += highlyRelevantJobs.length;

            // Recalculate true size after upserts complete
            currentJobCount = await JobListing.countDocuments();
          }
        }

        // Wait slightly before the next LLM call/Job API scrape to respect rate limits
        if (currentJobCount < TARGET_DB_CAPACITY && loopCount < MAX_LOOPS) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } // End of While Loop

      return res.json({
        success: true,
        message: `Successfully executed the multi-loop aggressive fetch. DB reached ${currentJobCount} jobs safely.`,
        actuallySavedToDatabase: totalSavedJobCount,
        queriesUsed: Array.from(usedQueries)
      });
    }

    // Default fallback if no portfolio found
    return res.json({
      success: true,
      message: 'No portfolio provided, skipping AI fetch loop.',
      actuallySavedToDatabase: 0
    });
  } catch (error) {
    console.error('❌ Error fetching fresh jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching job listings',
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/fetch-fresh-stream
 * SSE endpoint: Streams real-time progress during job fetching
 */
router.get('/fetch-fresh-stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { userId, sessionId, portfolioId, location: queryLocation } = req.query;
    sendEvent({ type: 'status', message: '🔄 Starting smart job fetch...', phase: 'init' });

    let uId = userId;
    if (!uId && sessionId) {
      const user = await User.findOne({ sessionId });
      if (user) uId = user._id.toString();
    }

    if (!uId && !portfolioId) {
      sendEvent({ type: 'error', message: 'No user or portfolio specified' });
      sendEvent({ type: 'complete', totalJobs: 0, totalSaved: 0 });
      res.end();
      return;
    }

    let portfolio;
    if (portfolioId) {
      portfolio = await Portfolio.findById(portfolioId);
    } else if (uId) {
      portfolio = await Portfolio.findOne({ userId: uId });
    }

    if (!portfolio) {
      sendEvent({ type: 'error', message: 'Portfolio not found' });
      sendEvent({ type: 'complete', totalJobs: 0, totalSaved: 0 });
      res.end();
      return;
    }

    const profile = jobRecommendationService.buildUserProfile(portfolio);

    // Step 1: Prune irrelevant jobs
    sendEvent({ type: 'status', message: '🗑️ Cleaning up irrelevant jobs...', phase: 'pruning' });
    const existingJobs = await JobListing.find({});
    const irrelevantJobIds = [];
    existingJobs.forEach(job => {
      const score = jobRecommendationService.fallbackScoring(profile, job);
      if (score.overallScore <= 0.30) irrelevantJobIds.push(job._id);
    });

    if (irrelevantJobIds.length > 0) {
      await JobListing.deleteMany({ _id: { $in: irrelevantJobIds } });
      sendEvent({ type: 'pruned', message: `🗑️ Removed ${irrelevantJobIds.length} irrelevant jobs`, deletedCount: irrelevantJobIds.length });
    }

    // Step 2: Loop fetching
    let currentJobCount = await JobListing.countDocuments();
    const MAX_LOOPS = 10; // Increased from 6 to 10
    const TARGET = 200;
    let loopCount = 0;
    let totalSaved = 0;
    const usedQueries = new Set();
    const titleKw = (profile.experience || []).map(e => e.title).filter(Boolean);
    const skillKw = (profile.skills || []).slice(0, 15);

    sendEvent({ type: 'status', message: `🎯 Target: ${TARGET} jobs | Current: ${currentJobCount}`, phase: 'fetching', currentJobs: currentJobCount, targetJobs: TARGET });

    while (loopCount < MAX_LOOPS && currentJobCount < TARGET) {
      loopCount++;
      sendEvent({ type: 'loop_start', loop: loopCount, maxLoops: MAX_LOOPS, message: `🔄 Loop ${loopCount}/${MAX_LOOPS}: Searching...`, currentJobs: currentJobCount });

      let loopQueries = [];
      try {
        const avoidList = Array.from(usedQueries).join(', ');
        const aiPrompt = `Analyze the following user profile and return a JSON list of the top 10-12 most accurate and diverse professional Job Titles to use in a job search engine. Include direct matches, synonyms, and slightly adjacent roles to cast a wider net. \n\nSkills: ${skillKw.join(', ')}\nExperience: ${titleKw.join(', ')}\n${avoidList ? `CRITICAL: Provide completely NEW, DIFFERENT job titles from these previous ones to widen the search: ${avoidList}\n` : ''}\nOnly return valid JSON array of strings, no markdown. Example: ["Software Engineer", "Frontend Developer", "Web Developer", "UI Programmer"]`;
        const groqResult = await groqAI.generateContent(aiPrompt);
        if (groqResult && !groqResult.rateLimited) {
          const responseText = await groqResult.response.text();
          let jsonText = responseText.trim();
          if (jsonText.startsWith('```json')) jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
          if (jsonText.startsWith('```')) jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
          const parsedTitles = JSON.parse(jsonText);
          if (Array.isArray(parsedTitles) && parsedTitles.length > 0) {
            loopQueries = parsedTitles.map(q => q.toLowerCase());
            sendEvent({ type: 'ai_titles', loop: loopCount, message: `🤖 AI suggested: ${parsedTitles.join(', ')}`, titles: parsedTitles });
          }
        }
      } catch (_llmErr) {
        sendEvent({ type: 'ai_fallback', loop: loopCount, message: '⚠️ AI unavailable, using skill-based search...' });
      }

      if (loopQueries.length === 0) {
        const combined = [...titleKw.slice(0, 2), ...skillKw.slice(0, 3)];
        loopQueries = combined.filter(q => q && q.length > 2).map(q => q.toLowerCase().replace(/senior|junior|lead|developer|engineer|manager/g, '').trim()).filter(Boolean);
      }

      loopQueries = [...new Set(loopQueries)];
      loopQueries.forEach(q => usedQueries.add(q));

      let rawJobs = [];
      if (loopQueries.length > 0) {
        const preferredLocation = queryLocation || portfolio.header?.location || 'India';
        const customJobs = await jobFetcher.searchJobs(loopQueries, preferredLocation);
        rawJobs.push(...customJobs);
      }
      if (loopCount === 1 || loopCount === 3) {
        sendEvent({ type: 'status', message: '🌐 Pulling from job boards...', loop: loopCount });
        try {
          const [remotiveJobs, arbeitJobs] = await Promise.all([jobFetcher.fetchRemotiveJobs(), jobFetcher.fetchArbeitNowJobs()]);
          rawJobs.push(...remotiveJobs, ...arbeitJobs);
        } catch (_e) { /* silent */ }
      }

      const seen = new Map();
      for (const job of rawJobs) {
        const key = job.jobId || job.sourceUrl || `${job.title}-${job.company}`;
        if (key && !seen.has(key)) seen.set(key, job);
      }
      const uniqueRaw = Array.from(seen.values());

      if (uniqueRaw.length > 0) {
        const matched = uniqueRaw.filter(job => {
          const score = jobRecommendationService.fallbackScoring(profile, job);
          return score.overallScore > 0.40;
        });
        if (matched.length > 0) {
          await jobFetcher.saveJobsToDB(matched);
          totalSaved += matched.length;
          currentJobCount = await JobListing.countDocuments();
        }
        sendEvent({ type: 'loop_result', loop: loopCount, maxLoops: MAX_LOOPS, evaluated: uniqueRaw.length, matched: matched.length, totalSaved, currentJobs: currentJobCount, targetJobs: TARGET, message: `✅ Loop ${loopCount}: ${uniqueRaw.length} found → ${matched.length} matched | DB: ${currentJobCount}/${TARGET}` });
      } else {
        sendEvent({ type: 'loop_result', loop: loopCount, maxLoops: MAX_LOOPS, evaluated: 0, matched: 0, totalSaved, currentJobs: currentJobCount, targetJobs: TARGET, message: `⚠️ Loop ${loopCount}: No new jobs found` });
      }

      if (currentJobCount < TARGET && loopCount < MAX_LOOPS) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    sendEvent({ type: 'complete', message: `🎉 Done! ${currentJobCount} jobs in DB. ${totalSaved} new jobs saved.`, totalJobs: currentJobCount, totalSaved, loopsCompleted: loopCount });
    res.end();
  } catch (error) {
    console.error('❌ SSE fetch error:', error);
    sendEvent({ type: 'error', message: `Error: ${error.message}` });
    sendEvent({ type: 'complete', totalJobs: 0, totalSaved: 0 });
    res.end();
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
