import geminiAI from './geminiAI.js';

class DynamicDataExtractor {
  constructor() {
    // Common section types and their patterns
    this.sectionPatterns = {
      personal: ['personal', 'contact', 'about', 'profile'],
      summary: ['summary', 'objective', 'career objective', 'profile summary', 'professional summary'],
      skills: ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'tools'],
      experience: ['experience', 'work experience', 'employment', 'professional experience', 'career history', 'work history'],
      education: ['education', 'academic background', 'qualifications', 'academic qualifications'],
      projects: ['projects', 'portfolio', 'work samples', 'notable projects', 'key projects'],
      certifications: ['certifications', 'certificates', 'licenses', 'credentials'],
      achievements: ['achievements', 'accomplishments', 'awards', 'honors', 'recognition'],
      languages: ['languages', 'language skills', 'linguistic skills'],
      references: ['references', 'referees', 'recommendations']
    };

    // Field type detection patterns
    this.fieldTypePatterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[\d\s\-\(\)]{10,}$/,
      url: /^https?:\/\/|www\./,
      date: /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$|^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$|^[A-Za-z]{3,9}\s\d{4}$/,
      number: /^\d+\.?\d*$/
    };
  }

  async extractDynamicStructure(resumeText, partialData = {}) {
    try {
      console.log('🚀 Starting dynamic structure extraction...');
      
      // Step 1: Analyze the resume structure using AI
      const structureAnalysis = await this.analyzeResumeStructure(resumeText);
      
      // Step 2: Extract sections dynamically
      const sections = await this.extractSections(resumeText, structureAnalysis);
      
      // Step 3: Validate and enhance the extracted data
      const validatedSections = this.validateAndEnhanceSections(sections);
      
      // Step 4: Calculate confidence and completeness scores
      const confidence = this.calculateConfidenceScore(validatedSections);
      const completeness = this.calculateCompletenessScore(validatedSections);
      
      return {
        success: true,
        data: {
          sections: validatedSections,
          aiConfidence: confidence,
          completenessScore: completeness,
          extractionMethod: 'ai',
          metadata: {
            originalStructure: structureAnalysis,
            sectionsFound: validatedSections.length,
            fieldsExtracted: this.countTotalFields(validatedSections)
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Dynamic extraction failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackData: this.generateFallbackStructure()
      };
    }
  }

  async analyzeResumeStructure(resumeText) {
    const prompt = `
    Analyze this resume text and identify its structure. Return a JSON object with the following format:
    {
      "detectedSections": [
        {
          "title": "Section title as it appears in resume",
          "type": "One of: personal, summary, skills, experience, education, projects, certifications, achievements, languages, references, custom",
          "startPattern": "Pattern that indicates section start",
          "confidence": 0.95,
          "hasSubsections": true/false,
          "estimatedFields": 5
        }
      ],
      "overallStructure": "One of: traditional, modern, creative, technical, academic",
      "formatting": "One of: structured, semi-structured, unstructured",
      "complexity": "One of: simple, moderate, complex"
    }

    Resume text:
    ${resumeText}

    Focus on identifying:
    1. All major sections present
    2. How data is organized within each section
    3. Any unique or custom sections
    4. The overall formatting style
    
    Return only valid JSON, no additional text.
    `;

    try {
      const result = await geminiAI.model.generateContent(prompt);
      const response = await result.response;
      let cleanedResult = response.text().trim();
      
      // Clean up JSON response
      if (cleanedResult.startsWith('```json')) {
        cleanedResult = cleanedResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.warn('⚠️ Structure analysis failed, using fallback');
      return this.generateFallbackStructureAnalysis(resumeText);
    }
  }

  async extractSections(resumeText, structureAnalysis) {
    const sections = [];
    
    for (const sectionInfo of structureAnalysis.detectedSections) {
      try {
        console.log(`🔍 Extracting section: ${sectionInfo.title}`);
        
        const sectionData = await this.extractSectionData(
          resumeText, 
          sectionInfo, 
          structureAnalysis
        );
        
        if (sectionData) {
          sections.push(sectionData);
        }
      } catch (error) {
        console.error(`❌ Failed to extract section ${sectionInfo.title}:`, error);
      }
    }
    
    return sections;
  }

  async extractSectionData(resumeText, sectionInfo, structureAnalysis) {
    const prompt = `
    Extract data from the "${sectionInfo.title}" section of this resume. 
    
    Section type: ${sectionInfo.type}
    Overall structure: ${structureAnalysis.overallStructure}
    
    Return a JSON object with this structure:
    {
      "id": "unique-section-id",
      "title": "${sectionInfo.title}",
      "type": "${sectionInfo.type}",
      "order": 1,
      "isVisible": true,
      "layout": "single-column|two-column|grid|timeline|cards|list",
      "fields": [
        {
          "key": "field_key",
          "value": "extracted value",
          "type": "text|email|phone|url|date|number|array|richtext",
          "displayName": "Human readable name",
          "order": 1,
          "isRequired": true/false,
          "isVisible": true
        }
      ],
      "items": [
        {
          "id": "item-1",
          "fields": [/* same structure as fields above */],
          "order": 1
        }
      ]
    }
    
    Rules:
    1. For simple sections (personal, summary, skills), use "fields" array
    2. For complex sections with multiple entries (experience, education, projects), use "items" array
    3. Detect field types automatically (email, phone, url, date, etc.)
    4. Extract ALL available information, don't skip fields
    5. Use appropriate layout based on content complexity
    6. Maintain original formatting for rich text fields
    
    Resume text:
    ${resumeText}
    
    Focus only on the "${sectionInfo.title}" section. Return only valid JSON.
    `;

    try {
      const result = await geminiAI.model.generateContent(prompt);
      const response = await result.response;
      let cleanedResult = response.text().trim();
      
      if (cleanedResult.startsWith('```json')) {
        cleanedResult = cleanedResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      
      // Enhanced JSON cleaning to handle malformed AI responses
      cleanedResult = cleanedResult
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,\s*}/g, '}') // Remove trailing commas before }
        .replace(/,\s*]/g, ']') // Remove trailing commas before ]
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove additional control chars
        .replace(/([^\\])\\([^"\\\/bfnrtuvxfad0-9])/g, '$1\\\\$2') // Fix invalid escape sequences
        .replace(/"\s*([^":\s,}]+)\s*"/g, '"$1"') // Fix spacing in strings
        .replace(/\bNaN\b/g, '""') // Replace NaN with empty string
        .replace(/\bundefined\b/g, '""') // Replace undefined with empty string
        .replace(/\bnull\b/g, '""') // Replace null with empty string
        .replace(/([:{,\[]\s*)"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s*:/g, '$1"$2":') // Fix unquoted keys
        .replace(/:\s*"([^"]*?)"\s*([,}])/g, ': "$1"$2') // Fix string values
        .trim();
      
      let sectionData;
      try {
        sectionData = JSON.parse(cleanedResult);
      } catch (parseError) {
        console.error(`❌ JSON Parse Error for section ${sectionInfo.title}:`, parseError.message);
        console.error('Problematic JSON snippet:', cleanedResult.substring(0, 200) + '...');
        
        // Try to extract just the core data with regex as fallback
        try {
          const fallbackData = this.extractFallbackSectionData(cleanedResult, sectionInfo);
          if (fallbackData) {
            console.log(`✅ Using fallback extraction for ${sectionInfo.title}`);
            return fallbackData;
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback extraction also failed:`, fallbackError.message);
        }
        
        // Return minimal valid structure as last resort
        return {
          title: sectionInfo.title,
          type: 'custom',
          layout: 'list',
          order: 1,
          isVisible: true,
          items: [],
          fields: []
        };
      }
      
      // Auto-detect field types
      this.autoDetectFieldTypes(sectionData);
      
      // Clean up null values
      this.cleanupNullValues(sectionData);
      
      return sectionData;
    } catch (error) {
      console.error(`Failed to extract ${sectionInfo.title} section:`, error);
      return null;
    }
  }

  // Fallback method to extract basic data when JSON parsing fails
  extractFallbackSectionData(malformedJson, sectionInfo) {
    try {
      // Try to extract basic structure using regex patterns
      const titleMatch = malformedJson.match(/"title":\s*"([^"]+)"/);
      const typeMatch = malformedJson.match(/"type":\s*"([^"]+)"/);
      
      // Extract field values using regex
      const fieldMatches = [...malformedJson.matchAll(/"value":\s*"([^"]+)"/g)];
      const keyMatches = [...malformedJson.matchAll(/"key":\s*"([^"]+)"/g)];
      
      const fields = [];
      for (let i = 0; i < Math.min(fieldMatches.length, keyMatches.length); i++) {
        if (fieldMatches[i] && keyMatches[i] && fieldMatches[i][1] && keyMatches[i][1]) {
          fields.push({
            key: keyMatches[i][1],
            value: fieldMatches[i][1],
            type: 'text',
            displayName: this.humanizeKey(keyMatches[i][1]),
            order: i + 1,
            isRequired: false,
            isVisible: true
          });
        }
      }
      
      return {
        title: titleMatch ? titleMatch[1] : sectionInfo.title,
        type: this.validateSectionType(typeMatch ? typeMatch[1] : 'custom'),
        layout: 'list',
        order: 1,
        isVisible: true,
        items: fields.length > 0 ? [{
          id: `${sectionInfo.title.toLowerCase().replace(/\s+/g, '-')}-1`,
          order: 1,
          fields: fields
        }] : [],
        fields: []
      };
    } catch (error) {
      throw new Error(`Fallback extraction failed: ${error.message}`);
    }
  }

  // Validate section type against allowed values
  validateSectionType(type) {
    const validTypes = ['personal', 'summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'languages', 'achievements', 'references', 'custom'];
    const typeMapping = {
      'list': 'custom',
      'work': 'experience',
      'employment': 'experience',
      'qualification': 'education',
      'academic': 'education',
      'research': 'projects',
      'award': 'achievements'
    };
    
    if (validTypes.includes(type)) {
      return type;
    }
    
    return typeMapping[type.toLowerCase()] || 'custom';
  }

  autoDetectFieldTypes(sectionData) {
    // Process fields in the section
    if (sectionData.fields) {
      sectionData.fields.forEach(field => {
        field.type = this.detectFieldType(field.value, field.key);
      });
    }
    
    // Process fields in items
    if (sectionData.items) {
      sectionData.items.forEach(item => {
        if (item.fields) {
          item.fields.forEach(field => {
            field.type = this.detectFieldType(field.value, field.key);
          });
        }
      });
    }
  }

  detectFieldType(value, key) {
    if (!value) return 'text';
    
    const valueStr = String(value);
    const keyLower = key.toLowerCase();
    
    // Check patterns
    if (this.fieldTypePatterns.email.test(valueStr)) return 'email';
    if (this.fieldTypePatterns.phone.test(valueStr)) return 'phone';
    if (this.fieldTypePatterns.url.test(valueStr)) return 'url';
    if (this.fieldTypePatterns.date.test(valueStr)) return 'date';
    if (this.fieldTypePatterns.number.test(valueStr)) return 'number';
    
    // Check by key name
    if (keyLower.includes('email')) return 'email';
    if (keyLower.includes('phone') || keyLower.includes('mobile')) return 'phone';
    if (keyLower.includes('url') || keyLower.includes('website') || keyLower.includes('link')) return 'url';
    if (keyLower.includes('date') || keyLower.includes('duration')) return 'date';
    if (keyLower.includes('description') || keyLower.includes('summary')) return 'richtext';
    
    // Check for arrays
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    
    return 'text';
  }

  validateAndEnhanceSections(sections) {
    return sections.map((section, index) => {
      // Ensure required properties
      section.id = section.id || `section-${section.type}-${index}`;
      section.order = section.order || index + 1;
      section.isVisible = section.isVisible !== false;
      section.layout = section.layout || 'single-column';
      section.metadata = section.metadata || new Map();
      
      // Validate fields
      if (section.fields) {
        section.fields = this.validateFields(section.fields);
      }
      
      // Validate items
      if (section.items) {
        section.items = section.items.map((item, itemIndex) => {
          item.id = item.id || `${section.id}-item-${itemIndex}`;
          item.order = item.order || itemIndex + 1;
          item.metadata = item.metadata || new Map();
          
          if (item.fields) {
            item.fields = this.validateFields(item.fields);
          }
          
          return item;
        });
      }
      
      return section;
    });
  }

  validateFields(fields) {
    return fields.map((field, index) => {
      field.key = field.key || `field-${index}`;
      field.value = field.value ?? ''; // Convert null/undefined to empty string
      field.displayName = field.displayName || this.humanizeKey(field.key);
      field.type = field.type || 'text';
      field.order = field.order || index + 1;
      field.isRequired = field.isRequired || false;
      field.isVisible = field.isVisible !== false;
      field.metadata = field.metadata || new Map();
      
      return field;
    });
  }

  cleanupNullValues(sectionData) {
    // Clean up fields
    if (sectionData.fields) {
      sectionData.fields.forEach(field => {
        if (field.value === null || field.value === undefined) {
          field.value = field.type === 'array' ? [] : '';
        }
      });
    }
    
    // Clean up items
    if (sectionData.items) {
      sectionData.items.forEach(item => {
        if (item.fields) {
          item.fields.forEach(field => {
            if (field.value === null || field.value === undefined) {
              field.value = field.type === 'array' ? [] : '';
            }
          });
        }
      });
    }
  }

  humanizeKey(key) {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  calculateConfidenceScore(sections) {
    if (!sections.length) return 0;
    
    let totalScore = 0;
    let sectionCount = 0;
    
    sections.forEach(section => {
      let sectionScore = 0.5; // Base score for detecting section
      
      // Add score for fields
      if (section.fields && section.fields.length > 0) {
        sectionScore += 0.3;
        
        // Bonus for required fields
        const requiredFields = section.fields.filter(f => f.isRequired);
        if (requiredFields.length > 0) {
          sectionScore += 0.1;
        }
      }
      
      // Add score for items
      if (section.items && section.items.length > 0) {
        sectionScore += 0.2;
        
        // Bonus for complete items
        const completeItems = section.items.filter(item => 
          item.fields && item.fields.every(f => f.value && f.value !== '')
        );
        if (completeItems.length > 0) {
          sectionScore += 0.1;
        }
      }
      
      totalScore += Math.min(sectionScore, 1.0);
      sectionCount++;
    });
    
    return Math.round((totalScore / sectionCount) * 100) / 100;
  }

  calculateCompletenessScore(sections) {
    let totalFields = 0;
    let filledFields = 0;
    
    sections.forEach(section => {
      if (section.fields) {
        section.fields.forEach(field => {
          totalFields++;
          if (field.value && field.value !== '') {
            filledFields++;
          }
        });
      }
      
      if (section.items) {
        section.items.forEach(item => {
          if (item.fields) {
            item.fields.forEach(field => {
              totalFields++;
              if (field.value && field.value !== '') {
                filledFields++;
              }
            });
          }
        });
      }
    });
    
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  countTotalFields(sections) {
    let count = 0;
    
    sections.forEach(section => {
      if (section.fields) count += section.fields.length;
      if (section.items) {
        section.items.forEach(item => {
          if (item.fields) count += item.fields.length;
        });
      }
    });
    
    return count;
  }

  generateFallbackStructureAnalysis(resumeText) {
    const words = resumeText.toLowerCase();
    const detectedSections = [];
    
    // Basic pattern detection
    Object.entries(this.sectionPatterns).forEach(([type, patterns]) => {
      const found = patterns.some(pattern => words.includes(pattern));
      if (found) {
        detectedSections.push({
          title: type.charAt(0).toUpperCase() + type.slice(1),
          type: type,
          startPattern: patterns[0],
          confidence: 0.7,
          hasSubsections: ['experience', 'education', 'projects', 'certifications'].includes(type),
          estimatedFields: type === 'personal' ? 5 : 3
        });
      }
    });
    
    return {
      detectedSections,
      overallStructure: 'traditional',
      formatting: 'semi-structured',
      complexity: 'moderate'
    };
  }

  generateFallbackStructure() {
    return {
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          type: 'personal',
          order: 1,
          isVisible: true,
          layout: 'single-column',
          fields: [
            { key: 'name', value: '', type: 'text', displayName: 'Full Name', order: 1, isRequired: true, isVisible: true },
            { key: 'email', value: '', type: 'email', displayName: 'Email', order: 2, isRequired: true, isVisible: true },
            { key: 'phone', value: '', type: 'phone', displayName: 'Phone', order: 3, isRequired: false, isVisible: true }
          ],
          items: []
        }
      ],
      aiConfidence: 0.3,
      completenessScore: 0,
      extractionMethod: 'fallback'
    };
  }

  // Convert old static portfolio format to dynamic format
  convertStaticToDynamic(staticData) {
    const sections = [];
    
    // Personal Information
    const personalFields = [];
    if (staticData.name) personalFields.push({ key: 'name', value: staticData.name, type: 'text', displayName: 'Name', order: 1 });
    if (staticData.email) personalFields.push({ key: 'email', value: staticData.email, type: 'email', displayName: 'Email', order: 2 });
    if (staticData.phone) personalFields.push({ key: 'phone', value: staticData.phone, type: 'phone', displayName: 'Phone', order: 3 });
    if (staticData.address) personalFields.push({ key: 'address', value: staticData.address, type: 'text', displayName: 'Address', order: 4 });
    
    if (personalFields.length > 0) {
      sections.push({
        id: 'personal',
        title: 'Personal Information',
        type: 'personal',
        order: 1,
        layout: 'two-column',
        fields: personalFields,
        items: []
      });
    }
    
    // Summary
    if (staticData.summary) {
      sections.push({
        id: 'summary',
        title: 'Professional Summary',
        type: 'summary',
        order: 2,
        layout: 'single-column',
        fields: [{ key: 'summary', value: staticData.summary, type: 'richtext', displayName: 'Summary', order: 1 }],
        items: []
      });
    }
    
    // Skills
    if (staticData.skills && staticData.skills.length > 0) {
      sections.push({
        id: 'skills',
        title: 'Skills',
        type: 'skills',
        order: 3,
        layout: 'grid',
        fields: [{ key: 'skills', value: staticData.skills, type: 'array', displayName: 'Skills', order: 1 }],
        items: []
      });
    }
    
    // Experience
    if (staticData.experience && staticData.experience.length > 0) {
      const experienceItems = staticData.experience.map((exp, index) => ({
        id: `experience-${index}`,
        order: index + 1,
        fields: [
          { key: 'title', value: exp.title, type: 'text', displayName: 'Job Title', order: 1 },
          { key: 'company', value: exp.company, type: 'text', displayName: 'Company', order: 2 },
          { key: 'duration', value: exp.duration, type: 'text', displayName: 'Duration', order: 3 },
          { key: 'description', value: exp.description, type: 'richtext', displayName: 'Description', order: 4 }
        ]
      }));
      
      sections.push({
        id: 'experience',
        title: 'Work Experience',
        type: 'experience',
        order: 4,
        layout: 'timeline',
        fields: [],
        items: experienceItems
      });
    }
    
    // Education
    if (staticData.education && staticData.education.length > 0) {
      const educationItems = staticData.education.map((edu, index) => ({
        id: `education-${index}`,
        order: index + 1,
        fields: [
          { key: 'degree', value: edu.degree, type: 'text', displayName: 'Degree', order: 1 },
          { key: 'institution', value: edu.institution, type: 'text', displayName: 'Institution', order: 2 },
          { key: 'duration', value: edu.duration, type: 'text', displayName: 'Duration', order: 3 },
          { key: 'grade', value: edu.grade, type: 'text', displayName: 'Grade', order: 4 }
        ]
      }));
      
      sections.push({
        id: 'education',
        title: 'Education',
        type: 'education',
        order: 5,
        layout: 'timeline',
        fields: [],
        items: educationItems
      });
    }
    
    // Projects
    if (staticData.projects && staticData.projects.length > 0) {
      const projectItems = staticData.projects.map((proj, index) => ({
        id: `project-${index}`,
        order: index + 1,
        fields: [
          { key: 'title', value: proj.title, type: 'text', displayName: 'Project Title', order: 1 },
          { key: 'description', value: proj.description, type: 'richtext', displayName: 'Description', order: 2 },
          { key: 'technologies', value: proj.technologies, type: 'array', displayName: 'Technologies', order: 3 },
          { key: 'url', value: proj.url, type: 'url', displayName: 'Project URL', order: 4 }
        ]
      }));
      
      sections.push({
        id: 'projects',
        title: 'Projects',
        type: 'projects',
        order: 6,
        layout: 'cards',
        fields: [],
        items: projectItems
      });
    }
    
    return {
      sections,
      aiConfidence: 0.8,
      completenessScore: this.calculateCompletenessScore(sections),
      extractionMethod: 'hybrid'
    };
  }
}

export default new DynamicDataExtractor();
