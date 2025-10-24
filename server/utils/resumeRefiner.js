// Utility to refine and normalize AI-extracted resume data
// - Deduplicate/limit skills
// - Normalize social usernames
// - Strengthen summary if weak
// - Expand/clean work experience descriptions
// - Ensure education fields are consistent

function sanitizeUsernameFromUrl(value) {
	if (!value || typeof value !== 'string') return '';
	const v = value.trim();
	try {
		// If it's already a simple username (no spaces, no slashes), return cleaned
		if (!v.includes('http') && !v.includes('/')) {
			return v.replace(/^@/, '').replace(/\s+/g, '').trim();
		}
		// Extract last non-empty path segment
		const url = new URL(v.startsWith('http') ? v : `https://${v.replace(/^\/*/, '')}`);
		const parts = url.pathname.split('/').filter(Boolean);
		if (parts.length === 0) return '';
		return parts[parts.length - 1].replace(/^@/, '').replace(/\s+/g, '').trim();
	} catch (_) {
		// Fallback: strip protocol and take last segment
		const parts = v.replace(/^https?:\/\//, '').split('/').filter(Boolean);
		if (parts.length === 0) return '';
		return parts[parts.length - 1].replace(/^@/, '').replace(/\s+/g, '').trim();
	}
}

function dedupeAndLimitSkills(skills, limit = 10) {
	if (!Array.isArray(skills)) return [];
	const seen = new Set();
	const cleaned = [];
	for (const s of skills) {
		if (!s) continue;
		const skill = String(s).trim().replace(/\s+/g, ' ');
		const key = skill.toLowerCase();
		if (skill.length < 2) continue;
		if (!seen.has(key)) {
			seen.add(key);
			cleaned.push(skill);
		}
		if (cleaned.length >= limit) break;
	}
	return cleaned;
}

function strengthenSummary(summary, header) {
	const base = (summary || '').trim();
	if (base.length >= 180) return base; // already decent
	const name = header?.name || 'The candidate';
	const role = header?.shortAbout || '';
	const skillsLine = (header?.skills || []).slice(0, 4).join(', ');
	const pieces = [
		`${name} is a highly accomplished professional${role ? ` — ${role}` : ''}.`,
		skillsLine ? `Core strengths include ${skillsLine}.` : '',
		'Experienced in delivering measurable outcomes and collaborating across teams.'
	].filter(Boolean);
	return pieces.join(' ');
}

function normalizeContacts(contacts = {}) {
	const normalized = { ...contacts };
	if (normalized.linkedin) normalized.linkedin = sanitizeUsernameFromUrl(normalized.linkedin);
	if (normalized.twitter) normalized.twitter = sanitizeUsernameFromUrl(normalized.twitter);
	if (normalized.github) normalized.github = sanitizeUsernameFromUrl(normalized.github);
	// Keep phone/email/website as-is (trim)
	['email', 'phone', 'website'].forEach(k => {
		if (normalized[k]) normalized[k] = String(normalized[k]).trim();
	});
	return normalized;
}

function cleanDescription(text) {
	if (!text) return '';
	// Normalize bullet separators
	let t = String(text).replace(/\u2022|•|\-|–/g, '\n').replace(/\r/g, '');
	// Collapse multiple newlines
	t = t.split(/\n+/).map(s => s.trim()).filter(Boolean).join('\n');
	// Keep it within a reasonable length
	if (t.length > 1200) t = t.slice(0, 1200);
	return t;
}

function refineWorkExperience(items = []) {
	if (!Array.isArray(items)) return [];
	return items.map((item, idx) => {
		const refined = { ...item };
		refined.company = (refined.company || '').trim();
		refined.title = (refined.title || '').trim();
		refined.location = (refined.location || '').trim();
		refined.contract = (refined.contract || '').trim();
		refined.description = cleanDescription(refined.description || '');
		return refined;
	});
}

function refineEducation(items = []) {
	if (!Array.isArray(items)) return [];
	return items.map(e => ({
		school: (e.school || '').trim(),
		degree: (e.degree || '').trim(),
		start: (e.start || '').trim(),
		end: (e.end || '').trim()
	}));
}

export function refineResumeData(resumeData = {}) {
	const data = { ...resumeData };
	data.header = data.header || {};
	data.header.name = (data.header.name || '').trim();
	data.header.shortAbout = (data.header.shortAbout || '').trim();
	data.header.location = (data.header.location || '').trim();
	data.header.contacts = normalizeContacts(data.header.contacts || {});
	data.header.skills = dedupeAndLimitSkills(data.header.skills || [], 10);

	data.summary = strengthenSummary(data.summary || '', data.header);
	data.workExperience = refineWorkExperience(data.workExperience || []);
	data.education = refineEducation(data.education || []);
	return data;
}

// Simple fallback contact extraction from raw text (regex-based)
export function extractFallbackContacts(rawText = '') {
	if (!rawText) return {};
	const email = (rawText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i) || [])[0] || '';
	const phone = (rawText.match(/\+?\d[\d\s().-]{7,}/) || [])[0] || '';
	const linkedin = sanitizeUsernameFromUrl((rawText.match(/linkedin\.com\/[A-Za-z0-9_\-/]+/i) || [])[0] || '');
	const github = sanitizeUsernameFromUrl((rawText.match(/github\.com\/[A-Za-z0-9_\-/]+/i) || [])[0] || '');
	const twitter = sanitizeUsernameFromUrl((rawText.match(/(?:x\.com|twitter\.com)\/[A-Za-z0-9_\-/]+/i) || [])[0] || '');
	return { email, phone, linkedin, github, twitter };
}

