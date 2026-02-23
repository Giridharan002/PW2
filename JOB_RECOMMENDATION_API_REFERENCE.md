# 🎯 Job Recommendation API - Quick Reference

## 📡 Base URL
```
http://localhost:5000/api/jobs
```

## 🔑 Authentication
- Session-based: Use `sessionId` from user session
- User ID based: Use `userId` from portfolio

---

## 📋 Endpoint Summary

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `GET` | `/recommendations/:userId` | Get recommendations for user | Ranked job matches |
| `GET` | `/recommendations/session/:sessionId` | Get via session | Ranked job matches |
| `POST` | `/recommendations/analyze` | Score single job | Match analysis |
| `GET` | `/list` | Browse all jobs | Job listings |
| `POST` | `/fetch-fresh` | Refresh jobs from APIs | Success message |
| `GET` | `/stats` | View job statistics | Count & breakdown |
| `POST` | `/cleanup` | Delete old jobs | Count deleted |
| `GET` | `/top-companies` | Companies hiring | Top 10 companies |

---

## 🚀 Detailed Endpoints

### 1️⃣ Get Job Recommendations
```http
GET /recommendations/:userId?limit=10&location=San%20Francisco&experience=filter

Parameters:
  limit (number): Results to return (default: 10, max: 50)
  location (string, optional): Filter by location
  experience (string, optional): 'filter' to filter by user's experience level

Response: 200 OK
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
        "reasons": ["9.5 years matches requirement", "Expert in React"],
        "concerns": [],
        "recommendation": "Excellent match"
      },
      "requiredSkills": ["React", "JavaScript"],
      "preferredSkills": ["TypeScript"],
      "sourceUrl": "https://...",
      "source": "GitHub"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/jobs/recommendations/user123?limit=15"
```

**Example JavaScript:**
```javascript
const response = await fetch('/api/jobs/recommendations/user123?limit=15');
const data = await response.json();
console.log(data.recommendations);
```

---

### 2️⃣ Get Recommendations by Session
```http
GET /recommendations/session/:sessionId?limit=10

Parameters:
  sessionId (string): User session ID
  limit (number): Results to return

Response: Same as #1
```

**Example:**
```javascript
const response = await fetch(
  `/api/jobs/recommendations/session/${sessionId}?limit=10`
);
```

---

### 3️⃣ Analyze Single Job
```http
POST /recommendations/analyze
Content-Type: application/json

Request Body:
{
  "portfolio": {
    "header": { "name": "John Doe", "skills": ["React", "Node.js"] },
    "summary": "Full stack developer with 5 years experience",
    "workExperience": [...],
    "education": [...]
  },
  "job": {
    "title": "React Developer",
    "company": "TechCorp",
    "description": "Looking for React expert...",
    "requiredSkills": ["React", "JavaScript"],
    "experience": "3-5 years"
  }
}

Response: 200 OK
{
  "success": true,
  "jobTitle": "React Developer",
  "company": "TechCorp",
  "matchScore": 85,
  "analysis": {
    "skillsMatch": 90,
    "experienceMatch": 85,
    "locationMatch": 70,
    "reasons": ["Strong skill alignment"],
    "concerns": ["Location mismatch"],
    "recommendation": "Good match"
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/jobs/recommendations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": {...},
    "job": {...}
  }'
```

---

### 4️⃣ Get Job Listings
```http
GET /list?source=GitHub&location=San%20Francisco&limit=20&skip=0

Parameters:
  source (string, optional): GitHub, Indeed, LinkedIn, etc.
  location (string, optional): Job location filter
  limit (number): Items per page (default: 20, max: 100)
  skip (number): Pagination offset (default: 0)

Response: 200 OK
{
  "success": true,
  "totalJobs": 150,
  "jobsReturned": 20,
  "jobs": [
    {
      "_id": "...",
      "jobId": "github-123",
      "title": "Full Stack Developer",
      "company": "StartupXYZ",
      "location": "Remote",
      "jobType": "Full-time",
      "description": "We're hiring...",
      "requiredSkills": ["Node.js", "React"],
      "salaryRange": {
        "min": 120000,
        "max": 150000,
        "currency": "USD"
      },
      "source": "GitHub",
      "sourceUrl": "https://...",
      "postedDate": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 20,
    "hasMore": true
  }
}
```

**Example:**
```javascript
const response = await fetch('/api/jobs/list?limit=50&skip=0');
const { jobs, pagination } = await response.json();
```

---

### 5️⃣ Fetch Fresh Jobs
```http
POST /fetch-fresh

Response: 200 OK
{
  "success": true,
  "message": "Successfully fetched and saved fresh job listings",
  "totalFetched": 48,
  "totalSaved": 48,
  "sources": ["GitHub"]
}
```

**Example:**
```javascript
await fetch('/api/jobs/fetch-fresh', { method: 'POST' });
```

---

### 6️⃣ Get Statistics
```http
GET /stats

Response: 200 OK
{
  "success": true,
  "statistics": {
    "totalActiveJobs": 150,
    "bySource": {
      "GitHub": 48,
      "Custom": 102
    },
    "byType": {
      "Full-time": 100,
      "Contract": 50
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "latestJobs": [
    {
      "title": "React Developer",
      "company": "TechCorp",
      "postedDate": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### 7️⃣ Cleanup Old Jobs
```http
POST /cleanup

Request Body:
{
  "daysOld": 30  // Delete jobs older than 30 days
}

Response: 200 OK
{
  "success": true,
  "message": "Cleaned up old job listings",
  "jobsDeleted": 25
}
```

---

### 8️⃣ Get Top Companies
```http
GET /top-companies

Response: 200 OK
{
  "success": true,
  "topCompanies": [
    {
      "company": "TechCorp",
      "openPositions": 12
    },
    {
      "company": "StartupXYZ",
      "openPositions": 8
    }
  ]
}
```

---

## 🔍 Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Max 50, results per request |
| `skip` | number | 0 | Pagination offset |
| `location` | string | - | Filter by location |
| `source` | string | - | Job source (GitHub, Indeed, etc) |
| `experience` | string | - | 'filter' to apply exp filtering |
| `daysOld` | number | 30 | For cleanup endpoint |

---

## ⚡ Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Job data returned |
| 400 | Bad Request | Missing required params |
| 401 | Unauthorized | Invalid session/user |
| 404 | Not Found | Portfolio doesn't exist |
| 500 | Server Error | Groq API error, DB error |

---

## 📊 Match Score Interpretation

```
90-100 ✅ EXCELLENT MATCH
        - Highly qualified
        - Most skills align
        - Experience fits perfectly

75-89  ✨ GOOD MATCH
        - Qualified for role
        - Most skills present
        - Experience is relevant

60-74  👍 MODERATE MATCH
        - Can do the job
        - Some skill gaps
        - Experience might be low

40-59  🤔 FAIR MATCH
        - Could work
        - Significant gaps
        - Career pivot needed

0-39   ❌ POOR MATCH
        - Not recommended
        - Major skill gaps
        - Wrong experience level
```

---

## 🛠️ JavaScript Client Examples

### Fetch Recommendations
```javascript
async function getJobRecommendations(userId, limit = 10) {
  try {
    const response = await fetch(
      `/api/jobs/recommendations/${userId}?limit=${limit}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
const { recommendations } = await getJobRecommendations('user123', 15);
recommendations.forEach(job => {
  console.log(`${job.title} at ${job.company} - ${job.matchScore}% match`);
});
```

### Fetch Fresh Jobs
```javascript
async function refreshJobs() {
  try {
    const response = await fetch('/api/jobs/fetch-fresh', { 
      method: 'POST' 
    });
    const data = await response.json();
    console.log(`Fetched ${data.totalFetched} jobs`);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Search Jobs
```javascript
async function searchJobs(location = '', limit = 20) {
  const params = new URLSearchParams({
    location,
    limit
  });
  
  const response = await fetch(`/api/jobs/list?${params}`);
  return await response.json();
}

// Usage
const { jobs } = await searchJobs('San Francisco', 50);
```

---

## 🚀 Rate Limiting Notes

Current limits (can be adjusted):
- Recommendations: 1 per 10 seconds per user
- Fresh fetch: 1 per hour globally
- Cleanup: 1 per day
- Stats: Unlimited

---

## 🔗 Related Documentation

- **Full Guide**: `JOB_RECOMMENDATION_GUIDE.md`
- **Integration**: `JOB_RECOMMENDATION_INTEGRATION.md`
- **Component**: `src/components/JobRecommendations.jsx`

---

## 💡 Tips

1. **Cache Fresh Fetches**
   - First call triggers API fetch
   - Subsequent calls use cached data (24h)
   - Call `/fetch-fresh` to force refresh

2. **Optimize Requests**
   - Always set reasonable `limit`
   - Use pagination with `skip` for large results
   - Filter by source/location to reduce data

3. **Monitor Performance**
   - Check `/stats` to see data size
   - Run cleanup regularly for old jobs
   - Monitor Groq API response times

4. **Error Handling**
   - Always check `success` field
   - Handle 404 for missing users
   - Retry on 500 (server errors)

---

## ❓ FAQ

**Q: How often are jobs updated?**
A: Every 24 hours (cached). Call `/fetch-fresh` to force immediate update.

**Q: Can I use custom job sources?**
A: Yes! Edit `jobFetcher.js` to add more APIs.

**Q: Is there a free tier?**
A: Yes! GitHub Jobs API is free and no key required.

**Q: How accurate are the matches?**
A: Very! Groq AI understands context and provides detailed explanations.

**Q: Can I save favorite jobs?**
A: Not yet, but easy to add! Create a user preferences collection.

---

**Last Updated**: February 7, 2026
**API Version**: 1.0
