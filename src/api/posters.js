// C:\Users\ADMIN\Desktop\kobilo\jakom-website\src\api\posters.js

// Import the Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using your provided credentials
// IMPORTANT: In a production environment, it is highly recommended to store these
// credentials in environment variables (e.g., in a .env file or server configuration)
// rather than hardcoding them directly in the code for security reasons.
cloudinary.config({
  cloud_name: 'desvdirg3',
  api_key: '385951568625369',
  api_secret: '9juTKNOvK-deQTpc4NLLsr5Drew',
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
    // --- IMPORTANT: Ensure 'portfolio' is the EXACT name of your folder in Cloudinary ---
    const folderName = 'portfolio';

    // Use Cloudinary's Search API for more reliable folder querying.
    // This allows you to specify the folder directly.
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
      console.warn(`No resources found in Cloudinary folder: ${folderName}`);
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
