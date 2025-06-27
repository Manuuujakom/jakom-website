// src/api/posters.js

// Import the Cloudinary SDK
// Using require for CommonJS compatibility with Vercel's Node.js runtime
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables
// These variables MUST be set in your Vercel project settings.
// Do NOT hardcode sensitive information here.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Ensures all URLs are HTTPS
});

/**
 * API handler function to fetch posters from Cloudinary.
 * This function is designed to be an Express.js route handler.
 *
 * @param {object} req - The Express Request object.
 * @param {object} res - The Express Response object.
 */
async function postersHandler(req, res) { // Renamed to postersHandler for clarity when exporting
  try {
    // --- IMPORTANT: Ensure 'portfolio' is the EXACT name of your folder in Cloudinary ---
    const folderName = 'portfolio';

    // Use Cloudinary's Search API for more reliable folder querying.
    const searchResult = await cloudinary.search
      .expression(`folder:"${folderName}"`) // Search specifically in the 'portfolio' folder
      .max_results(100) // Set the maximum number of images to retrieve (max 500 per request)
      .execute();

    // Check if the Cloudinary API returned valid resources.
    if (!searchResult || !searchResult.resources || searchResult.resources.length === 0) {
      console.warn(`No resources found in Cloudinary folder: ${folderName}`);
      return res.status(200).json([]); // Return empty array if no resources are found
    }

    // Map the Cloudinary resource objects to the format expected by your frontend.
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

    // Send the transformed posters array as a JSON response with a 200 OK status.
    res.status(200).json(posters);

  } catch (error) {
    // Log any errors that occur during the fetch process.
    console.error('Error fetching posters from Cloudinary:', error);
    // Send a 500 Internal Server Error response with error details.
    res.status(500).json({
      error: 'Failed to retrieve posters. Please check your Cloudinary configuration, folder name, and API permissions.',
      details: error.message,
    });
  }
}

// Export the handler function for use in server.js
module.exports = postersHandler;
