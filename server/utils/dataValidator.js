class DataValidator {
  constructor() {
    this.requiredFields = {
      personal: ['name', 'email'],
      optional: ['phone', 'address', 'summary'],
      arrays: ['skills', 'experience', 'education', 'projects']
    };
    
    this.fieldTypes = {
      email: 'email',
      phone: 'phone',
      name: 'text',
      address: 'text',
      summary: 'text'
    };
  }

  validateExtractedData(data) {
    const validation = {
      isValid: true,
      missingFields: [],
      invalidFields: [],
      suggestions: [],
      completenessScore: 0,
      issues: []
    };

    // Check required fields
    this.requiredFields.personal.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        validation.missingFields.push({
          field,
          type: 'required',
          message: `${field} is required but missing`,
          priority: 'high'
        });
        validation.isValid = false;
      }
    });

    // Check optional fields
    this.requiredFields.optional.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        validation.missingFields.push({
          field,
          type: 'optional',
          message: `${field} is missing`,
          priority: 'medium'
        });
      }
    });

    // Check array fields
    this.requiredFields.arrays.forEach(field => {
      if (!data[field] || !Array.isArray(data[field]) || data[field].length === 0) {
        validation.missingFields.push({
          field,
          type: 'array',
          message: `${field} section is empty`,
          priority: field === 'skills' ? 'high' : 'medium'
        });
      }
    });

    // Validate field formats
    this.validateFieldFormats(data, validation);

    // Calculate completeness score
    validation.completenessScore = this.calculateCompletenessScore(data);

    // Generate suggestions
    validation.suggestions = this.generateSuggestions(data, validation);

    return validation;
  }

  validateFieldFormats(data, validation) {
    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      validation.invalidFields.push({
        field: 'email',
        value: data.email,
        message: 'Email format appears invalid',
        suggestion: 'Please verify email format'
      });
    }

    // Validate phone format
    if (data.phone && !this.isValidPhone(data.phone)) {
      validation.invalidFields.push({
        field: 'phone',
        value: data.phone,
        message: 'Phone number format appears invalid',
        suggestion: 'Please verify phone number format'
      });
    }

    // Check for incomplete experience entries
    if (data.experience) {
      data.experience.forEach((exp, index) => {
        if (!exp.company || !exp.title || !exp.duration) {
          validation.issues.push({
            section: 'experience',
            index,
            message: `Experience entry ${index + 1} is incomplete`,
            missingFields: [
              !exp.company ? 'company' : null,
              !exp.title ? 'title' : null,
              !exp.duration ? 'duration' : null
            ].filter(Boolean)
          });
        }
      });
    }

    // Check for incomplete education entries
    if (data.education) {
      data.education.forEach((edu, index) => {
        if (!edu.institution || !edu.degree) {
          validation.issues.push({
            section: 'education',
            index,
            message: `Education entry ${index + 1} is incomplete`,
            missingFields: [
              !edu.institution ? 'institution' : null,
              !edu.degree ? 'degree' : null
            ].filter(Boolean)
          });
        }
      });
    }

    // Check for incomplete project entries
    if (data.projects) {
      data.projects.forEach((proj, index) => {
        if (!proj.title || !proj.description || !proj.technologies || proj.technologies.length === 0) {
          validation.issues.push({
            section: 'projects',
            index,
            message: `Project entry ${index + 1} is incomplete`,
            missingFields: [
              !proj.title ? 'title' : null,
              !proj.description ? 'description' : null,
              (!proj.technologies || proj.technologies.length === 0) ? 'technologies' : null
            ].filter(Boolean)
          });
        }
      });
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  }

  calculateCompletenessScore(data) {
    let totalFields = 0;
    let filledFields = 0;

    // Personal fields (weighted more heavily)
    this.requiredFields.personal.forEach(field => {
      totalFields += 2; // Weight required fields more
      if (data[field] && data[field].trim() !== '') {
        filledFields += 2;
      }
    });

    this.requiredFields.optional.forEach(field => {
      totalFields += 1;
      if (data[field] && data[field].trim() !== '') {
        filledFields += 1;
      }
    });

    // Array fields
    this.requiredFields.arrays.forEach(field => {
      totalFields += 1;
      if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
        filledFields += 1;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  generateSuggestions(data, validation) {
    const suggestions = [];

    // Missing personal info suggestions
    if (!data.phone) {
      suggestions.push({
        type: 'input',
        field: 'phone',
        message: 'Adding a phone number will help recruiters contact you',
        priority: 'medium'
      });
    }

    if (!data.summary) {
      suggestions.push({
        type: 'ai_enhance',
        field: 'summary',
        message: 'Generate a professional summary based on your experience',
        priority: 'medium'
      });
    }

    // Skills suggestions
    if (!data.skills || data.skills.length < 5) {
      suggestions.push({
        type: 'ai_enhance',
        field: 'skills',
        message: 'AI can suggest additional relevant skills based on your experience',
        priority: 'high'
      });
    }

    // Experience enhancement
    if (data.experience) {
      data.experience.forEach((exp, index) => {
        if (!exp.description || exp.description.length < 100) {
          suggestions.push({
            type: 'ai_enhance',
            field: `experience.${index}.description`,
            message: `Enhance description for ${exp.title} role`,
            priority: 'medium'
          });
        }
      });
    }

    // Project enhancement
    if (data.projects) {
      data.projects.forEach((proj, index) => {
        if (!proj.description || proj.description.length < 100) {
          suggestions.push({
            type: 'ai_enhance',
            field: `projects.${index}.description`,
            message: `Enhance description for ${proj.title} project`,
            priority: 'medium'
          });
        }
      });
    }

    return suggestions;
  }

  generateDefaults(data) {
    const defaults = { ...data };

    // Generate default values for missing fields
    if (!defaults.summary && (defaults.experience?.length > 0 || defaults.skills?.length > 0)) {
      defaults.summary = 'Professional with experience in various technologies and projects.';
    }

    if (!defaults.address) {
      defaults.address = 'Location available upon request';
    }

    // Ensure arrays exist
    if (!defaults.skills) defaults.skills = [];
    if (!defaults.experience) defaults.experience = [];
    if (!defaults.education) defaults.education = [];
    if (!defaults.projects) defaults.projects = [];

    return defaults;
  }
}

export default new DataValidator();
