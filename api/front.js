    // api/photos.js

    // Import necessary modules
    const cloudinary = require('cloudinary').v2; // Cloudinary SDK
    const dotenv = require('dotenv'); // dotenv to load environment variables (for local testing)

    // Load environment variables for local testing
    // In Vercel, these env vars will be provided directly by Vercel's config
    dotenv.config();

    // Configure Cloudinary with your credentials
    // These will be pulled from Vercel's environment variables during deployment
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // This is the serverless function handler for Vercel
    // It takes a request (req) and response (res) object, similar to Express route handlers.
    module.exports = async (req, res) => {
      // Set CORS headers for Vercel deployments
      // This allows your React frontend to make requests to this API.
      res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust to your frontend's domain in production
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      // Handle preflight requests (OPTIONS method)
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Only allow GET requests for fetching photos
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
      }

      try {
        // Fetch resources (images) from Cloudinary.
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'portfolio/', // Fetch images from the 'portfolio' folder
          max_results: 30, // Adjust as needed
          resource_type: 'image', // Ensure we only get images
          public_ids: true // Return public IDs for easy manipulation if needed
        });

        // Extract relevant image data (e.g., secure_url, public_id)
        const photos = result.resources.map(resource => ({
          public_id: resource.public_id,
          url: resource.secure_url, // Use secure_url for HTTPS
          width: resource.width,
          height: resource.height,
          format: resource.format,
        }));

        // Send the list of photos as a JSON response
        res.status(200).json(photos);
      } catch (error) {
        // Log the error for debugging purposes (Vercel logs)
        console.error('Error fetching photos from Cloudinary:', error);
        // Send an error response to the client
        res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
      }
    };
    