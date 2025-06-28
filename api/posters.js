// api/server.js (or api/photos.js / api/posters.js - Recommended to name after endpoint)

// Import necessary modules
const cloudinary = require('cloudinary').v2; // Cloudinary SDK
const dotenv = require('dotenv'); // dotenv to load environment variables (for local testing only)

// Load environment variables for local testing purposes.
// In a Vercel deployment, these environment variables will be provided directly
// by Vercel's project settings and dotenv.config() will not be strictly necessary
// if you only rely on Vercel's injected environment variables.
dotenv.config();

// Configure Cloudinary with your credentials.
// These will be pulled from Vercel's environment variables during deployment,
// or from your local .env file during local development.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This is the Vercel serverless function handler.
// It replaces your Express app.get('/api/photos', ...) route.
// Vercel automatically maps requests to /api/<filename> to this function.
module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your frontend.
  // In production, consider restricting `Access-Control-Allow-Origin` to your frontend's domain.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests (HTTP OPTIONS method) for CORS.
  // Browsers send an OPTIONS request before the actual GET request.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure only GET requests are processed for fetching photos.
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Fetch resources (images) from Cloudinary.
    // 'type: "upload"' gets images that you've uploaded.
    // 'max_results' specifies how many images to retrieve.
    // 'prefix: "portfolio/"' fetches images specifically from the 'portfolio' folder.
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'portfolio/', // Fetch images from the 'portfolio' folder as requested
      max_results: 30, // Adjust as needed
      resource_type: 'image', // Ensure only image resources are fetched
      public_ids: true // Include public IDs in the response
    });

    // Map the Cloudinary resources to a cleaner array of photo objects.
    const photos = result.resources.map(resource => ({
      public_id: resource.public_id,
      url: resource.secure_url, // Use the secure HTTPS URL for the image
      width: resource.width,
      height: resource.height,
      format: resource.format,
    }));

    // Send the list of photos as a JSON response with a 200 OK status.
    res.status(200).json(photos);
  } catch (error) {
    // Log the detailed error from Cloudinary for debugging on Vercel logs.
    console.error('Error fetching photos from Cloudinary:', error);
    // Send a 500 Internal Server Error response to the client.
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
};

// --- IMPORTANT NOTES FOR VERCEL DEPLOYMENT ---
// 1. This file should be placed inside your 'api' directory (e.g., 'your-project-root/api/server.js').
//    Vercel will automatically expose it as a serverless function at '/api/server'.
//    If you name it 'api/photos.js', it will be '/api/photos'. This is usually preferred.
// 2. Remove the `app.listen()` and `express()` initialization. Vercel handles the server execution.
// 3. Set your Cloudinary environment variables directly in Vercel's project settings (Environment Variables).
//    Do NOT commit your .env file to Git for security reasons.
// 4. Update your frontend to fetch from the Vercel API endpoint (e.g., `fetch('/api/photos')`).
