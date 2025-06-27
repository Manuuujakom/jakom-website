// server.js

const express = require('express'); // Using CommonJS require
const cors = require('cors');     // Using CommonJS require
// Corrected import: 'require' the module and access its default export
const postersHandler = require('./api/posters.js'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON bodies
app.use(express.json());

// CORS Configuration
// IMPORTANT: Replace 'https://jakomonestoptechsolution.vercel.app' with your actual deployed frontend URL.
// This ensures that only your frontend can make requests to your API.
const allowedOrigins = [
  'http://localhost:3000', // For local React development server
  'http://localhost:5000', // If you test your backend directly locally
  'https://jakomonestoptechsolution.vercel.app', // Your primary deployed frontend URL
  // Add any other specific Vercel preview URLs if needed for testing branches,
  // e.g., 'https://your-app-name-git-branch-name.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    // or if the origin is in our allowed list.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocking request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Define allowed HTTP methods
  credentials: true, // Allow sending cookies/authorization headers
  optionsSuccessStatus: 200 // For preflight requests (browsers send OPTIONS before complex requests)
}));

// Define your API routes
// This uses the postersHandler function imported from src/api/posters.js
app.get('/api/posters', postersHandler);

// Basic route for testing server (will respond on the Vercel API endpoint for '/')
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from Vercel Serverless Function!' });
});

// Export the app for Vercel Serverless Functions
// Vercel requires the Express app instance to be exported.
module.exports = app;

// Conditional start for local development:
// The server will only listen on a port if executed directly (e.g., `node server.js`)
// and not when deployed as a serverless function on Vercel.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}
