// C:\Users\ADMIN\Desktop\kobilo\jakom-website\server.js

import express from 'express';
import cors from 'cors';
import postersHandler from './src/api/posters.js'; // MOVED TO TOP

const app = express();
const PORT = process.env.PORT || 5000; // API will run on port 5000 locally

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS explicitly for all origins for public content access.
// This allows any website to make requests to your API.
app.use(cors({
  origin: '*', // Allows requests from any domain
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allowed HTTP methods
  allowedHeaders: ['Content-Type'], // Explicitly allowed request headers
  credentials: true, // If you need to send cookies or authentication headers (often not needed for public content)
  maxAge: 86400 // Caches preflight requests for 24 hours
}));

// Define your API routes
// This tells Express to use the handler function from src/api/posters.js
// for any GET requests to /api/posters
app.get('/api/posters', postersHandler);

// Basic route for testing server (this will be handled by vercel.json if deployed)
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// Start the server (only runs locally, Vercel replaces this with its serverless runtime)
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
