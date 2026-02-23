import { extractFallbackContacts, refineResumeData } from './resumeRefiner.js';

// Small curated skill keywords to look for as a light-weight fallback
const COMMON_SKILLS = [
  'JavaScript','TypeScript','React','Node.js','Express','MongoDB','SQL','Python','Django','Flask',
  'Java','Spring','AWS','GCP','Docker','Kubernetes','HTML','CSS','Sass','Tailwind','GraphQL',
  'REST','API','Redis','Postgres','CI/CD','Jest','Mocha','Testing','Machine Learning','TensorFlow',
  'Pandas','NumPy','Data Analysis','NLP'
];

export async function parseResumeFallback(rawText = '') {
  const text = String(rawText || '').trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Try to infer a name from the first non-empty line if it looks like a name
  let name = '';
  if (lines.length) {
    const first = lines[0];
    // Heuristic: first line with 2-4 words and letters
    if (/^[A-Za-z ,.'-]{3,}$/.test(first) && first.split(/\s+/).length <= 4) {
      name = first;
    }
  }

  const contacts = extractFallbackContacts(text || '');

  // Find matching skills from the short list
  const foundSkills = [];
  const lower = text.toLowerCase();
  for (const s of COMMON_SKILLS) {
    if (lower.includes(s.toLowerCase())) {
      foundSkills.push(s);
    }
    if (foundSkills.length >= 10) break;
  }

  // Fallback summary: first 2-3 lines joined
  const summary = lines.slice(0, 3).join(' ');

  const resumeData = {
    header: {
      name: name || '',
      shortAbout: '',
      location: '',
      contacts,
      skills: foundSkills
    },
    summary: summary || '',
    workExperience: [],
    education: [],
    personaType: 'professional',
    extraSections: []
  };

  // Refine for consistent output
  return refineResumeData(resumeData);
}

export default parseResumeFallback;
