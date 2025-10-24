import express from 'express';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import { pdfUpload, imageUpload } from '../middleware/upload.js';
import pdfProcessor from '../utils/pdfProcessor.js';
import geminiAI from '../utils/geminiAI.js';
import { refineResumeData, extractFallbackContacts } from '../utils/resumeRefiner.js';

const router = express.Router();

// Create portfolio from PDF (self.so's exact approach)
router.post('/user/:sessionId/portfolio', pdfUpload.single('file'), async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    console.log('📄 Processing PDF for portfolio creation...');

    // Extract text and attempt to pull an embedded photo
    const [extractedText, extractedPhotoUrl] = await Promise.all([
      pdfProcessor.extractTextFromPDF(req.file.buffer),
      pdfProcessor.extractFirstImageToFile(req.file.buffer),
    ]);
    console.log('🔍 PDF text extracted, starting AI processing...');

    // Enhanced prompt for better extraction (matching self.so quality) with persona-aware extras
    const prompt = `You are an expert resume parser and professional portfolio creator. Extract comprehensive information and build a JSON object for a portfolio.

## Instructions:
- Extract ALL available information including contact details, work experience, education, skills, and achievements
- If contact information is missing, leave those fields as empty strings
- Generate a professional "about" section that summarizes the person's experience and expertise
- Extract skills from the resume text and categorize them appropriately
- For work experience, extract company names, job titles, dates, locations, and detailed descriptions
- For education, extract degree names, institutions, and completion dates
- Be thorough and extract as much detail as possible from the resume text
- Format dates consistently (YYYY-MM or original format)
- Ensure all extracted information is accurate and professional
 - Detect the persona type from: academic, student, freelancer, professional. If uncertain, choose "professional".
 - Based on persona, optionally include extra sections. Do not fabricate. Include only sections clearly found in the resume. Examples:
   - Academic: publications (title, venue, year, authors, link), conferences (name, year, role, link), grants (title, agency, amount, year), supervision (student, degree, topic, year)
   - Student: projects (name, description, tech, link), coursework (name, grade), internships (company, role, start, end, description), hackathons (name, year, award)
   - Freelancer: services (name, description), caseStudies (client, project, outcome, link), clients (name, link), testimonials (author, content)
   - General extras: awards (title, issuer, year), certifications (name, issuer, year, credentialId, link), languages (name, level), volunteering (org, role, description)

## Required JSON Structure:
{
  "header": {
    "name": "Full Name (as it appears in resume)",
    "shortAbout": "Brief professional tagline or summary (1-2 sentences)",
    "location": "City, State/Country (if available)",
    "contacts": {
      "website": "Personal website URL or empty string",
      "email": "Email address (extract from resume)",
      "phone": "Phone number (extract from resume)",
      "twitter": "Twitter username or empty string",
      "linkedin": "LinkedIn username or empty string",
      "github": "GitHub username or empty string"
    },
    "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10"]
  },
  "summary": "Detailed professional summary paragraph (3-4 sentences describing experience, expertise, and career highlights)",
  "workExperience": [
    {
      "company": "Company/Institution Name",
      "link": "Company website or empty string",
      "location": "City, State or Remote",
      "contract": "Full-time, Part-time, Contract, or Academic",
      "title": "Job Title/Position",
      "start": "Start date (YYYY-MM or original format)",
      "end": "End date or 'Present'",
      "description": "Detailed job description with responsibilities, achievements, and key contributions"
    }
  ],
  "education": [
    {
      "school": "University/Institution Name",
      "degree": "Degree Name and Field of Study",
      "start": "Start year",
      "end": "End year or 'Present'"
    }
  ],
  "personaType": "academic | student | freelancer | professional | other",
  "extraSections": [
    { "key": "publications", "title": "Publications", "items": [{ "title": "", "venue": "", "year": "", "authors": "", "link": "" }] },
    { "key": "projects", "title": "Projects", "items": [{ "name": "", "description": "", "tech": [], "link": "" }] },
    { "key": "awards", "title": "Awards", "items": [{ "title": "", "issuer": "", "year": "", "link": "" }] }
  ]
}

## Resume text to analyze:
${extractedText}

Return only valid JSON, no additional text or formatting. Extract as much detail as possible from the resume text.`;

    const result = await geminiAI.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up the response to ensure it's valid JSON
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (text.startsWith('```')) {
      text = text.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let resumeData = {};
    try {
      resumeData = JSON.parse(text);
    } catch (e) {
      console.warn('⚠️ AI returned invalid JSON. Attempting minimal fallback contact extraction.');
      resumeData = { header: { contacts: extractFallbackContacts(extractedText), skills: [] }, summary: '', workExperience: [], education: [] };
    }

    // Refine/normalize for consistent quality
    resumeData = refineResumeData(resumeData);

    console.log('✅ Structured and refined data extracted');

    // Generate URL slug from name
    const portfolioName = resumeData.header?.name || user.name || 'portfolio';
    const baseSlug = portfolioName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);

    let uniqueSlug = baseSlug || `portfolio-${Date.now()}`;
    let counter = 1;

    while (true) {
      const existing = await Portfolio.findOne({ urlSlug: uniqueSlug });
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // If we extracted a photo, attach it
    if (extractedPhotoUrl) {
      resumeData.header = resumeData.header || {};
      resumeData.header.photoUrl = extractedPhotoUrl;
    }

    // Create portfolio with enhanced data structure
    const portfolio = new Portfolio({
      userId: user._id.toString(),
      urlSlug: uniqueSlug,
      title: req.body.title || 'Professional Portfolio',
      header: resumeData.header,
      summary: resumeData.summary,
      workExperience: resumeData.workExperience || [],
      education: resumeData.education || [],
      themeKey: req.body.themeKey || 'indigoPurple',
      personaType: resumeData.personaType || 'professional',
      extraSections: Array.isArray(resumeData.extraSections) ? resumeData.extraSections : [],
      isPublished: false
    });

    await portfolio.save();

    // Add to user's portfolios
    user.portfolios = user.portfolios || [];
    user.portfolios.push(portfolio._id);
    await user.save();

    console.log(`✅ Portfolio created: ${portfolio.urlSlug}`);

    res.json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio: portfolio
    });

  } catch (error) {
    console.error('❌ Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
});

// Upload portfolio photo and set header.photoUrl
router.post('/user/:sessionId/portfolio/:portfolioId/photo', imageUpload.single('image'), async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, userId: user._id.toString() });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    portfolio.header = portfolio.header || {};
    portfolio.header.photoUrl = relativeUrl;
    await portfolio.save();

    res.json({ success: true, message: 'Photo uploaded', photoUrl: relativeUrl, portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload photo', error: error.message });
  }
});

// Get user's portfolios
router.get('/user/:sessionId/portfolios', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const portfolios = await Portfolio.find({
      userId: user._id.toString()
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      portfolios: portfolios,
      total: portfolios.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

// Get portfolio by ID
router.get('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.portfolioId,
      userId: user._id.toString()
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.json({
      success: true,
      portfolio: portfolio
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Get public portfolio by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      urlSlug: req.params.slug,
      isPublished: true
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or not published'
      });
    }

    res.json({
      success: true,
      portfolio: portfolio
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Update portfolio
router.put('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.portfolioId,
      userId: user._id.toString()
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Update portfolio fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'userId' && key !== 'urlSlug') {
        portfolio[key] = req.body[key];
      }
    });

    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio: portfolio
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
});

// Toggle publish status
router.put('/user/:sessionId/portfolio/:portfolioId/publish', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.portfolioId,
      userId: user._id.toString()
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    portfolio.isPublished = req.body.isPublished;
    await portfolio.save();

    res.json({
      success: true,
      message: `Portfolio ${portfolio.isPublished ? 'published' : 'unpublished'} successfully`,
      portfolio: portfolio
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio status',
      error: error.message
    });
  }
});

// Delete portfolio
router.delete('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.portfolioId,
      userId: user._id.toString()
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Remove from user's portfolios
    user.portfolios = user.portfolios.filter(id => id.toString() !== portfolio._id.toString());
    await user.save();

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
});

export default router;
