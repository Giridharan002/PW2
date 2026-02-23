# 🏗️ System Architecture & Data Flow

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  JobRecommendations Component (src/components/)             │   │
│  │  ├─ Displays job list with match scores                     │   │
│  │  ├─ Filter & search interface                               │   │
│  │  ├─ Interactive job details                                 │   │
│  │  └─ Apply buttons & external links                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↕ HTTP                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Calls                                                   │   │
│  │  ├─ GET /api/jobs/recommendations/:userId                   │   │
│  │  ├─ GET /api/jobs/list                                      │   │
│  │  ├─ POST /api/jobs/fetch-fresh                              │   │
│  │  └─ GET /api/jobs/stats                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Routes (server/routes/jobs.js)                              │   │
│  │  ├─ GET /recommendations/:userId      → fetch & recommend   │   │
│  │  ├─ GET /list                         → browse jobs         │   │
│  │  ├─ POST /fetch-fresh                 → fetch from APIs     │   │
│  │  ├─ GET /stats                        → show statistics     │   │
│  │  └─ POST /cleanup                     → delete old jobs     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Business Logic)                    │
│  ┌──────────────────────────────────────────────┐                   │
│  │ Job Recommendation Service                   │                   │
│  │ server/utils/jobRecommendationService.js     │                   │
│  │ ├─ getJobRecommendations()                   │                   │
│  │ ├─ scoreJobMatch()      [Uses GROQ AI]        │                   │
│  │ ├─ buildUserProfile()                         │                   │
│  │ └─ fallbackScoring()    [Skill matching]      │                   │
│  └──────────────────────────────────────────────┘                   │
│  ┌──────────────────────────────────────────────┐                   │
│  │ Job Fetcher Service                          │                   │
│  │ server/utils/jobFetcher.js                   │                   │
│  │ ├─ fetchGitHubJobs()                         │                   │
│  │ ├─ fetchFromJSearchAPI()                     │                   │
│  │ ├─ fetchSampleJobs()                         │                   │
│  │ └─ extractSkillsFromDescription()            │                   │
│  └──────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
         ↕ (AI Analysis)      ↕ (Job Fetching)     ↕ (Data)
┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   GROQ AI API       │  │   JOB APIs       │  │    MongoDB       │
│ (for matching)      │  │ ┌──────────────┐ │  │                  │
│                     │  │ │ GitHub Jobs  │ │  │ Collections:     │
│ - Analyzes resume   │  │ └──────────────┘ │  │ ├─ users         │
│ - Scores against    │  │ ┌──────────────┐ │  │ ├─ portfolios    │
│   job desc          │  │ │ JSearch API  │ │  │ ├─ joblistings  │
│ - Provides reasons  │  │ └──────────────┘ │  │ └─ (Indexes)    │
│                     │  │ ┌──────────────┐ │  │                  │
│                     │  │ │ Sample Jobs  │ │  │ Queries:         │
│                     │  │ └──────────────┘ │  │ ├─ Find by userId │
│                     │  └──────────────────┘  │ ├─ Find by skills │
│                     │                        │ ├─ Find by source │
│                     │                        │ └─ Aggregations  │
└─────────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔄 Data Flow: User Gets Recommendations

```
1. USER ACTION
   └─ User lands on /jobs dashboard
   └─ Component loads with userId

2. COMPONENT INITIALIZATION
   └─ JobRecommendations component mounts
   └─ Calls fetchRecommendations()

3. API REQUEST
   └─ GET /api/jobs/recommendations/user123?limit=10,location=SF

4. BACKEND PROCESSING
   └─ Route handler in jobs.js:
      ├─ Fetch user's portfolio from MongoDB
      ├─ Check if jobs cached & valid
      └─ Call jobRecommendationService.getJobRecommendations()

5. JOB RETRIEVAL
   └─ jobFetcher checks:
      ├─ MongoDB for active jobs (if empty or expired)
      └─ Hit APIs:
         ├─ GitHub Jobs API
         ├─ JSearch API (if key configured)
         └─ Sample jobs (fallback)

6. SAVE JOBS
   └─ Store fetched jobs in MongoDB
   └─ Set cache for 24 hours

7. AI MATCHING
   └─ For each job, call scoreJobMatch():
      ├─ Build user profile from portfolio
      ├─ Send to Groq AI:
         ├─ User skills, experience, education
         ├─ Job description, requirements
         └─ Prompt for detailed analysis
      └─ Receive:
         ├─ Overall score (0-1)
         ├─ Category scores
         ├─ Reasons for match
         └─ Recommendation level

8. RANKING
   └─ Sort by score (highest first)
   └─ Return top N results

9. RESPONSE
   └─ Send to frontend:
      {
        recommendations: [
          {
            rank: 1,
            jobId: "...",
            title: "...",
            matchScore: 92,
            matchDetails: { ... }
          },
          ...
        ]
      }

10. UI RENDERING
    └─ Component receives data
    └─ Renders job cards with:
       ├─ Match score colored badge
       ├─ Company, location, type
       ├─ Skills breakdown
       ├─ Match reasons
       └─ Apply button

11. USER INTERACTION
    └─ User can:
       ├─ Click job → view details
       ├─ Click apply → external link
       ├─ Filter results → refetch
       └─ Fetch fresh → trigger refresh
```

---

## 🗄️ Database Schema

### JobListing Collection
```javascript
{
  _id: ObjectId,
  
  // Required fields
  jobId: String (unique),      // e.g., "github-12345"
  title: String,               // e.g., "Senior React Dev"
  company: String,             // e.g., "TechCorp"
  description: String,         // Full job description
  
  // Job details
  location: String,            // City, region, remote
  jobType: String,            // Full-time, Part-time, etc.
  experience: String,          // e.g., "3-5 years"
  requiredSkills: [String],   // e.g., ["React", "Node.js"]
  preferredSkills: [String],  // e.g., ["TypeScript"]
  
  // Compensation
  salaryRange: {
    min: Number,              // e.g., 120000
    max: Number,              // e.g., 150000
    currency: String          // e.g., "USD"
  },
  
  // Source tracking
  source: String,             // GitHub, Indeed, Custom, etc.
  sourceUrl: String,          // Direct link to job
  postedDate: Date,          // When posted
  expiryDate: Date,          // When expires
  
  // Metadata
  tags: [String],            // Custom tags
  metadata: Mixed,           // Flexible field for extras
  
  // System fields
  createdAt: Date,           // When added to our DB
  updatedAt: Date,           // Last updated
  isActive: Boolean          // Whether to show in search
}
```

### Indexes (for performance)
```javascript
{
  jobId: 1 (unique),
  source: 1, isActive: 1,
  requiredSkills: 1,
  company: 1, isActive: 1,
  createdAt: 1 (TTL)
}
```

---

## 🔄 Request/Response Examples

### Recommendation Request Flow

```
┌─────────────────────────────────┐
│ Frontend                        │
└────────────┬────────────────────┘
             │ GET /api/jobs/recommendations/user123?limit=10
             ↓
┌─────────────────────────────────┐
│ API Handler (jobs.js)           │
├─────────────────────────────────┤
│ 1. Validate userId              │
│ 2. Fetch Portfolio from DB      │
│ 3. Get jobs (DB or fetch fresh) │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Job Recommendation Service      │
├─────────────────────────────────┤
│ For each job:                   │
│  1. Build user profile          │
│  2. Call scoreJobMatch()        │
│  3. Get AI response             │
│  4. Aggregate score             │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Groq AI (For each job)          │
├─────────────────────────────────┤
│ Input: Resume + Job Description │
│ Process: LLM Analysis           │
│ Output: Match Scores & Reasons  │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Sort & Rank Results             │
├─────────────────────────────────┤
│ 1. Highest scores first         │
│ 2. Top 10 (or specified limit)  │
│ 3. Format response              │
└────────────┬────────────────────┘
             │
             ↓ JSON Response
┌─────────────────────────────────┐
│ Frontend Component              │
├─────────────────────────────────┤
│ 1. Receive data                 │
│ 2. Render job cards             │
│ 3. Display scores & reasons     │
└─────────────────────────────────┘
```

---

## 📊 Component Props & State

### JobRecommendations Props
```typescript
interface Props {
  userId?: string;           // User ID (primary method)
  sessionId?: string;        // Session ID (alternative)
  apiBaseUrl?: string;       // Default: http://localhost:5000
}
```

### Internal State
```typescript
{
  recommendations: Job[];    // Fetched recommendations
  loading: boolean;          // API call in progress
  error: string | null;      // Error message if any
  filter: {                  // Filter settings
    limit: number;           // Results to show
    location: string;        // Filter by location
    experience: boolean;     // Filter by experience
  };
  selectedJob: Job | null;   // Currently expanded job
  stats: Statistics | null;  // Job statistics
}
```

---

## 🔌 API Endpoints Map

```
/api/jobs
├─ GET /recommendations/:userId
│  └─ Query: limit, location, experience
│
├─ GET /recommendations/session/:sessionId
│  └─ Query: limit
│
├─ POST /recommendations/analyze
│  └─ Body: { portfolio, job }
│
├─ GET /list
│  └─ Query: source, location, limit, skip
│
├─ POST /fetch-fresh
│  └─ No params (triggers API fetch)
│
├─ GET /stats
│  └─ No params (returns job statistics)
│
├─ POST /cleanup
│  └─ Body: { daysOld }
│
└─ GET /top-companies
   └─ No params (returns top 10 companies)
```

---

## 🔐 Security Architecture

```
Request Security
├─ CORS validation (main server level)
├─ Session validation (jobs routes)
├─ Input sanitization (routes)
└─ Rate limiting (recommended to add)

Data Security
├─ Job data sanitization
├─ No sensitive user data in responses
├─ MongoDB injection prevention (Mongoose)
└─ XSS prevention (React escaping)

API Keys
├─ Groq API (secure in .env)
├─ JSearch API (optional, secure in .env)
└─ No keys exposed in frontend
```

---

## 📈 Performance Optimization

```
Caching Strategy
├─ In-Memory Cache (24 hours)
│  └─ jobFetcher.cache Map
│
├─ Database Cache
│  └─ MongoDB job collection
│
└─ Browser Cache
   └─ HTTP caching headers

Query Optimization
├─ MongoDB Indexes
│  ├─ jobId (unique)
│  ├─ source + isActive (compound)
│  └─ requiredSkills
│
└─ Pagination
   ├─ limit: max 50 jobs
   └─ skip: offset for pagination

AI Processing
├─ Sequential job analysis
├─ Groq API caching inherent
└─ Fallback to skill-based scoring
```

---

## 🚀 Deployment Architecture

### Local Development
```
Frontend:3000/5173
    ↓
Express Server:5000
    ↓
MongoDB:27017
```

### Production (Vercel)
```
Vercel Functions (Frontend + API)
    ↓
MongoDB Atlas (Cloud)
    ↓
External APIs (Groq, GitHub, etc.)
```

### Environment Configuration
```env
# Local
NODE_ENV=development
GROQ_API_KEY=xxx
MONGODB_URI=mongodb://localhost:27017/portfolio

# Production
NODE_ENV=production
GROQ_API_KEY=xxx
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
```

---

## 🔄 State Management Flow

```
User Component
    ↓
JobRecommendations (State)
├─ recommendations[]
├─ loading: boolean
├─ error: string
├─ filter: object
└─ selectedJob: object
    ↓
    ├─ API Call (fetch)
    ├─ Update Loading
    ├─ Process Response
    ├─ Update Recommendations
    └─ Render UI
```

---

## 📱 Responsive Design Breakpoints

```
Mobile (< 640px)
├─ Single column layout
├─ Compact match score
└─ Full-width cards

Tablet (640px - 1024px)
├─ 2 column grid
├─ Side-by-side details
└─ Optimized spacing

Desktop (> 1024px)
├─ 2-3 column layout
├─ Expanded details
└─ Full feature display
```

---

## 🔍 Search & Filter Logic

```
User wants:
  "React jobs in Remote"

Query Building:
  ├─ Parse location: "Remote"
  ├─ Set limit: 10
  ├─ Apply experience filter: optional
  └─ Build URL: /api/jobs/recommendations/user?limit=10&location=Remote

Backend Processing:
  ├─ Fetch all active jobs
  ├─ Filter by location (regex match)
  ├─ Filter by experience (if enabled)
  ├─ Filter by skills (AI-based)
  └─ Return ranked results
```

---

## 🏆 Architecture Strengths

✅ **Separation of Concerns**
   - UI (React) vs API vs Service vs Database

✅ **Caching at Multiple Levels**
   - Memory cache, DB cache, Browser cache

✅ **Scalability**
   - Can handle hundreds of jobs
   - Async AI processing
   - Database indexing

✅ **Maintainability**
   - Clear folder structure
   - Modular services
   - Well-documented

✅ **Extensibility**
   - Easy to add job sources
   - Easy to add features
   - Pluggable components

---

## 📐 Design Patterns Used

```
Service Layer Pattern
  └─ Business logic separated from routes

Repository Pattern
  └─ Data access through MongoDB models

Singleton Pattern
  └─ jobFetcher, jobRecommendationService

Observer Pattern
  └─ React state management

Factory Pattern
  └─ Job object creation
```

---

**Architecture Version**: 1.0
**Last Updated**: February 7, 2026
**Status**: Production Ready
