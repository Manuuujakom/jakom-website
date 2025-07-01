// C:\Users\ADMIN\Desktop\kobilo\jakom-website\server.js

import express from 'express';
import cors from 'cors'; // Import cors for potential cross-origin issues
import postersHandler from './src/api/posters.js'; // Adjust path based on your server.js location

const app = express();
const PORT = process.env.PORT || 5000; // API will run on port 5000

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS for all requests. In production, you might want to restrict this
// to only your frontend's domain for security.
app.use(cors());

// Define your API routes
// This tells Express to use the handler function from src/api/posters.js
// for any GET requests to /api/posters
app.get('/api/posters', postersHandler);

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});