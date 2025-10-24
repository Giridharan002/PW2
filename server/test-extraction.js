import fs from 'fs';

// Sample extracted text from the logs
const sampleText = `Giridharan #giridharan.contact@gmailcom §github.com/Giridharan002ïlinkedin.com/in/giri-dharan-667163260 ümedium.com/@giri.2004k Education National Engineering College2022 – 2026 B.Tech Artificial Intelligence and Data Science Current CGPA: 7.94/10.0 Mahendra Matric Hr. Sec. School May 2022 Higher Secondary Education Percentage: 89.00% Skills Languages: JavaScript, Python, Java, C++, SQL Tools: VS Code, Git, Github, Postman, MongoDB Compass, Firebase Frameworks: React, Node.js, Express, React Native Libraries: NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn Experience Software Developer Intern Company XYZ June 2023 – August 2023 • Developed web applications using React and Node.js • Collaborated with team to deliver projects on time Projects Linked In to Portfolio | React, Node.js, Express, Mongo DB, Gemini AI • Developed a full-stack web application that transforms Linked In profile PDFs into customizable digital portfolios and resumes with modern, classic, and elegant templates. • Engineered PDF parsing and data extraction, integrated Gemini AI for intelligent content enhancement, and implemented a dynamic theme selector for personalized user experience. • Built RESTful APIs for portfolio management, ensured seamless file uploads, and optimized the UI for responsiveness and accessibility across devices. RCAI – Rocket Chat AI | React, Node.js, Socket.io, OpenAI API • Built a real-time chat application with AI integration • Implemented user authentication and message history`;

console.log('🧪 Testing extraction patterns on sample text...');
console.log('📄 Sample text length:', sampleText.length);
console.log('📄 First 200 chars:', sampleText.substring(0, 200));

// Test Phone extraction
console.log('\n📱 Testing Phone extraction...');
const phonePatterns = [
  /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/, // Standard formats
  /(?:\+\d{1,3}[\s.-]?)?\d{10,15}/, // International formats
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/, // Basic US format
  /\b\d{10,15}\b/, // Simple digit sequence
  /\d{10}/, // Simple 10 digit
  /(?:\+91|91)?[\s-]?\d{10}/ // Indian format
];

phonePatterns.forEach((pattern, index) => {
  const match = sampleText.match(pattern);
  console.log(`Pattern ${index + 1}:`, pattern.toString(), '→', match ? match[0] : 'No match');
});

// Test Skills extraction
console.log('\n🎯 Testing Skills extraction...');
const skillsPatterns = [
  /Skills[\s:]*([^]*?)(?=Experience|Education|Projects|$)/i,
  /Languages:[\s]*([^\n]+)/i,
  /Tools:[\s]*([^\n]+)/i,
  /Frameworks:[\s]*([^\n]+)/i
];

skillsPatterns.forEach((pattern, index) => {
  const match = sampleText.match(pattern);
  console.log(`Skills Pattern ${index + 1}:`, pattern.toString());
  console.log('Match:', match ? match[1]?.substring(0, 100) : 'No match');
});

// Test Education extraction
console.log('\n🎓 Testing Education extraction...');
const educationPatterns = [
  /Education[\s:]*([^]*?)(?=Skills|Experience|Projects|$)/i,
  /(\w+.*?College.*?\d{4}.*?\d{4})/gi,
  /(National Engineering College2022 – 2026)/i
];

educationPatterns.forEach((pattern, index) => {
  const matches = sampleText.match(pattern);
  console.log(`Education Pattern ${index + 1}:`, pattern.toString());
  console.log('Match:', matches ? matches[1]?.substring(0, 100) || matches[0]?.substring(0, 100) : 'No match');
});

// Test Experience extraction
console.log('\n💼 Testing Experience extraction...');
const experiencePatterns = [
  /Experience[\s:]*([^]*?)(?=Projects|Education|Skills|$)/i,
  /(Software Developer.*?Intern.*?\d{4}.*?\d{4})/i,
  /(Company.*?\d{4}.*?\d{4})/i
];

experiencePatterns.forEach((pattern, index) => {
  const match = sampleText.match(pattern);
  console.log(`Experience Pattern ${index + 1}:`, pattern.toString());
  console.log('Match:', match ? match[1]?.substring(0, 100) || match[0]?.substring(0, 100) : 'No match');
});
