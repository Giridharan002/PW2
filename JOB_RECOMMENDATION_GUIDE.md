# Job Recommendation System - Complete Guide

## 🎯 Overview
This feature uses AI (powered by Groq) to match user resume content with relevant job listings from multiple job portals.

## ✨ Features
- **AI-Powered Matching** - Uses Groq AI to analyze resume and job descriptions
- **Multiple Job Sources** - GitHub Jobs, JSearch API, and sample jobs
- **Intelligent Filtering** - Filter by location, experience level, and job type
- **Match Scoring** - Get detailed match scores and recommendations
- **Caching** - Intelligent job caching to minimize API calls
- **Database Storage** - Jobs saved to MongoDB for quick retrieval

## 📁 New Files Created

### Backend
1. **Models**
   - `server/models/JobListing.js` - MongoDB schema for job listings

2. **Services**
   - `server/utils/jobRecommendationService.js` - AI-powered job matching logic
   - `server/utils/jobFetcher.js` - Job fetching from multiple sources

3. **Routes**
   - `server/routes/jobs.js` - Job recommendation API endpoints

## 🚀 API Endpoints

### Get Job Recommendations for User
```http
GET /api/jobs/recommendations/:userId?limit=10&location=San Francisco&experience=filter
```

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "totalJobsAnalyzed": 45,
  "recommendationsCount": 10,
  "recommendations": [
    {
      "rank": 1,
      "jobId": "job123",
      "title": "Senior React Developer",
      "company": "TechCorp",
      "location": "San Francisco, CA",
      "jobType": "Full-time",
      "matchScore": 92,
      "matchDetails": {
        "skillsMatch": 95,
        "experienceMatch": 90,
        "locationMatch": 100,
        "reasons": [
          "9.5 years of experience matches requirement",
          "Expert level in React and JavaScript",
          "Remote-friendly role aligns with your profile"
        ],
        "concerns": [],
        "recommendation": "Excellent match"
      },
      "sourceUrl": "https://example.com/job",
      "source": "GitHub",
      "requiredSkills": ["React", "JavaScript", "Node.js"],
      "preferredSkills": ["TypeScript", "GraphQL"]
    }
    // ... more recommendations
  ]
}
```

### Get Job Recommendations by Session
```http
GET /api/jobs/recommendations/session/:sessionId?limit=10
```

### Analyze a Specific Job Against Resume
```http
POST /api/jobs/recommendations/analyze
Content-Type: application/json

{
  "portfolio": { /* user's portfolio object */ },
  "job": { /* job object */ }
}
```

### Get Available Job Listings
```http
GET /api/jobs/list?source=GitHub&location=San Francisco&limit=20&skip=0
```

### Fetch Fresh Job Listings
```http
POST /api/jobs/fetch-fresh
```

### Get Job Statistics
```http
GET /api/jobs/stats
```

### Get Top Companies
```http
GET /api/jobs/top-companies
```

### Clean Up Old Jobs
```http
POST /api/jobs/cleanup
Content-Type: application/json

{
  "daysOld": 30
}
```

## 🔧 Configuration

### Environment Variables (Optional)
```env
# For JSearch API (optional - requires RapidAPI key)
JSEARCH_API_KEY=your-jsearch-api-key

# Existing variables
GROQ_API_KEY=your-groq-key
MONGODB_URI=your-mongodb-uri
```

## 📊 How It Works

### 1. User Requests Recommendations
- User calls `/api/jobs/recommendations/:userId`
- System fetches user's portfolio from database

### 2. Job Fetching
- System checks database for cached jobs
- If cache is old or empty, fetches fresh jobs from:
  - GitHub Jobs API (Free, no auth required)
  - JSearch API (Optional, requires API key)
  - Sample job listings (Fallback)

### 3. AI Matching
- For each job, Groq AI analyzes:
  - User's skills, experience, and education
  - Job requirements and description
  - Location compatibility
  
### 4. Scoring
- Groq assigns match scores (0-100):
  - **Skills Match**: How well skills align
  - **Experience Match**: Years of experience fit
  - **Location Match**: Geography compatibility
  - **Overall Score**: Weighted average

### 5. Ranking
- Jobs ranked by match score (highest first)
- Top N results returned with details

## 💡 Example Implementation

### Frontend - React Component
```jsx
import { useState, useEffect } from 'react';

function JobRecommendations({ userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/jobs/recommendations/${userId}?limit=15`
      );
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="recommendations">
      <h2>Recommended Jobs ({recommendations.length})</h2>
      {recommendations.map((job) => (
        <div key={job.jobId} className="job-card">
          <div className="header">
            <h3>{job.title}</h3>
            <span className="match-score">{job.matchScore}% Match</span>
          </div>
          <p className="company">{job.company}</p>
          <p className="location">{job.location}</p>
          
          <div className="match-breakdown">
            <span>Skills: {job.matchDetails.skillsMatch}%</span>
            <span>Experience: {job.matchDetails.experienceMatch}%</span>
          </div>

          <div className="reasons">
            <strong>Why recommended:</strong>
            <ul>
              {job.matchDetails.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
            View Job →
          </a>
        </div>
      ))}
    </div>
  );
}

export default JobRecommendations;
```

## 🎨 Styling with Tailwind
```jsx
<div className="bg-white rounded-lg shadow-md p-6 mb-4">
  <div className="flex justify-between items-center mb-2">
    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
    <span className={`px-3 py-1 rounded-full font-semibold ${
      job.matchScore >= 90 ? 'bg-green-100 text-green-800' :
      job.matchScore >= 75 ? 'bg-blue-100 text-blue-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      {job.matchScore}% Match
    </span>
  </div>
  
  <p className="text-gray-600">{job.company} • {job.location}</p>
  
  <div className="mt-4 grid grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-sm text-gray-600">Skills</div>
      <div className="text-lg font-bold text-blue-600">
        {job.matchDetails.skillsMatch}%
      </div>
    </div>
    <div className="text-center">
      <div className="text-sm text-gray-600">Experience</div>
      <div className="text-lg font-bold text-blue-600">
        {job.matchDetails.experienceMatch}%
      </div>
    </div>
    <div className="text-center">
      <div className="text-sm text-gray-600">Location</div>
      <div className="text-lg font-bold text-blue-600">
        {job.matchDetails.locationMatch}%
      </div>
    </div>
  </div>
</div>
```

## 🔄 Workflow

### Initial Setup
1. First user trigger calls `/api/jobs/fetch-fresh`
2. Jobs fetched from APIs and saved to MongoDB
3. Results cached for 24 hours

### Subsequent Requests
1. Check MongoDB for active jobs
2. Use cached jobs if within 24 hours
3. Score against user's resume using Groq AI
4. Return ranked recommendations

### Data Refresh
1. Run `/api/jobs/cleanup` daily to remove expired jobs
2. Run `/api/jobs/fetch-fresh` weekly for fresh listings
3. Can be automated with cron jobs or Vercel cron triggers

## 📈 Performance Considerations

### Caching Strategy
- **Job Cache**: 24 hours (configurable)
- **Database**: Stores all fetched jobs
- **Indexing**: MongoDB indexes on frequently queried fields

### Cost Optimization
- **GitHub Jobs API**: Free, no rate limits for basic usage
- **Groq API**: Free tier generous, suitable for production
- **MongoDB**: Standard indexing for fast queries

### Scalability
- Batch process recommendations for multiple users
- Implement queue system for large-scale recommendations
- Use pagination for large result sets

## 🛒 Integration with Portfolio Creator

When user creates portfolio, add job recommendations:
```jsx
function PortfolioCreator({ userId }) {
  // ... existing code ...
  
  return (
    <>
      <PortfolioForm />
      <JobRecommendations userId={userId} />
    </>
  );
}
```

## 🔐 Security Notes

- Validate userId before returning recommendations
- Use session validation for session-based endpoints
- Rate limit recommendation requests
- Sanitize job description data before storing

## 📝 Future Enhancements

1. **User Preferences**
   - Save job search preferences
   - Bookmarks/favorites
   - Notification on new matches

2. **Advanced Filtering**
   - Industry-specific recommendations
   - Salary range filtering
   - Remote vs on-site preferences

3. **Analytics**
   - Track which recommendations users click
   - Improve matching based on user behavior
   - A/B test different recommendation strategies

4. **Integration**
   - LinkedIn job scraping
   - Indeed API integration
   - Automatic job application tracking

## 🐛 Troubleshooting

### No Jobs Returned
- Check if jobs table is empty: `/api/jobs/stats`
- Run job fetch: `POST /api/jobs/fetch-fresh`
- Check MongoDB connection

### Low Match Scores
- Ensure resume data is comprehensive
- Add more skills to portfolio
- Consider sample job variations

### Slow Responses
- Check if Groq API is responding
- Review MongoDB query performance
- Increase cache duration

## 📞 Support
Check logs for detailed error messages:
```bash
# Watch server logs
tail -f server.log

# Check MongoDB collections
mongosh > db.joblistings.countDocuments()
```

---

**Happy Job Hunting! 🎉**
