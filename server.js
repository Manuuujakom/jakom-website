// C:\Users\ADMIN\Desktop\kobilo\jakom-website\server.js

import express from 'express';
import cors from 'cors';
import multer from 'multer'; // For handling file uploads (multipart/form-data)
import sharp from 'sharp';   // For high-performance image processing
import fetch from 'node-fetch'; // For making HTTP requests to external APIs (e.g., remove.bg)
import dotenv from 'dotenv'; // For loading environment variables locally

// Load environment variables from .env file (for local development)
dotenv.config();

// Adjust path based on your server.js location
import postersHandler from './src/api/posters.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure remove.bg API
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY; // Get this from Vercel Environment Variables
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

// Set up multer for memory storage (files are kept in buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS for all requests.
// For production, it is highly recommended to restrict this to your frontend's domain.
// Example: cors({ origin: 'https://jakomonestoptechsolution.vercel.app' })
app.use(cors());

// --- Helper Functions (Node.js Image Processing) ---

async function removeBackgroundApi(imageBuffer) {
  if (!REMOVE_BG_API_KEY) {
    throw new Error("REMOVE_BG_API_KEY is not set. Cannot perform background removal.");
  }

  console.log("Sending image to remove.bg API for processing...");
  const formData = new FormData(); // FormData is global in Node.js 16+ or via node-fetch polyfill
  formData.append('image_file', new Blob([imageBuffer], { type: 'image/png' }), 'image.png');
  formData.append('size', 'auto'); // 'auto' for best quality, 'preview' for faster but lower quality

  try {
    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`remove.bg API error: ${response.status} - ${errorText}`);
    }

    return await response.buffer(); // Get the image buffer directly
  } catch (error) {
    console.error(`Error calling remove.bg API: ${error.message}`);
    throw new Error(`Background removal service error: ${error.message}`);
  }
}

async function applySolidBackground(imageBuffer, colorHex) {
  console.log(`Applying solid color background: ${colorHex}`);
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Convert hex to RGB (Sharp expects RGB or RGBA)
    const r = parseInt(colorHex.substring(1, 3), 16);
    const g = parseInt(colorHex.substring(3, 5), 16);
    const b = parseInt(colorHex.substring(5, 7), 16);

    // Create a solid color background image buffer
    const background = await sharp({
      create: {
        width: metadata.width,
        height: metadata.height,
        channels: 4, // RGBA
        background: { r, g, b, alpha: 255 }
      }
    }).png().toBuffer();

    // Composite the original image (with transparency) over the new background
    const combined = await sharp(background)
      .composite([{ input: imageBuffer, blend: 'over' }]) // 'over' means original image is on top
      .png()
      .toBuffer();

    return combined;
  } catch (error) {
    console.error(`Error in applySolidBackground: ${error.message}`);
    throw new Error(`Failed to apply solid background: ${error.message}`);
  }
}

async function applyImageBackground(originalImageBuffer, backgroundImageFile) {
  console.log("Applying image background...");
  try {
    const originalImage = sharp(originalImageBuffer);
    const originalMetadata = await originalImage.metadata();

    const backgroundImageBuffer = backgroundImageFile.buffer; // Get buffer from multer file

    const backgroundSharp = sharp(backgroundImageBuffer);
    const backgroundMetadata = await backgroundSharp.metadata();

    let resizedBackgroundBuffer = backgroundImageBuffer;

    // Resize background image to match original image dimensions
    if (originalMetadata.width !== backgroundMetadata.width || originalMetadata.height !== backgroundMetadata.height) {
      resizedBackgroundBuffer = await backgroundSharp
        .resize(originalMetadata.width, originalMetadata.height, {
          fit: 'cover' // Cover the area, cropping if necessary to fill
        })
        .toBuffer();
    }

    // Composite the original image (assuming transparent background) over the new background
    const combined = await sharp(resizedBackgroundBuffer)
      .composite([{ input: originalImageBuffer, blend: 'over' }])
      .png()
      .toBuffer();

    return combined;
  } catch (error) {
    console.error(`Error in applyImageBackground: ${error.message}`);
    throw new Error(`Failed to apply image background: ${error.message}`);
  }
}

async function resizeImage(imageBuffer, width, height) {
  console.log(`Resizing image to ${width}x${height}`);
  try {
    const image = sharp(imageBuffer);
    let resizedImage;

    // Sharp's resize method handles null for auto-scaling
    if (width === 'auto' && height === 'auto') {
      resizedImage = image; // No resize needed, return original sharp object
    } else if (width === 'auto' && typeof height === 'number') {
      resizedImage = image.resize(null, height); // Resize by height, auto width
    } else if (height === 'auto' && typeof width === 'number') {
      resizedImage = image.resize(width, null); // Resize by width, auto height
    } else if (typeof width === 'number' && typeof height === 'number') {
      resizedImage = image.resize(width, height); // Resize to exact dimensions
    } else {
      throw new Error("Invalid dimensions provided for resize.");
    }

    return await resizedImage.png().toBuffer(); // Convert to PNG buffer
  } catch (error) {
    console.error(`Error in resizeImage: ${error.message}`);
    throw new Error(`Failed to resize image: ${error.message}`);
  }
}

// --- API Endpoints ---

// Existing posters handler
app.get('/api/posters', postersHandler);

// New image processing endpoints
// For /api/upload, we expect a file upload (multipart/form-data)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const fileBuffer = req.file.buffer;
    // Convert the image buffer to Base64 string
    const imageData = fileBuffer.toString('base64');

    res.json({
      message: 'Image uploaded successfully!',
      image_data: imageData // Return base64 encoded image data
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Failed to upload image: ${error.message}` });
  }
});

// For other endpoints, we expect base64 image_data in the form body
app.post('/api/remove-background', upload.none(), async (req, res) => {
  const imageData = req.body.image_data; // Expect base64 string
  if (!imageData) {
    return res.status(400).json({ error: 'No image_data provided for background removal' });
  }

  try {
    const originalImageBuffer = Buffer.from(imageData, 'base64'); // Decode base64 to buffer

    const processedBuffer = await removeBackgroundApi(originalImageBuffer);

    const processedImageData = processedBuffer.toString('base64'); // Encode result to base64

    res.json({
      message: 'Background removed successfully!',
      image_data: processedImageData
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: `Failed to remove background: ${error.message}` });
  }
});

app.post('/api/edit-background', upload.fields([
  { name: 'image_data', maxCount: 1 }, // Changed from image_url
  { name: 'color', maxCount: 1 },
  { name: 'background_image', maxCount: 1 } // This will be a file
]), async (req, res) => {
  const imageData = req.body.image_data; // Expect base64 string
  const color = req.body.color;
  const backgroundImageFile = req.files && req.files['background_image'] ? req.files['background_image'][0] : null;

  if (!imageData) {
    return res.status(400).json({ error: 'No image_data provided for background editing' });
  }

  try {
    const originalImageBuffer = Buffer.from(imageData, 'base64'); // Decode base64 to buffer

    let processedBuffer = null;
    if (color) {
      processedBuffer = await applySolidBackground(originalImageBuffer, color);
    } else if (backgroundImageFile) {
      processedBuffer = await applyImageBackground(originalImageBuffer, backgroundImageFile);
    } else {
      return res.status(400).json({ error: 'No color or background image file provided' });
    }

    const processedImageData = processedBuffer.toString('base64'); // Encode result to base64

    res.json({
      message: 'Background edited successfully!',
      image_data: processedImageData
    });
  } catch (error) {
    console.error('Edit background error:', error);
    res.status(500).json({ error: `Failed to edit background: ${error.message}` });
  }
});

app.post('/api/resize-image', upload.none(), async (req, res) => {
  const imageData = req.body.image_data; // Expect base64 string
  let width = req.body.width;
  let height = req.body.height;

  if (!imageData) {
    return res.status(400).json({ error: 'No image_data provided for resizing' });
  }

  // Parse width and height, allowing for 'auto' as a string
  try {
    width = width === 'auto' ? 'auto' : parseInt(width);
    height = height === 'auto' ? 'auto' : parseInt(height);

    if (isNaN(width) && width !== 'auto') throw new Error('Invalid width');
    if (isNaN(height) && height !== 'auto') throw new Error('Invalid height');
  } catch (e) {
    return res.status(400).json({ error: `Invalid width or height format: ${e.message}` });
  }

  if ((width === 'auto' && height === 'auto') || (typeof width !== 'number' && typeof height !== 'number')) {
    return res.status(400).json({ error: 'At least one valid numerical dimension or both "auto" are required for resizing' });
  }

  try {
    const originalImageBuffer = Buffer.from(imageData, 'base64'); // Decode base64 to buffer

    const processedBuffer = await resizeImage(originalImageBuffer, width, height);

    const processedImageData = processedBuffer.toString('base64'); // Encode result to base64

    res.json({
      message: 'Image resized successfully!',
      image_data: processedImageData
    });
  } catch (error) {
    console.error('Resize image error:', error);
    res.status(500).json({ error: `Failed to resize image: ${error.message}` });
  }
});


// Basic route for testing server
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
