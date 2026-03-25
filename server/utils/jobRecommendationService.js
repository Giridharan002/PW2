import groqAI from './groqAI.js';

class JobRecommendationService {
  /**
   * Match user resume with job listings using AI
   * @param {Object} portfolioData - User's portfolio/resume data
   * @param {Array} jobListings - Array of job listings
   * @param {number} topN - Number of top matches to return
   * @returns {Array} - Ranked job recommendations with scores
   */
  async getJobRecommendations(portfolioData, jobListings, topN = 10) {
    try {
      if (!jobListings || jobListings.length === 0) {
        console.warn('⚠️ No job listings provided for recommendations');
        return [];
      }

      console.log(`🔍 Analyzing ${jobListings.length} jobs against user profile...`);

      // Build user profile summary from portfolio
      const userProfile = this.buildUserProfile(portfolioData);

      // Score each job against the user profile
      const jobScores = [];

      for (const job of jobListings) {
        try {
          const score = await this.scoreJobMatch(userProfile, job);
          jobScores.push({
            job,
            score,
            matchDetails: score.details
          });
        } catch (error) {
          console.warn(`⚠️ Error scoring job ${job.title} at ${job.company}:`, error.message);
          // Continue with next job
        }
      }

      // Sort by score descending and return top N
      const recommendations = jobScores
        .sort((a, b) => b.score.overallScore - a.score.overallScore)
        .slice(0, topN)
        .map((item, index) => ({
          rank: index + 1,
          jobId: item.job._id,
          title: item.job.title,
          company: item.job.company,
          location: item.job.location,
          jobType: item.job.jobType,
          salaryRange: item.job.salaryRange,
          sourceUrl: item.job.sourceUrl,
          source: item.job.source,
          matchScore: Math.round(item.score.overallScore * 100), // 0-100
          matchDetails: item.matchDetails,
          requiredSkills: item.job.requiredSkills,
          preferredSkills: item.job.preferredSkills
        }));

      console.log(`✅ Found ${recommendations.length} matching jobs`);
      return recommendations;
    } catch (error) {
      console.error('❌ Error in job recommendations:', error);
      throw error;
    }
  }

  /**
   * Build a user profile summary from portfolio data
   */
  buildUserProfile(portfolioData) {
    const { header = {}, workExperience = [], education = [], skills = [] } = portfolioData;

    const profile = {
      name: header.name || 'Unknown',
      skills: [
        ...skills,
        ...(header.skills || [])
      ],
      experience: (workExperience || []).map(exp => ({
        title: exp.title,
        company: exp.company,
        description: exp.description,
        yearsInRole: this.calculateYearsDuration(exp.start, exp.end)
      })),
      education: (education || []).map(edu => ({
        degree: edu.degree,
        school: edu.school
      })),
      summary: portfolioData.summary || '',
      location: header.location || ''
    };

    return profile;
  }

  /**
   * Score a single job against user profile using AI
   */
  async scoreJobMatch(userProfile, job) {
    const prompt = `You are an expert recruiter. Analyze how well this job matches the candidate's profile.

CANDIDATE PROFILE:
Name: ${userProfile.name}
Location: ${userProfile.location}
Summary: ${userProfile.summary}

Skills: ${userProfile.skills.join(', ')}

Experience:
${userProfile.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.yearsInRole} years): ${exp.description}`).join('\n')}

Education:
${userProfile.education.map(edu => `- ${edu.degree} from ${edu.school}`).join('\n')}

---

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.jobType}
Experience Required: ${job.experience}

Required Skills: ${job.requiredSkills?.join(', ') || 'Not specified'}
Preferred Skills: ${job.preferredSkills?.join(', ') || 'Not specified'}

Job Description:
${job.description}

---

TASK: Provide a detailed match analysis in JSON format with:
1. "overallScore": number between 0-1 (overall match percentage)
2. "skillsMatch": number between 0-1 (how well skills align)
3. "experienceMatch": number between 0-1 (relevant experience match)
4. "locationMatch": number between 0-1 (location compatibility)
5. "reasons": array of 3-5 key matching points
6. "concerns": array of 2-3 potential concerns (if any)
7. "recommendation": "Excellent match" | "Good match" | "Moderate match" | "Fair match" | "Poor match"

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await groqAI.generateContent(prompt);
      const responseText = result.response.text();

      // Clean JSON response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const scoreData = JSON.parse(jsonText);

      return {
        overallScore: scoreData.overallScore || 0,
        details: {
          skillsMatch: Math.round((scoreData.skillsMatch || 0) * 100),
          experienceMatch: Math.round((scoreData.experienceMatch || 0) * 100),
          locationMatch: Math.round((scoreData.locationMatch || 0) * 100),
          reasons: scoreData.reasons || [],
          concerns: scoreData.concerns || [],
          recommendation: scoreData.recommendation || 'No recommendation'
        }
      };
    } catch (error) {
      console.warn(`⚠️ AI scoring error for ${job.title}:`, error.message);
      // Return default scoring based on skill matching
      return this.fallbackScoring(userProfile, job);
    }
  }

  /**
   * Fallback scoring if AI fails - much stricter skill and title matching
   */
  fallbackScoring(userProfile, job) {
    const userSkillsLower = (userProfile.skills || []).map(s => s.trim().toLowerCase());
    const requiredSkillsLower = (job.requiredSkills || []).map(s => s.trim().toLowerCase());
    const preferredSkillsLower = (job.preferredSkills || []).map(s => s.trim().toLowerCase());

    const jobTitleLower = (job.title || '').toLowerCase();
    const userTitles = (userProfile.experience || []).map(exp => (exp.title || '').toLowerCase());

    // 1. TITLE RELEVANCE (Crucial to filter out unrelated roles like "Social Media Manager" for a "Software Engineer")
    let titleScore = 0;

    // Extract meaningful keywords from job title, aggressively dropping generic corporate/resume buzzwords
    const ignoreWords = [
      'remote', 'senior', 'junior', 'lead', 'manager', 'm/w/d', 'associate', 'staff', 'principal',
      'intern', 'internship', 'project', 'projects', 'specialist', 'assistant', 'worker', 'student',
      'trainee', 'coordinator', 'professional', 'entry', 'level', 'part', 'full', 'time', 'co', 'location',
      'working', 'analyst', 'employee', 'temporary', 'freelance', 'contract', 'engineer', 'developer',
      'technician', 'consultant', 'advisor', 'officer', 'representative', 'executive'
    ];

    const titleWords = jobTitleLower
      .split(/[\s,|/()-]+/)
      .filter(w => w.length > 2 && !ignoreWords.includes(w));

    const userTitleWords = userTitles
      .flatMap(t => t.split(/[\s,|/()-]+/))
      .filter(w => w.length > 2 && !ignoreWords.includes(w));

    // A job is highly relevant if its CORE domain words matches past experience or skills.
    // e.g. "React" matching "Frontend React Developer", or "Finance" matching "Corporate Finance"
    // (Note: Since we filtered out generic roles like 'developer' or 'manager', we are mostly matching domains like 'python', 'finance', 'backend', 'marketing')
    const matchesUserTitles = titleWords.some(w => userTitleWords.includes(w));
    const matchesUserSkills = titleWords.some(w => userSkillsLower.some(skill => skill.includes(w) || w.includes(skill)));

    if (matchesUserTitles) {
      titleScore = 0.9;
    } else if (matchesUserSkills) {
      titleScore = 0.8;
    } else {
      // Heavier penalty if the title has ZERO overlap with their core professional domain words
      titleScore = 0.05;
    }

    // 2. SKILL RELEVANCE
    // Strict matching to avoid false positives (e.g., "man" matching "management")
    const isMatch = (userSkill, reqSkill) => {
      if (userSkill === reqSkill) return true;
      if (userSkill.length > 3 && reqSkill.includes(userSkill)) return true;
      if (reqSkill.length > 3 && userSkill.includes(reqSkill)) return true;
      return false;
    };

    const requiredMatches = requiredSkillsLower.filter(skill =>
      userSkillsLower.some(userSkill => isMatch(userSkill, skill))
    ).length;

    const preferredMatches = preferredSkillsLower.filter(skill =>
      userSkillsLower.some(userSkill => isMatch(userSkill, skill))
    ).length;

    const requiredScore = requiredSkillsLower.length > 0
      ? requiredMatches / requiredSkillsLower.length
      : 0.2; // Penalize if no skills listed but the title doesn't align

    const preferredScore = preferredSkillsLower.length > 0
      ? preferredMatches / preferredSkillsLower.length
      : 0.2;

    // 3. DESCRIPTION-BASED SKILL MATCHING (catches relevant jobs with generic titles)
    let descriptionScore = 0;
    const descLower = (job.description || '').toLowerCase();
    if (descLower.length > 50) {
      const descSkillMatches = userSkillsLower.filter(skill =>
        skill.length > 2 && descLower.includes(skill)
      ).length;
      // If multiple user skills appear in the job description, it's relevant
      if (descSkillMatches >= 5) {
        descriptionScore = 0.9;
      } else if (descSkillMatches >= 3) {
        descriptionScore = 0.7;
      } else if (descSkillMatches >= 1) {
        descriptionScore = 0.4;
      }
    }

    // Weighting: 45% Title, 25% Required Skills, 10% Preferred Skills, 20% Description Match
    // This way, even if the title is generic, strong description skill matches can push the score above 50%
    let overallScore = (titleScore * 0.45) + (requiredScore * 0.25) + (preferredScore * 0.10) + (descriptionScore * 0.20);

    // Minor bumps based on skills
    if (requiredMatches >= 3) overallScore += 0.1;

    return {
      overallScore: Math.min(overallScore, 0.99), // Cap at 99%
      details: {
        titleMatch: Math.round(titleScore * 100),
        skillsMatch: Math.round(requiredScore * 100),
        descriptionMatch: Math.round(descriptionScore * 100),
        reasons: [
          `Domain relevance: ${Math.round(titleScore * 100)}%`,
          `${requiredMatches}/${requiredSkillsLower.length} core skills matched`,
          `${preferredMatches}/${preferredSkillsLower.length} preferred skills matched`,
          descriptionScore > 0 ? `Description skill match: ${Math.round(descriptionScore * 100)}%` : null
        ].filter(Boolean)
      }
    };
  }

  /**
   * Extract ideal job titles from a user's profile using AI
   */
  async extractIdealJobTitles(portfolioData) {
    try {
      const { header = {}, workExperience = [], education = [] } = portfolioData;

      // Build context from portfolio
      const currentRole = workExperience && workExperience[0] && workExperience[0].title ? workExperience[0].title : '';
      const skills = (header.skills || []).slice(0, 10).join(', ');
      const experience = workExperience.map(e => e.title).join(', ');
      const degrees = education.map(e => e.degree).join(', ');

      const prompt = `Based on this professional profile, suggest 5 perfect job titles that would be an ideal match. Return only JSON with an array of job titles.

Profile:
- Current/Latest Role: ${currentRole}
- Skills: ${skills}
- Experience: ${experience}
- Education: ${degrees}
- Summary: ${portfolioData.summary || 'N/A'}

Return ONLY valid JSON in this format:
{
  "jobTitles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
}

Make sure titles are realistic job market positions.`;

      const result = await groqAI.generateContent(prompt);

      // Check for rate limit
      if (result && result.rateLimited) {
        console.warn('⚠️ AI rate limit hit, using default job titles');
        return this._getDefaultJobTitles(currentRole);
      }

      const responseText = result.response.text().trim();
      let jsonText = responseText;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonText);
      const titles = parsed.jobTitles || [];
      console.log('🎯 Extracted ideal job titles:', titles.join(', '));
      return titles.length > 0 ? titles : this._getDefaultJobTitles(currentRole);
    } catch (error) {
      console.warn('⚠️ Error extracting job titles:', error.message);
      const currentRole = portfolioData?.workExperience?.[0]?.title || 'Developer';
      return this._getDefaultJobTitles(currentRole);
    }
  }

  /**
   * Default job titles fallback
   */
  _getDefaultJobTitles(currentRole = '') {
    const titleMap = {
      'developer': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer', 'DevOps Engineer'],
      'engineer': ['Software Engineer', 'Data Engineer', 'ML Engineer', 'Platform Engineer', 'Infrastructure Engineer'],
      'designer': ['UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Web Designer', 'Design Lead'],
      'manager': ['Technical Lead', 'Engineering Manager', 'Product Manager', 'Project Manager', 'Team Lead'],
      'data': ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Analytics Engineer', 'BI Developer'],
      'analyst': ['Data Analyst', 'Business Analyst', 'Systems Analyst', 'Financial Analyst', 'Solutions Analyst']
    };

    const lower = (currentRole || '').toLowerCase();
    for (const [key, titles] of Object.entries(titleMap)) {
      if (lower.includes(key)) return titles;
    }
    return ['Full Stack Developer', 'Software Engineer', 'Backend Developer', 'Frontend Developer', 'Technical Lead'];
  }

  /**
   * Calculate years between two dates
   */
  calculateYearsDuration(startDate, endDate) {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);

    return Math.round(years * 10) / 10;
  }

  /**
   * Get recommendations for multiple users
   */
  async getRecommendationsForUsers(users, jobListings, topN = 5) {
    const results = [];

    for (const user of users) {
      try {
        const recommendations = await this.getJobRecommendations(
          user.portfolioData,
          jobListings,
          topN
        );
        results.push({
          userId: user._id,
          userName: user.name,
          recommendations
        });
      } catch (error) {
        console.error(`Error getting recommendations for user ${user.name}:`, error);
      }
    }

    return results;
  }


}

export default new JobRecommendationService();
