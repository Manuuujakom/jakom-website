// This file should be located at your-project-root/api/posters.js
// OR your-project-root/pages/api/posters.js if using Next.js.

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

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

  // Define Cloudinary credentials inside the handler to ensure process.env is fully loaded.
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  try {
    // Validate Cloudinary configuration during execution
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      const missingKeys = [];
      if (!CLOUDINARY_CLOUD_NAME) missingKeys.push('CLOUDINARY_CLOUD_NAME');
      if (!CLOUDINARY_API_KEY) missingKeys.push('CLOUDINARY_API_KEY');
      if (!CLOUDINARY_API_SECRET) missingKeys.push('CLOUDINARY_API_SECRET');

      console.error(`Cloudinary environment variables are NOT set correctly at runtime. Missing: ${missingKeys.join(', ')}.`);
      console.error("Debug Values - CLOUD_NAME:", CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET', ", API_KEY:", CLOUDINARY_API_KEY ? 'SET' : 'NOT SET', ", API_SECRET:", CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'); // Log status of secret for debugging

      return res.status(500).json({
        error: "Server configuration error: Cloudinary credentials are missing or incorrect during execution.",
        details: "Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set as environment variables for Production AND Preview environments in your deployment platform.",
        missingEnvVars: missingKeys
      });
    }

    // Configure Cloudinary *after* validating env vars are present.
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true, // Ensures all URLs are HTTPS
    });

    const folderName = 'portfolio';

    console.log(`Attempting to search Cloudinary for folder: ${folderName}`);

    const searchResult = await cloudinary.search
      .expression(`folder:"${folderName}"`)
      .max_results(100)
      .execute();

    // Log the raw search result for debugging, if successful
    console.log("Cloudinary Search Result (Success):", JSON.stringify(searchResult, null, 2));

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
    // Log the full error object for comprehensive debugging
    console.error('CRITICAL ERROR fetching posters from Cloudinary (full error object):', error);
    res.status(500).json({
      error: `Failed to retrieve posters from Cloudinary. Check API configuration/permissions. Debug info: ${error.message || 'No specific error message provided by Cloudinary SDK.'}`,
      details: error.message || 'Unknown error. Check Vercel logs for full error object.',
      // Adding Cloudinary's specific error details if available
      cloudinaryError: error.http_code ? { http_code: error.http_code, message: error.message, code: error.code, name: error.name } : undefined,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)) // Attempt to stringify entire error object
    });
  }
}
