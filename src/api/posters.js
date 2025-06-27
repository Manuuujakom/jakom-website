// C:\Users\ADMIN\Desktop\kobilo\jakom-website\src\api\posters.js

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables for security.
// !!! IMPORTANT !!!
// In your deployment environment (e.g., Vercel, Netlify, Render, AWS Lambda):
// You MUST set these environment variables with your actual Cloudinary credentials:
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
 * This function is designed to work as a Node.js API endpoint (e.g., in Next.js API routes,
 * or as a handler in an Express.js route).
 *
 * @param {object} req - The request object (e.g., NextApiRequest or Express Request).
 * @param {object} res - The response object (e.g., NextApiResponse or Express Response).
 */
export default async function handler(req, res) {
  // --- CORS HEADERS START ---
  // Allow requests specifically from your deployed frontend domain.
  // This is more secure than '*' for production.
  res.setHeader('Access-Control-Allow-Origin', 'https://jakomonestoptechsolution.vercel.app'); // <--- FIX APPLIED HERE
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests for CORS (browser sends OPTIONS request first)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- CORS HEADERS END ---

  try {
    // --- IMPORTANT: Ensure 'portfolio' is the EXACT name of your folder in Cloudinary ---
    const folderName = 'portfolio'; // This remains constant as it's your specific folder name

    // Validate Cloudinary configuration if using environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary environment variables are not set correctly.");
      return res.status(500).json({
        error: "Server configuration error: Cloudinary credentials are missing.",
        details: "Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set as environment variables."
      });
    }

    // Use Cloudinary's Search API for more reliable folder querying.
    // 'folder:"portfolio"' will search specifically in the 'portfolio' folder.
    // 'folder:"portfolio/*"' would search in the 'portfolio' folder and its direct subfolders.
    // 'folder:"portfolio/**"' would search in the 'portfolio' folder and all its nested subfolders.
    const searchResult = await cloudinary.search
      .expression(`folder:"${folderName}"`) // Search specifically in the 'portfolio' folder
      // .expression(`folder:"${folderName}/*"`) // Uncomment this to include direct subfolders
      // .expression(`folder:"${folderName}/**"`) // Uncomment this to include all nested subfolders
      .max_results(100) // Set the maximum number of images to retrieve (max 500 per request)
      .execute();

    // Check if the Cloudinary API returned valid resources.
    if (!searchResult || !searchResult.resources || searchResult.resources.length === 0) {
      console.warn(`No resources found in Cloudinary folder: ${folderName}. This could be due to incorrect folder name, no images in folder, or API key permissions.`);
      return res.status(200).json([]);
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
