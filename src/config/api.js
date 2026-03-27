// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD;
const configuredApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Debug logging
console.log('Environment MODE:', import.meta.env.MODE);
console.log('Is Development:', isDevelopment);
console.log('Is Production:', isProduction);
console.log('Configured VITE_API_BASE_URL:', configuredApiUrl || '(not set)');

// Local dev defaults to local backend.
// Production can either use same-origin API ("") or an external backend URL via VITE_API_BASE_URL.
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : (configuredApiUrl || '');

console.log('Selected API_BASE_URL:', API_BASE_URL);

export default API_BASE_URL;
