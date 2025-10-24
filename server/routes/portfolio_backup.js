import express from 'express';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';
import dataValidator from '../utils/dataValidator.js';
import pdfProcessor from '../utils/pdfProcessor.js';
import geminiAI from '../utils/geminiAI.js';
import aiEnhancer from '../utils/aiEnhancer.js';

const router = express.Router();

// Function to extract structured data from resume text
function extractPortfolioData(text) {
  const data = {
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: []
  };

// Extract name - usually the first line or first few words
  console.log('🔍 Extracting Name...');
  const nameMatch = text.match(/^([A-Za-z\s]+)(?:\n|#|$)/m);
  if (nameMatch) {
    data.name = nameMatch[1].trim();
    console.log('✅ Extracted Name:', data.name);
  } else {
    console.warn('⚠️ Name extraction failed!');
  }

// Extract email - handle special characters
  console.log('🔍 Extracting Email...');
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || 
                     text.match(/#([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/) ||
                     text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+com)/);
  if (emailMatch) {
    data.email = emailMatch[1] || emailMatch[0];
    // Clean up email
    data.email = data.email.replace(/[^a-zA-Z0-9@._-]/g, '');
    console.log('✅ Extracted Email:', data.email);
  } else {
    console.warn('⚠️ Email extraction failed!');
  }

// Extract phone number
  console.log('🔍 Extracting Phone...');
  const phoneMatch = text.match(/(\+\d{1,3}[\s-]?)?\d{10,}/);
  if (phoneMatch) {
    data.phone = phoneMatch[0];
    console.log('✅ Extracted Phone:', data.phone);
  } else {
    console.warn('⚠️ Phone extraction failed!');
  }

// Extract skills - improved pattern
  console.log('🔍 Extracting Skills...');
  const skillsSection = text.match(/Skills[:\s]*(.*?)(?=\n(?:Experience|Education|Projects|Achievements|$))/is);
  if (skillsSection) {
    const skillsText = skillsSection[1];
    const allSkills = [];
    
    // Extract from different patterns
    const langMatch = skillsText.match(/Languages:[\s]*([^\n]+)/i);
    const toolsMatch = skillsText.match(/Tools:[\s]*([^\n]+)/i);
    const frameworksMatch = skillsText.match(/Frameworks:[\s]*([^\n]+)/i);
    const skillsMatch = skillsText.match(/Skills:[\s]*([^\n]+)/i);
    
[langMatch, toolsMatch, frameworksMatch, skillsMatch].forEach(match => {
      if (match) {
        const skills = match[1].split(/[,;]/).map(s => s.trim()).filter(s => s);
        allSkills.push(...skills);
      }
    });
    
    data.skills = [...new Set(allSkills)].slice(0, 20); // Remove duplicates and limit
    console.log('✅ Extracted Skills:', data.skills);
  } else {
    console.warn('⚠️ Skills extraction failed!');
  }

// Extract education - improved parsing
  console.log('🔍 Extracting Education...');
  const educationSection = text.match(/Education[:\s]*(.*?)(?=\n(?:Skills|Experience|Projects|$))/is);
  if (educationSection) {
    const educationText = educationSection[1];
    const lines = educationText.split('\n').filter(line => line.trim());
    
    let currentEntry = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is an institution line (contains years)
      if (trimmedLine.match(/\d{4}/)) {
        if (currentEntry) {
          data.education.push(currentEntry);
        }
        
        // Parse institution and duration
        const instMatch = trimmedLine.match(/^(.*?)(\d{4}\s*[–-]\s*\d{4}|\d{4})/);
        if (instMatch) {
          currentEntry = {
            institution: instMatch[1].trim(),
            degree: '',
            duration: instMatch[2].trim(),
            grade: ''
          };
        }
      } else if (currentEntry && trimmedLine.match(/(B\.Tech|M\.Tech|Bachelor|Master|Higher Secondary|Secondary)/i)) {
        currentEntry.degree = trimmedLine;
      } else if (currentEntry && trimmedLine.match(/(CGPA|Percentage|Grade)/i)) {
        currentEntry.grade = trimmedLine;
      }
    });
    
    if (currentEntry) {
      data.education.push(currentEntry);
    }
    console.log('✅ Extracted Education:', data.education);
  } else {
    console.warn('⚠️ Education extraction failed!');
  }

// Extract experience - improved parsing
  console.log('🔍 Extracting Experience...');
  const experienceSection = text.match(/Experience[:\s]*(.*?)(?=\n(?:Open Source|Projects|Education|$))/is);
  if (experienceSection) {
    const experienceText = experienceSection[1];
    const lines = experienceText.split('\n').filter(line => line.trim());
    
    let currentEntry = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a company/role line
      if (trimmedLine.match(/\|.*?\d{4}/)) {
        if (currentEntry) {
          data.experience.push(currentEntry);
        }
        
        // Parse company, title, and duration
        const parts = trimmedLine.split('|');
        if (parts.length >= 2) {
          const companyPart = parts[0].trim();
          const titleDurationPart = parts[1].trim();
          
          // Extract company and location
          const companyMatch = companyPart.match(/^(.*?)\s*[-–]\s*(.*)$/);
          const company = companyMatch ? companyMatch[1].trim() : companyPart;
          
          // Extract title and duration
          const titleMatch = titleDurationPart.match(/^(.*?)\s*([A-Z][a-z]+\.?\s*\d{4}\s*[–-]\s*[A-Z][a-z]+\.?\s*\d{4})/);
          const title = titleMatch ? titleMatch[1].trim() : titleDurationPart;
          const duration = titleMatch ? titleMatch[2].trim() : '';
          
          currentEntry = {
            company,
            title,
            duration,
            description: ''
          };
        }
      } else if (currentEntry && trimmedLine.startsWith('•')) {
        // This is a description point
        currentEntry.description += (currentEntry.description ? '\n' : '') + trimmedLine;
      } else if (currentEntry && trimmedLine && !trimmedLine.match(/^[A-Z].*\|/)) {
        // Continue description
        currentEntry.description += (currentEntry.description ? ' ' : '') + trimmedLine;
      }
    });
    
    if (currentEntry) {
      data.experience.push(currentEntry);
    }
    console.log('✅ Extracted Experience:', data.experience);
  } else {
    console.warn('⚠️ Experience extraction failed!');
  }

// Extract projects - improved parsing
  console.log('🔍 Extracting Projects...');
  const projectsSection = text.match(/Projects[:\s]*(.*?)$/is);
  if (projectsSection) {
    const projectsText = projectsSection[1];
    const lines = projectsText.split('\n').filter(line => line.trim());
    
    let currentEntry = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a project title line (contains | and not a bullet point)
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('•')) {
        if (currentEntry) {
          data.projects.push(currentEntry);
        }
        
        // Parse project title and technologies
        const parts = trimmedLine.split('|');
        if (parts.length >= 2) {
          const titlePart = parts[0].trim();
          const techPart = parts[1].trim();
          
          // Extract title and subtitle
          const titleMatch = titlePart.match(/^(.*?)\s*[–-]\s*(.*)$/);
          const title = titleMatch ? titleMatch[1].trim() : titlePart;
          const subtitle = titleMatch ? titleMatch[2].trim() : '';
          
          // Extract technologies
          const technologies = techPart.split(',').map(tech => tech.trim()).filter(tech => tech);
          
          currentEntry = {
            title,
            description: subtitle,
            technologies,
            url: ''
          };
        }
      } else if (currentEntry && trimmedLine.startsWith('•')) {
        // This is a description point
        currentEntry.description += (currentEntry.description ? '\n' : '') + trimmedLine;
      } else if (currentEntry && trimmedLine && !trimmedLine.includes('|')) {
        // Continue description
        currentEntry.description += (currentEntry.description ? ' ' : '') + trimmedLine;
      }
    });
    
    if (currentEntry) {
      data.projects.push(currentEntry);
    }
    console.log('✅ Extracted Projects:', data.projects);
  } else {
    console.warn('⚠️ Projects extraction failed!');
  }

  return data;
}

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Upload resume endpoint
router.post('/upload-resume', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('📄 Processing PDF:', req.file.originalname);
    // Log buffer type and length for debugging
    console.log('📦 req.file.buffer type:', typeof req.file.buffer);
    if (req.file.buffer) {
      console.log('📦 req.file.buffer length:', req.file.buffer.length);
    } else {
      console.log('❌ req.file.buffer is undefined or null!');
    }

    // Extract text from PDF using pdf-parse (with OCR fallback)
    let extractedText = '';
    try {
      extractedText = await pdfProcessor.extractTextFromPDF(req.file.buffer);
      console.log('✅ Extracted text:', extractedText);
    } catch (error) {
      console.error('❌ PDF extraction failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from PDF'
      });
    }

    // Extract fields from the text
    const extractedData = extractPortfolioData(extractedText);
    
    // Log extracted data for debugging
    console.log('📊 Extracted Data:');
    console.log('👤 Name:', extractedData.name);
    console.log('📧 Email:', extractedData.email);
    console.log('📞 Phone:', extractedData.phone);
    console.log('🎯 Skills:', extractedData.skills);
    console.log('🏢 Experience:', extractedData.experience.length, 'entries');
    console.log('🎓 Education:', extractedData.education.length, 'entries');
    console.log('🚀 Projects:', extractedData.projects.length, 'entries');
    
    let portfolioData = {
      name: extractedData.name || 'Unknown',
      email: extractedData.email || '',
      phone: extractedData.phone || '',
      summary: extractedData.summary || '',
      skills: extractedData.skills || [],
      experience: extractedData.experience || [],
      education: extractedData.education || [],
      projects: extractedData.projects || [],
      rawText: extractedText,
      aiEnhanced: false
    };

    portfolioData = dataValidator.generateDefaults(portfolioData);

    // Validate the extracted data
    const validation = dataValidator.validateExtractedData(portfolioData);
    
    // Save to database even if validation issues exist
    const portfolio = new Portfolio(portfolioData);
    await portfolio.save();

    console.log('✅ Portfolio saved to database');

    res.json({
      success: true,
      message: 'Resume processed and fields extracted successfully',
      data: portfolioData,
      portfolioId: portfolio._id,
      validation,
      needsEnhancement: validation.suggestions.length > 0
    });

  } catch (error) {
    console.error('❌ Resume processing error:', error);
    
    // Send a proper error response
    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all portfolios
router.get('/portfolios', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().select('-rawText');
    res.json({
      success: true,
      data: portfolios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

// Get single portfolio
router.get('/portfolio/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Enhance portfolio with AI
router.post('/enhance/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Get validation and suggestions
    const validation = dataValidator.validateExtractedData(portfolio);
    
    if (validation.suggestions.length === 0) {
      return res.json({
        success: true,
        message: 'No enhancements needed',
        data: portfolio
      });
    }

    // Apply AI enhancements
    const enhanced = await aiEnhancer.enhancePortfolioData(portfolio, validation.suggestions);
    
    // Update portfolio in database
    await Portfolio.findByIdAndUpdate(req.params.id, enhanced);
    
    res.json({
      success: true,
      message: 'Portfolio enhanced successfully',
      data: enhanced,
      enhancements: enhanced.aiEnhancements
    });

  } catch (error) {
    console.error('❌ Enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance portfolio',
      error: error.message
    });
  }
});

// Update portfolio manually
router.put('/portfolio/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
});

// Get validation for a portfolio
router.get('/validation/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const validation = dataValidator.validateExtractedData(portfolio);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate portfolio',
      error: error.message
    });
  }
});

// Test API key endpoint
router.get('/test-api', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'No API key configured'
      });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Say 'API key works perfectly!' in one sentence");
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: 'API key is valid!',
      aiResponse: text,
      apiKeyPreview: apiKey.substring(0, 10) + '...'
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'API key is invalid',
      error: error.message
    });
  }
});

// Add this route for testing PDF extraction
router.post('/test-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF uploaded' });
    }

    console.log('🧪 Testing PDF extraction...');
    const extractedText = await pdfProcessor.extractTextFromPDF(req.file.buffer);
    
    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedTextLength: extractedText.length,
      extractedTextPreview: extractedText.substring(0, 500),
      fullText: extractedText // Remove this in production
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to authenticate user session
async function authenticateUser(sessionId) {
  const user = await User.findOne({ sessionId });
  if (!user) {
    throw new Error('Invalid session');
  }
  return user;
}

// Helper function to generate URL slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug, userId, portfolioId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await Portfolio.findOne({ 
      urlSlug: slug, 
      _id: { $ne: portfolioId } 
    });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Create a new portfolio for a user
router.post('/user/:sessionId/portfolio', upload.single('pdf'), async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    
    let portfolioData = {};
    
    if (req.file) {
      // Process uploaded PDF
      console.log('📄 Processing PDF for user:', user.email);
      
      const extractedText = await pdfProcessor.extractTextFromPDF(req.file.buffer);
      const extractedData = extractPortfolioData(extractedText);
      
      portfolioData = {
        ...extractedData,
        rawText: extractedText,
        aiEnhanced: false
      };
    } else if (req.body) {
      // Manual portfolio creation
      portfolioData = { ...req.body };
      
      // Parse JSON strings for array fields
      const arrayFields = ['skills', 'experience', 'education', 'projects'];
      arrayFields.forEach(field => {
        if (typeof portfolioData[field] === 'string') {
          try {
            portfolioData[field] = JSON.parse(portfolioData[field]);
          } catch (e) {
            portfolioData[field] = [];
          }
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either upload a PDF or provide portfolio data'
      });
    }
    
    // Generate URL slug
    const baseSlug = generateSlug(portfolioData.name || user.name || 'portfolio');
    const uniqueSlug = await ensureUniqueSlug(baseSlug, user._id.toString());
    
    // Ensure required fields have values
    if (!portfolioData.name || portfolioData.name.trim() === '') {
      portfolioData.name = user.name || 'Portfolio';
    }
    
    // Create portfolio
    const portfolio = new Portfolio({
      ...dataValidator.generateDefaults(portfolioData),
      userId: user._id.toString(),
      urlSlug: uniqueSlug,
      isPublished: false
    });
    
    await portfolio.save();
    
    // Add to user's portfolios
    user.portfolios.push(portfolio._id);
    await user.save();
    
    res.json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio: portfolio,
      validation: dataValidator.validateExtractedData(portfolio)
    });
    
  } catch (error) {
    console.error('❌ Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to create portfolio',
      error: error.message
    });
  }
});

// Update portfolio URL slug
router.put('/user/:sessionId/portfolio/:portfolioId/slug', async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    const { slug } = req.body;
    
    if (!slug || !slug.match(/^[a-z0-9-]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
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
    
    // Check if slug is available
    const existingPortfolio = await Portfolio.findOne({ 
      urlSlug: slug,
      _id: { $ne: req.params.portfolioId }
    });
    
    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        message: 'This URL is already taken. Please choose a different one.'
      });
    }
    
    portfolio.urlSlug = slug;
    await portfolio.save();
    
    res.json({
      success: true,
      message: 'Portfolio URL updated successfully',
      portfolio: portfolio
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to update portfolio URL',
      error: error.message
    });
  }
});

// Publish/unpublish portfolio
router.put('/user/:sessionId/portfolio/:portfolioId/publish', async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    const { isPublished } = req.body;
    
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
    
    portfolio.isPublished = Boolean(isPublished);
    portfolio.publishedAt = isPublished ? new Date() : null;
    await portfolio.save();
    
    res.json({
      success: true,
      message: `Portfolio ${isPublished ? 'published' : 'unpublished'} successfully`,
      portfolio: portfolio,
      publicUrl: isPublished ? `/p/${portfolio.urlSlug}` : null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to update portfolio status',
      error: error.message
    });
  }
});

// Update user's portfolio
router.put('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    
    const portfolio = await Portfolio.findOneAndUpdate(
      {
        _id: req.params.portfolioId,
        userId: user._id.toString()
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio: portfolio
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to update portfolio',
      error: error.message
    });
  }
});

// Get user's specific portfolio
router.get('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    
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
      portfolio: portfolio,
      validation: dataValidator.validateExtractedData(portfolio)
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Delete user's portfolio
router.delete('/user/:sessionId/portfolio/:portfolioId', async (req, res) => {
  try {
    const user = await authenticateUser(req.params.sessionId);
    
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
    
    // Remove from user's portfolios array
    user.portfolios = user.portfolios.filter(id => !id.equals(portfolio._id));
    await user.save();
    
    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message === 'Invalid session' ? 'Authentication required' : 'Failed to delete portfolio',
      error: error.message
    });
  }
});

// Public route to view published portfolio by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      urlSlug: req.params.slug,
      isPublished: true
    }).select('-rawText -userId');
    
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

// Check if slug is available
router.get('/check-slug/:slug', async (req, res) => {
  try {
    const existing = await Portfolio.findOne({ urlSlug: req.params.slug });
    
    res.json({
      success: true,
      available: !existing
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check slug availability',
      error: error.message
    });
  }
});

// Debug route to list all published portfolios
router.get('/debug/published', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ isPublished: true }).select('name urlSlug isPublished publishedAt');
    
    res.json({
      success: true,
      count: portfolios.length,
      portfolios: portfolios
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published portfolios',
      error: error.message
    });
  }
});

export default router;
