// C:\Users\ADMIN\Desktop\kobilo\jakom-website\src\api\posters.js

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using your provided credentials
// IMPORTANT: In a production environment, it is highly recommended to store these
// credentials in environment variables (e.g., in a .env file or server configuration)
// rather than hardcoding them directly in the code for security reasons.
cloudinary.config({
  cloud_name: 'desvdirg3',
  api_key: '377262618343588',
  api_secret: 'i6SSZi71MIHOFtY_mwYA1FXEapg',
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
  try {
    // --- IMPORTANT: Replace 'YOUR_CLOUDINARY_FOLDER_NAME' with your actual folder name ---
    // Make sure this folder exists in your Cloudinary account and contains images.
    const folderName = 'portfolio'; // Assuming 'portfolio' is your actual folder based on mock data public_ids

    // Fetch resources (images) from the specified folder in your Cloudinary account.
    // 'type: upload' refers to assets uploaded to Cloudinary.
    // 'prefix: folderName + /' ensures we only get assets directly within that folder.
    // 'max_results: 100' sets the maximum number of images to retrieve (adjust as needed, max 500 per request).
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderName + '/',
      max_results: 100,
      // You can add more options here, like 'tags: true' if you use tags for filtering,
      // or 'asset_type: image' to ensure only images are returned.
    });

    // Check if the Cloudinary API returned valid resources.
    if (!result || !result.resources || result.resources.length === 0) {
      console.warn(`No resources found in Cloudinary folder: ${folderName}`);
      // If no resources, return an empty array or a specific message, but still a 200 OK.
      return res.status(200).json([]);
    }

    // Map the Cloudinary resource objects to the format expected by your frontend.
    // The frontend expects an array of objects with 'id', 'imageUrl', and 'title'.
    const posters = result.resources.map((resource) => {
      // Extract a more human-readable title from the public_id.
      // public_id is typically 'folder/filename_extension'. We extract the filename.
      const fileName = resource.public_id.split('/').pop();
      const title = fileName
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\.\w+$/, '') // Remove file extension
        .split(' ') // Split by spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join back with spaces

      return {
        id: resource.public_id, // Unique identifier for the poster (Cloudinary's public_id)
        imageUrl: resource.secure_url, // HTTPS URL for the image
        title: title || 'Untitled Poster', // Use the derived title, or a default
      };
    });

    // Send the transformed posters array as a JSON response with a 200 OK status.
    res.status(200).json(posters);

  } catch (error) {
    // Log any errors that occur during the fetch process.
    console.error('Error fetching posters from Cloudinary:', error);
    // Send a 500 Internal Server Error response with error details.
    res.status(500).json({
      error: 'Failed to retrieve posters. Please check your Cloudinary configuration and folder name.',
      details: error.message,
    });
  }
}
