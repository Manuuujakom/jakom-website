// C:\Users\ADMIN\Desktop\kobilo\jakom-website\server.js

import express from 'express';
import cors from 'cors';
import multer from 'multer'; // Import multer
import sharp from 'sharp'; // Import sharp
import postersHandler from './src/api/posters.js'; // Existing handler

// Import new image processing handlers
import {
  uploadImageHandler,
  removeBackgroundHandler,
  editBackgroundHandler,
  resizeImageHandler
} from './src/api/imageProcessor.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Set up multer for handling file uploads in memory
const upload = multer({
  storage: multer.memoryStorage()
});

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS for all requests.
app.use(cors());

// Define your API routes
app.get('/api/posters', postersHandler); // Existing route

// New routes for image processing
// For image upload, use `upload.single('image')` middleware
app.post('/api/upload', upload.single('image'), uploadImageHandler);

// For operations that expect image_data (base64) and potentially a file
app.post('/api/remove-background', express.json(), removeBackgroundHandler);
app.post('/api/edit-background', upload.single('background_image'), editBackgroundHandler);
app.post('/api/resize-image', express.json(), resizeImageHandler);


// Basic route for testing server
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
