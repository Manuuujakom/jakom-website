// This file should be located at your-project-root/api/posters.js
// OR your-project-root/pages/api/posters.js if using Next.js.

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

// Define Cloudinary credentials using environment variables.
// This ensures they are clearly referenced and helps prevent issues
// during compilation from ESM to CommonJS or if process.env isn't
// fully populated at the earliest configuration point.
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary.
// !!! IMPORTANT !!!
// In your Vercel project settings (Environment Variables section):
// You MUST set these environment variables for "Production" AND "Preview" (or "All Environments"):
// CLOUDINARY_CLOUD_NAME = 'desvdirg3'
// CLOUDINARY_API_KEY = '385951568625369'
// CLOUDINARY_API_SECRET = '9juTKNOvK-deQTpc4NLLsr3Drew'
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // Ensures all URLs are HTTPS
});

/**
 * API handler function to fetch posters from Cloudinary.
 * This function is designed to work as a Node.js serverless API endpoint.
 *
 * @param {object} req - The request object (e.g., Vercel's IncomingMessage).
 * @param {object} res - The response object (e.g., Vercel's ServerResponse).
 */
export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // For public access
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight requests for 24 hours

  // Handle preflight requests for CORS (browser sends OPTIONS request first)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END CORS HEADERS ---

  try {
    // Validate Cloudinary configuration during execution
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error("Cloudinary environment variables are NOT set correctly at runtime. Values received: CLOUD_NAME:", CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET', ", API_KEY:", CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
      return res.status(500).json({
        error: "Server configuration error: Cloudinary credentials are missing or incorrect during execution.",
        details: "Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set as environment variables for Production AND Preview environments in your deployment platform."
      });
    }

    const folderName = 'portfolio';

    console.log(`Attempting to search Cloudinary for folder: ${folderName}`);

    const searchResult = await cloudinary.search
      .expression(`folder:"${folderName}"`)
      .max_results(100)
      .execute();

    console.log("Cloudinary Search Result:", JSON.stringify(searchResult, null, 2));

    if (!searchResult || !searchResult.resources || searchResult.resources.length === 0) {
      console.warn(`No resources found in Cloudinary folder: ${folderName}. Cloudinary response:`, searchResult);
      return res.status(200).json([]);
    }

    const posters = searchResult.resources.map((resource) => {
      const fileName = resource.public_id.split('/').pop();
      const title = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\.\w+$/, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        id: resource.public_id,
        imageUrl: resource.secure_url,
        title: title || 'Untitled Poster',
      };
    });

    res.status(200).json(posters);

  } catch (error) {
    console.error('CRITICAL ERROR fetching posters from Cloudinary:', error);
    res.status(500).json({
      error: `Failed to retrieve posters from Cloudinary. Check API configuration/permissions. Debug info: ${error.message}`,
      details: error.message,
      // Adding Cloudinary's specific error details if available
      cloudinaryError: error.http_code ? { http_code: error.http_code, message: error.message, code: error.code } : undefined
    });
  }
}
