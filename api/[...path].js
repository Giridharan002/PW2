// Vercel serverless function handler
import app from '../server/index.js';

// Export the Express app as a Vercel serverless function
export default async function handler(req, res) {
  return app(req, res);
}
