// This file should be located at your-project-root/api/posters.js
// OR your-project-root/pages/api/posters.js if using Next.js.

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables for security.
// !!! IMPORTANT !!!
// In your Vercel project settings (Environment Variables section):
// You MUST set these environment variables for "Production" AND "Preview" (or "All Environments"):
// CLOUDINARY_CLOUD_NAME = 'desvdirg3'
// CLOUDINARY_API_KEY = '385951568625369'
// CLOUDINARY_API_SECRET = '9juTKNOvK-deQTpc4NLLsr3Drew'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Read from environment variable
  api_key: process.env.CLOUDINARY_API_KEY,       // Read from environment variable
  api_secret: process.env.CLOUDINARY_API_SECRET, // Read from environment variable
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
  // To allow access from ANY origin (for public viewing by all users).
  // IMPORTANT: For APIs handling sensitive user data, restrict this to specific domains.
  res.setHeader('Access-Control-Allow-Origin', '*'); // <--- CHANGED TO WILDCARD FOR PUBLIC ACCESS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight requests for 24 hours

  // Handle preflight requests for CORS (browser sends OPTIONS request first)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END CORS HEADERS ---

  try {
    // Validate Cloudinary configuration immediately
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary environment variables are NOT set correctly on the server. Values received: CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET', ", API_KEY:", process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET'); // Log status, not secret
      return res.status(500).json({
        error: "Server configuration error: Cloudinary credentials are missing or incorrect.",
        details: "Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set as environment variables for Production AND Preview environments in your deployment platform."
      });
    }

    const folderName = 'portfolio'; // Ensure this is the EXACT name of your folder in Cloudinary

    // Add more detailed logging before the Cloudinary API call
    console.log(`Attempting to search Cloudinary for folder: ${folderName}`);

    const searchResult = await cloudinary.search
      .expression(`folder:"${folderName}"`)
      .max_results(100)
      .execute();

    // Log the raw search result for debugging
    console.log("Cloudinary Search Result:", JSON.stringify(searchResult, null, 2));


    if (!searchResult || !searchResult.resources || searchResult.resources.length === 0) {
      console.warn(`No resources found in Cloudinary folder: ${folderName}. This could be due to incorrect folder name, no images in folder, or API key permissions. Cloudinary response:`, searchResult);
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
    console.error('CRITICAL ERROR fetching posters from Cloudinary:', error);
    res.status(500).json({
      error: 'Failed to retrieve posters from Cloudinary. Please check your API configuration and permissions, and examine deployment logs for full details.',
      details: error.message, // Provide the specific error message from the catch block
    });
  }
}
