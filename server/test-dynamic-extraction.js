import dynamicDataExtractor from './utils/dynamicDataExtractor.js';

// Sample resume texts with different structures
const sampleResumes = [
  {
    name: "Traditional Resume",
    text: `
John Smith
Software Engineer
john.smith@email.com | +1-555-123-4567 | San Francisco, CA

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development, 
specializing in React, Node.js, and cloud technologies.

TECHNICAL SKILLS
Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Vue.js, Express.js, Django
Tools: Git, Docker, AWS, PostgreSQL

WORK EXPERIENCE
Senior Software Engineer | Tech Corp | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored junior developers and conducted code reviews

Software Engineer | StartUp Inc | 2019 - 2021
• Built responsive web applications using React and Node.js
• Integrated third-party APIs and payment systems
• Collaborated with design team to improve user experience

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2015-2019 | GPA: 3.8/4.0

PROJECTS
E-commerce Platform | React, Node.js, MongoDB
• Built full-stack e-commerce application with user authentication
• Implemented payment processing and inventory management
• Deployed on AWS with auto-scaling capabilities
    `
  },
  {
    name: "Creative Resume",
    text: `
🚀 ALEX JOHNSON 🚀
Creative Full-Stack Developer & UI/UX Enthusiast

📧 alex.johnson@creative.com | 📱 (555) 987-6543 | 🌐 alexjohnson.dev
📍 Portland, OR | 💼 LinkedIn: /in/alexjohnson | 🐙 GitHub: alexjohnson

✨ ABOUT ME
I'm a passionate developer who loves creating beautiful, functional applications 
that solve real-world problems. I thrive in collaborative environments and 
believe in writing clean, maintainable code.

🛠️ MY TOOLBOX
Frontend Magic: React ⚛️, Vue.js 💚, HTML5, CSS3, SASS
Backend Power: Node.js 🟢, Express, Python 🐍, Django
Database Wizardry: MongoDB 🍃, PostgreSQL 🐘, Firebase 🔥
Design Tools: Figma 🎨, Adobe Creative Suite, Sketch

💼 WORK JOURNEY
🏢 Lead Frontend Developer @ DesignTech Studio (2022-Present)
   → Spearheaded redesign of company's main product, increasing user engagement by 40%
   → Built reusable component library used across 5+ projects
   → Mentored 3 junior developers in modern React practices

🏢 Full-Stack Developer @ Innovation Labs (2020-2022)
   → Created responsive web applications serving 10,000+ daily users
   → Implemented real-time features using WebSocket technology
   → Optimized application performance, reducing load times by 50%

🎓 LEARNING PATH
🎓 B.A. in Graphic Design & Computer Science
    Portland State University | 2016-2020 | Magna Cum Laude

📜 CERTIFICATIONS
✅ AWS Certified Developer Associate (2023)
✅ Google UX Design Certificate (2022)
✅ MongoDB Certified Developer (2021)

🚀 FEATURED PROJECTS
💡 "TaskFlow" - Productivity App
   Built with React Native & Firebase | 1000+ downloads
   → Real-time collaboration features
   → Cross-platform mobile application
   → Integrated push notifications & offline sync

💡 "EcoTracker" - Environmental Impact Dashboard  
   React + D3.js + Python API | Winner of 2023 Hackathon
   → Interactive data visualizations
   → Machine learning predictions
   → RESTful API with 99.9% uptime

🏆 ACHIEVEMENTS
🥇 "Developer of the Year" - DesignTech Studio (2023)
🥈 2nd Place - Portland Tech Hackathon (2023)
🎯 Contributed to 15+ open-source projects
📝 Published 10+ technical blog articles with 50K+ views
    `
  },
  {
    name: "Academic Resume",
    text: `
Dr. Sarah Chen, Ph.D.
Research Scientist | Data Science & Machine Learning
Email: sarah.chen@university.edu
Phone: +1-555-456-7890
Address: 123 Research Ave, Boston, MA 02101
ORCID: 0000-0002-1234-5678

RESEARCH INTERESTS
Machine Learning, Natural Language Processing, Computer Vision, 
Deep Learning Applications in Healthcare

EDUCATION
Ph.D. in Computer Science, MIT, Cambridge, MA (2020)
Dissertation: "Deep Learning Approaches for Medical Image Analysis"
Advisor: Dr. John Williams

M.S. in Computer Science, Stanford University, CA (2016)
Thesis: "NLP Techniques for Clinical Text Mining"

B.S. in Mathematics, UC Berkeley, CA (2014)
Summa Cum Laude, Phi Beta Kappa

PROFESSIONAL EXPERIENCE
Senior Research Scientist
Boston Medical AI Lab, 2021-Present
- Lead research on AI applications in radiology
- Manage team of 5 research assistants
- Secured $2M in NSF funding for medical AI research

Postdoctoral Research Fellow
Harvard Medical School, 2020-2021  
- Developed CNN models for cancer detection
- Published 8 papers in top-tier journals
- Collaborated with clinicians on AI implementation

PUBLICATIONS (Selected)
1. Chen, S., et al. (2023). "Automated Diagnosis Using Deep Learning." 
   Nature Medicine, 45(2), 123-138. [Impact Factor: 53.4]

2. Chen, S., Williams, J. (2022). "Transfer Learning in Medical Imaging." 
   IEEE Transactions on Medical Imaging, 41(8), 2156-2167. [Cited 156 times]

3. Chen, S., et al. (2021). "Multi-modal Learning for Clinical Prediction." 
   NEJM AI, 3(4), 445-461.

GRANTS AND FUNDING
- NSF Career Award: "AI for Precision Medicine" ($500K, 2023-2028) - PI
- NIH R01: "Deep Learning for Drug Discovery" ($1.2M, 2022-2025) - Co-PI
- Google Research Award: "Federated Learning in Healthcare" ($50K, 2022)

TECHNICAL SKILLS
Programming: Python, R, MATLAB, C++, SQL
ML/AI Frameworks: TensorFlow, PyTorch, Scikit-learn, Keras
Cloud Platforms: AWS, Google Cloud, Azure
Specialized Tools: DICOM, ITK, SimpleITK, OpenCV

LANGUAGES
English (Native), Mandarin (Fluent), Spanish (Conversational)

PROFESSIONAL SERVICE
- Reviewer: Nature, Science, NEJM, JAMA
- Program Committee: ICML, NeurIPS, ICCV, MICCAI
- Editorial Board Member: Journal of Medical AI (2022-Present)

HONORS AND AWARDS
- MIT Outstanding Thesis Award (2020)
- Best Paper Award, MICCAI Conference (2019)
- Google PhD Fellowship in Machine Learning (2018-2020)
- NSF Graduate Research Fellowship (2016-2020)
    `
  }
];

async function testDynamicExtraction() {
  console.log('🧪 Testing Dynamic Resume Extraction System');
  console.log('='.repeat(60));

  for (const [index, resume] of sampleResumes.entries()) {
    console.log(`\n📄 Testing Resume ${index + 1}: ${resume.name}`);
    console.log('-'.repeat(40));
    
    try {
      const startTime = Date.now();
      const result = await dynamicDataExtractor.extractDynamicStructure(resume.text);
      const endTime = Date.now();
      
      if (result.success) {
        const data = result.data;
        
        console.log(`✅ Extraction successful in ${endTime - startTime}ms`);
        console.log(`📊 Statistics:`);
        console.log(`   • Sections found: ${data.sections.length}`);
        console.log(`   • Fields extracted: ${data.metadata.fieldsExtracted}`);
        console.log(`   • AI Confidence: ${(data.aiConfidence * 100).toFixed(1)}%`);
        console.log(`   • Completeness: ${data.completenessScore}%`);
        console.log(`   • Method: ${data.extractionMethod}`);
        
        console.log(`\n📋 Sections detected:`);
        data.sections.forEach((section, i) => {
          const fieldCount = (section.fields || []).length;
          const itemCount = (section.items || []).length;
          const totalFields = fieldCount + (section.items || []).reduce((sum, item) => sum + (item.fields || []).length, 0);
          
          console.log(`   ${i + 1}. ${section.title} (${section.type})`);
          console.log(`      Layout: ${section.layout} | Fields: ${totalFields} | Items: ${itemCount}`);
          
          // Show sample fields
          if (section.fields && section.fields.length > 0) {
            section.fields.slice(0, 2).forEach(field => {
              const value = Array.isArray(field.value) ? `[${field.value.length} items]` : 
                           typeof field.value === 'string' ? field.value.substring(0, 50) + '...' : field.value;
              console.log(`         • ${field.displayName}: ${value}`);
            });
          }
          
          // Show sample items
          if (section.items && section.items.length > 0) {
            console.log(`         Items: ${section.items.length} entries`);
            if (section.items[0] && section.items[0].fields) {
              const firstItem = section.items[0];
              const titleField = firstItem.fields.find(f => f.key === 'title' || f.key === 'name' || f.key === 'degree');
              if (titleField) {
                console.log(`         Example: "${titleField.value}"`);
              }
            }
          }
        });
        
      } else {
        console.log(`❌ Extraction failed: ${result.error}`);
        if (result.fallbackData) {
          console.log(`🔄 Using fallback data with ${result.fallbackData.sections.length} sections`);
        }
      }
      
    } catch (error) {
      console.log(`💥 Error during extraction: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Testing Static to Dynamic Conversion');
  console.log('-'.repeat(40));
  
  // Test static to dynamic conversion
  const staticData = {
    name: "Test User",
    email: "test@example.com", 
    phone: "+1-555-000-0000",
    summary: "Software developer with experience in web technologies",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    experience: [{
      title: "Software Engineer",
      company: "Tech Company",
      duration: "2022-2024",
      description: "Developed web applications and APIs"
    }],
    education: [{
      degree: "B.S. Computer Science",
      institution: "University",
      duration: "2018-2022",
      grade: "3.7 GPA"
    }],
    projects: [{
      title: "Web App",
      description: "Full-stack web application",
      technologies: ["React", "Node.js"],
      url: "https://example.com"
    }]
  };
  
  try {
    const converted = dynamicDataExtractor.convertStaticToDynamic(staticData);
    console.log(`✅ Conversion successful`);
    console.log(`📊 Converted ${converted.sections.length} sections`);
    console.log(`📈 Completeness: ${converted.completenessScore}%`);
    console.log(`🤖 Confidence: ${(converted.aiConfidence * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.log(`❌ Conversion failed: ${error.message}`);
  }
  
  console.log('\n✅ Testing completed!');
}

// Run the test
testDynamicExtraction().catch(console.error);
