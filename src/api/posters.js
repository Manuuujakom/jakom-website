// src/api/posters.js

// This file defines an API route (e.g., for a Next.js application)
// that fetches data from your deployed Google Apps Script web app.

export default async function handler(req, res) {
  try {
    // This is the specific URL of your deployed Google Apps Script web app.
    // It's the endpoint that serves the JSON data from your Google Drive folder.
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzfcI0u7ekdN5SPccv-TrHG6GfA_hW_lY3QgefTv3qXmHXe39sqZkQGR0GYfRJkWY4T/exec'; 

    // Ensure the request method is GET, as your doGet function responds to GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Fetch the data from your deployed Google Apps Script web app
    const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL);

    if (!response.ok) {
      // If the response from the Apps Script is not OK (e.g., 404, 500), throw an error
      const errorData = await response.text(); // Get raw text to inspect server error if not JSON
      console.error('Error response from Google Apps Script:', response.status, response.statusText, errorData);
      throw new Error(`Failed to fetch data from Google Apps Script: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response from the Google Apps Script
    const posters = await response.json();

    // Send the fetched data back to the frontend client
    res.status(200).json(posters);

  } catch (error) {
    console.error('Error in posters API route:', error);
    // Return a generic error message to the frontend, avoid exposing sensitive details
    res.status(500).json({ message: 'Failed to fetch posters data.', error: error.message });
  }
}

// NOTE: The Google Apps Script (doGet function) provided below
// should *not* be in this Node.js file. It belongs in your Google Apps Script project
// (e.g., Code.gs) at script.google.com, and it should be deployed as a web app
// to generate the GOOGLE_APPS_SCRIPT_WEB_APP_URL used above.

/*
// Google Apps Script: Code.gs (This part goes into script.google.com)
// Replace with the ID of your Google Drive folder
const FOLDER_ID = '1addJdUAMZ0RM4ViYRPiZNjuOJml7bqhV'; // Your folder ID

// Serves the list of files and their public URLs as a JSON API.
// This function will be called when the web app URL is accessed via a GET request.
function doGet(e) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const posters = [];

    let idCounter = 1; // To assign unique IDs to posters

    while (files.hasNext()) {
      const file = files.next();
      
      // Ensure file is publicly accessible with "Anyone with the link" and "Viewer"
      // Google Drive direct links for public files:
      // https://drive.google.com/uc?export=view&id=FILE_ID
      // This format is generally more reliable for direct embedding in web pages.
      const imageUrl = `https://drive.google.com/uc?export=view&id=${file.getId()}`;

      posters.push({
        id: idCounter++,
        title: file.getName().split('.')[0], // Use file name as title, without extension
        imageUrl: imageUrl
      });
    }

    // Set the content type to JSON and return the data
    const output = ContentService.createTextOutput(JSON.stringify(posters));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (error) {
    // Log the error for debugging in Google Apps Script logs (View > Executions)
    Logger.log('Error in doGet: ' + error.message);

    // Return an error response to the client
    return ContentService.createTextOutput(JSON.stringify({ 
        error: "Failed to fetch files from Google Drive.", 
        details: error.message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}
*/