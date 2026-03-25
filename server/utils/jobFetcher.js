import axios from 'axios';
import JobListing from '../models/JobListing.js';
import { translate } from '@vitalets/google-translate-api';
import linkedIn from 'linkedin-jobs-api';

class JobFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Fetch jobs from Remotive (remote job board)
   * Public API: https://remotive.com/api/remote-jobs
   */
  async fetchRemotiveJobs(filters = {}) {
    try {
      console.log('🔄 Fetching jobs from Remotive...');
      const url = 'https://remotive.com/api/remote-jobs';

      const params = {};
      if (filters.search) params.search = filters.search;

      const response = await axios.get(url, { params, timeout: 15000 });
      if (!response.data || !Array.isArray(response.data.jobs)) return [];

      return response.data.jobs.map(job => ({
        jobId: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: job.description,
        sourceUrl: job.url,
        source: 'Remotive',
        jobType: job.job_type || 'Full-time',
        postedDate: new Date(job.publication_date),
        requiredSkills: job.tags && job.tags.length ? job.tags : this.extractSkillsFromDescription(job.description),
        preferredSkills: job.tags || [],
        salaryRange: job.salary && job.salary.length ? { raw: job.salary } : null,
        metadata: {
          category: job.category,
          job_type: job.job_type
        }
      }));
    } catch (error) {
      console.error('❌ Error fetching Remotive jobs:', error.message);
      return [];
    }
  }

  /**
   * Fetch jobs from ArbeitNow public API
   * Public API: https://www.arbeitnow.com/api/job-board-api
   */
  async fetchArbeitNowJobs(_filters = {}) {
    try {
      console.log('🔄 Fetching jobs from ArbeitNow...');
      const url = 'https://www.arbeitnow.com/api/job-board-api';

      const response = await axios.get(url, { timeout: 15000 });
      if (!response.data || !Array.isArray(response.data.data)) return [];

      return response.data.data.map(job => ({
        jobId: `arbeitnow-${job.slug || job.id}`,
        title: job.title,
        company: job.company_name || job.company || 'Unknown',
        location: job.location || job.remote ? 'Remote' : 'Various',
        description: job.description || job.content || '',
        sourceUrl: job.url || job.job_ad_url || `https://www.arbeitnow.com/job/${job.slug}`,
        source: 'ArbeitNow',
        jobType: job.job_type || 'Full-time',
        postedDate: job.created_at ? new Date(job.created_at) : new Date(),
        requiredSkills: this.extractSkillsFromDescription(job.description || ''),
        preferredSkills: [],
        metadata: {
          remote: job.remote || false
        }
      }));
    } catch (error) {
      console.error('❌ Error fetching ArbeitNow jobs:', error.message);
      return [];
    }
  }

  /**
   * Fetch jobs from LinkedIn using unofficial API
   * Public API: linkedin-jobs-api package
   */
  async fetchLinkedInJobs(keyword) {
    try {
      console.log(`🔄 Fetching jobs from LinkedIn for: ${keyword}...`);
      const queryOptions = {
        keyword: keyword,
        location: 'Remote',
        dateSincePosted: 'past Week',
        jobType: 'full time',
        remoteFilter: 'remote',
        limit: '10',
        sortBy: 'recent'
      };

      const response = await linkedIn.query(queryOptions);
      if (!response || !Array.isArray(response)) return [];

      return response.map((job, idx) => ({
        jobId: `linkedin-${job.jobUrl ? job.jobUrl.split('?')[0].split('-').pop() : (job.position + idx).replace(/\\s+/g, '')}`,
        title: job.position,
        company: job.company || 'Unknown',
        location: job.location || 'Remote',
        description: job.position + ' at ' + job.company, // API doesn't return full desc
        sourceUrl: job.jobUrl,
        source: 'LinkedIn',
        jobType: 'Full-time',
        postedDate: job.date ? new Date(job.date) : new Date(),
        requiredSkills: this.extractSkillsFromDescription(job.position),
        preferredSkills: [],
        metadata: {
          agoTime: job.agoTime,
          salaryRange: job.salary
        }
      }));
    } catch (error) {
      console.error('❌ Error fetching LinkedIn jobs:', error.message || error);
      return [];
    }
  }
  /**
   * Search for jobs across multiple APIs using search queries
   * Optimized: Parallel search across public boards and JSearch
   */
  async searchJobs(searchQueries = [], location = 'India') {
    if (searchQueries.length === 0) {
      searchQueries = [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'DevOps Engineer',
        'Data Scientist'
      ];
    }
    let allJobs = [];

    // 🔍 Search per-title using Remotive's search parameter and filter ArbeitNow locally
    console.log(`🔍 Searching boards for titles: ${searchQueries.slice(0, 10).join(', ')} (Location: ${location})`);

    // Fetch ArbeitNow once (we'll filter titles locally)
    const arbeitnowCache = await this.fetchArbeitNowJobs();

    for (const query of searchQueries.slice(0, 10)) {
      try {
        console.log(`🔎 Querying Remotive, LinkedIn, and Indeed (via JSearch) for: ${query}`);

        // 1. PUBLIC BOARDS (Fast)
        const [remotiveResults, linkedinResults] = await Promise.all([
          this.fetchRemotiveJobs({ search: query }),
          this.fetchLinkedInJobs(query)
        ]);

        // 2. JSEARCH (Indeed/Naukri/Glassdoor)
        // If we have a key, we use JSearch more proactively for better location targeting
        let jsearchJobs = [];
        if (process.env.JSEARCH_API_KEY) {
          jsearchJobs = await this.fetchFromJSearchAPI(query, location || 'India');
        }

        // Filter ArbeitNow results by title match (case-insensitive substring)
        const lowerQ = query.toLowerCase();
        const arbeitFiltered = (arbeitnowCache || []).filter(j => (j.title || '').toLowerCase().includes(lowerQ));

        allJobs.push(...remotiveResults, ...linkedinResults, ...arbeitFiltered, ...jsearchJobs);

        // Stop early if we have enough matches in one loop
        if (allJobs.length >= 200) break;
      } catch (err) {
        console.warn(`⚠️ Error searching for '${query}':`, err?.message || err);
      }
    }

    // Deduplicate by jobId or sourceUrl
    const seen = new Set();
    const deduped = [];
    for (const j of allJobs) {
      const key = j.jobId || j.sourceUrl || `${j.title}-${j.company}`;
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(j);
      }
    }

    // If still empty, load sample jobs
    if (deduped.length === 0) {
      return await this.fetchSampleJobs();
    }

    return deduped;
  }

  /**
   * Fetch jobs from JSearch API (via RapidAPI)
   * Requires API key in environment
   */
  async fetchFromJSearchAPI(position, location, filters = {}) {
    try {
      if (!process.env.JSEARCH_API_KEY) {
        console.warn('⚠️ JSearch API key not configured');
        return [];
      }

      console.log(`🔄 Fetching ${position} jobs in ${location}...`);

      const url = 'https://jsearch.p.rapidapi.com/search';

      const response = await axios.get(url, {
        params: {
          query: `${position} ${location}`,
          page: 1,
          num_pages: 3, // Increased from 1 to 3 to get more results
          ...filters
        },
        headers: {
          'x-rapidapi-key': process.env.JSEARCH_API_KEY,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        },
        timeout: 20000 // Increased from 10s to 20s for slower RapidAPI
      });

      if (!response.data?.data || !Array.isArray(response.data.data)) {
        return [];
      }

      return response.data.data.map(job => ({
        jobId: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city}, ${job.job_state}, ${job.job_country}`,
        description: job.job_description,
        sourceUrl: job.job_apply_link,
        source: job.job_publisher,
        jobType: job.job_employment_type,
        postedDate: new Date(job.job_posted_at_datetime_utc),
        requiredSkills: job.job_required_skills || [],
        salaryRange: job.job_salary_currency ? {
          min: job.job_salary_min,
          max: job.job_salary_max,
          currency: job.job_salary_currency
        } : null,
        metadata: {
          highlights: job.job_highlights,
          benefits: job.job_benefits
        }
      }));
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error(`⏱️ JSearch timeout for "${position}": request took too long (>20s)`);
      } else if (error.response?.status === 403) {
        console.error('❌ JSearch API key invalid or rate limited');
      } else {
        console.error('❌ Error fetching JSearch jobs:', error.message);
      }
      return [];
    }
  }

  /**
   * Fetch sample jobs (for demo/testing without API keys)
   */
  async fetchSampleJobs() {
    console.log('📝 Loading sample job listings...');

    return [
      {
        jobId: 'sample-1',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        experience: '3-5 years',
        description: `We're looking for an experienced Full Stack Developer to join our growing team. 
You'll work with React, Node.js, and MongoDB to build scalable web applications.
Experience with Docker, AWS, and CI/CD pipelines is a plus.`,
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
        preferredSkills: ['Docker', 'AWS', 'GraphQL', 'TypeScript'],
        source: 'Custom',
        sourceUrl: 'https://example.com/job/1',
        postedDate: new Date()
      },
      {
        jobId: 'sample-2',
        title: 'Data Scientist',
        company: 'DataInsights Inc',
        location: 'New York, NY',
        jobType: 'Full-time',
        experience: '2-4 years',
        description: `Join our Data Science team to work on ML models and data analysis.
Required: Python, SQL, Pandas, Scikit-learn
Nice to have: TensorFlow, PyTorch, Big Data technologies`,
        requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas'],
        preferredSkills: ['TensorFlow', 'PyTorch', 'Spark', 'Kafka'],
        source: 'Custom',
        sourceUrl: 'https://example.com/job/2',
        postedDate: new Date()
      },
      {
        jobId: 'sample-3',
        title: 'DevOps Engineer',
        company: 'CloudSys',
        location: 'Austin, TX',
        jobType: 'Full-time',
        experience: '2-3 years',
        description: `Help us manage and scale our infrastructure. 
Experience with Kubernetes, Docker, and cloud platforms required.
Configuration management and IaC experience a plus.`,
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
        preferredSkills: ['Terraform', 'Ansible', 'Prometheus', 'ELK Stack'],
        source: 'Custom',
        sourceUrl: 'https://example.com/job/3',
        postedDate: new Date()
      },
      {
        jobId: 'sample-4',
        title: 'Frontend Developer',
        company: 'WebDesigns Co',
        location: 'Remote',
        jobType: 'Full-time',
        experience: '1-3 years',
        description: `Build beautiful and responsive user interfaces with React.
We use modern CSS frameworks, state management libraries, and testing frameworks.
Passion for UI/UX and web accessibility required.`,
        requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'Responsive Design'],
        preferredSkills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React Testing Library'],
        source: 'Custom',
        sourceUrl: 'https://example.com/job/4',
        postedDate: new Date()
      }
    ];
  }

  /**
   * Extract skills from job description using simple parsing
   */
  extractSkillsFromDescription(description) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Git', 'Jenkins', 'GitLab CI', 'GitHub Actions',
      'HTML', 'CSS', 'TypeScript', 'SQL', 'NoSQL',
      'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
    ];

    const skills = [];
    const descLower = (description || '').toLowerCase();

    for (const skill of commonSkills) {
      if (descLower.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    }

    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Save jobs to database
   */
  async saveJobsToDB(jobs) {
    try {
      console.log(`💾 Saving & Translating ${jobs.length} jobs to database...`);

      const savedJobs = [];
      const batchTranslate = async (text) => {
        if (!text) return text;
        try {
          // Basic fast check to see if it even needs deep translation 
          // If we pass an empty string or it's just a number, avoid API hit
          if (text.length < 3) return text;
          const result = await translate(text, { to: 'en' });
          return result.text || text;
        } catch (e) {
          console.warn("⚠️ Translation warning:", e.message);
          return text; // fallback to original if translation fails
        }
      };

      for (const job of jobs) {
        try {
          // Check if we already have this job in the database.
          // If we do, we might not need to translate it again unless it was updated.
          const existingJob = await JobListing.findOne({ jobId: job.jobId });

          let finalTitle = job.title;
          let finalDescription = job.description;

          // Only perform the expensive/network translation if it's a NEW job
          if (!existingJob) {
            finalTitle = await batchTranslate(job.title);
            // description might be long HTML. The translate API handles HTML quite well natively.
            finalDescription = await batchTranslate(job.description);
          } else {
            finalTitle = existingJob.title;
            finalDescription = existingJob.description;
          }

          // Upsert: update if exists, insert if not
          const saved = await JobListing.findOneAndUpdate(
            { jobId: job.jobId },
            {
              ...job,
              title: finalTitle,
              description: finalDescription,
              updatedAt: new Date(),
              isActive: true
            },
            { upsert: true, new: true }
          );
          savedJobs.push(saved);
        } catch (error) {
          console.warn(`⚠️ Error saving job ${job.jobId}:`, error.message);
        }
      }

      console.log(`✅ Saved ${savedJobs.length} jobs to database`);
      return savedJobs;
    } catch (error) {
      console.error('❌ Error saving jobs:', error);
      throw error;
    }
  }

  /**
   * Get active jobs from database
   */
  async getActiveJobsFromDB(filters = {}) {
    try {
      const query = { isActive: true, ...filters };
      const jobs = await JobListing.find(query).limit(100);
      return jobs;
    } catch (error) {
      console.error('❌ Error fetching jobs from DB:', error);
      return [];
    }
  }

  /**
   * Fetch and cache jobs
   */
  async fetchAndCacheJobs(forceRefresh = false) {
    const cacheKey = 'jobs-cache';

    // Check cache
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < this.cacheExpiry) {
        console.log('📦 Using cached job listings');
        return cachedData.jobs;
      }
    }

    // Fetch fresh data
    console.log('🔄 Fetching fresh job listings...');

    let jobs = [];

    // Try search APIs first (with JSearch or public APIs)
    try {
      const searchResults = await this.searchJobs();
      jobs = [...jobs, ...searchResults];
    } catch (_err) {
      console.warn('⚠️ Search API fetch failed, continuing...');
    }

    // Try public APIs (Remotive, ArbeitNow)
    try {
      const remotiveJobs = await this.fetchRemotiveJobs();
      jobs = [...jobs, ...remotiveJobs];
    } catch (_err) {
      console.warn('⚠️ Remotive fetch failed, continuing...');
    }

    try {
      const arbeitJobs = await this.fetchArbeitNowJobs();
      jobs = [...jobs, ...arbeitJobs];
    } catch (_err) {
      console.warn('⚠️ ArbeitNow fetch failed, continuing...');
    }

    try {
      const githubJobs = await this.fetchGitHubJobs();
      jobs = [...jobs, ...githubJobs];
    } catch (_error) {
      console.warn('⚠️ GitHub Jobs fetch failed, continuing...');
    }

    // Add sample jobs if fetch failed or as supplement
    if (jobs.length < 5) {
      const sampleJobs = await this.fetchSampleJobs();
      jobs = [...jobs, ...sampleJobs];
    }

    // Save to database
    await this.saveJobsToDB(jobs);

    // Cache the result
    this.cache.set(cacheKey, {
      jobs,
      timestamp: Date.now()
    });

    return jobs;
  }

  /**
   * Clear outdated jobs from database
   */
  async cleanupOldJobs(daysOld = 30) {
    try {
      const expiryDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await JobListing.deleteMany({
        postedDate: { $lt: expiryDate }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old job listings`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up jobs:', error);
      return 0;
    }
  }
}

export default new JobFetcher();
