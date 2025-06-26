const express = require('express');
const cors = require('cors');
const axios = require('axios'); // You'll need to install axios: npm install axios
const app = express();

// **IMPORTANT**: This is the Web app URL you got from Google Apps Script.
// It has been updated with the URL you provided.
const GOOGLE_APPS_SCRIPT_API_URL = 'https://script.google.com/macros/s/AKfycbw3mJyy7dZj2NqPJ-VWLTUVbpEYGc-FRU9MzxTIV6GguXlIh59PERCmrJx6De43voRt/exec';

// A simple cache to avoid hitting the Apps Script too often
let cachedPosters = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes (adjust as needed)

app.use(cors()); // Allow all CORS for now, will refine later if needed

app.get('/api/posters', async (req, res) => {
  const currentTime = Date.now();

  // Check if cache is still valid
  if (cachedPosters.length > 0 && (currentTime - lastFetchTime < CACHE_DURATION)) {
    console.log('Serving posters from cache.');
    return res.json(cachedPosters);
  }

  console.log('Fetching posters from Google Apps Script...');
  try {
    const response = await axios.get(GOOGLE_APPS_SCRIPT_API_URL);
    cachedPosters = response.data;
    lastFetchTime = currentTime;
    res.json(cachedPosters);
  } catch (error) {
    console.error('Error fetching posters from Google Apps Script:', error.message);
    // If there's an error, try to serve from cache if available, or send empty/error
    if (cachedPosters.length > 0) {
      console.log('Serving old cached posters due to fetch error.');
      res.json(cachedPosters);
    } else {
      res.status(500).json({ message: 'Could not retrieve posters.' });
    }
  }
});

// Use the port provided by the environment (e.g., Render) or default to 5000 for local testing
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));