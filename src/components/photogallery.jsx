// src/components/PhotoGallery.jsx
// This component fetches photos from your backend and displays them.

import React, { useState, useEffect } from 'react';

// Main PhotoGallery component
const App = () => {
  // State to store the fetched photos
  const [photos, setPhotos] = useState([]);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to manage any errors during fetching
  const [error, setError] = useState(null);

  // useEffect hook to fetch photos when the component mounts
  useEffect(() => {
    // Define the backend API URL
    // Make sure this matches the port your Node.js backend is running on
    const backendUrl = 'http://localhost:5000/api/photos';

    const fetchPhotos = async () => {
      try {
        // Reset error state before new fetch attempt
        setError(null);
        setLoading(true); // Set loading to true while fetching

        // Make a GET request to your backend API
        const response = await fetch(backendUrl);

        // Check if the request was successful
        if (!response.ok) {
          // If not successful, throw an error with the status text
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();
        // Update the photos state with the fetched data
        setPhotos(data);
      } catch (err) {
        // Catch any errors during the fetch operation and update the error state
        console.error("Failed to fetch photos:", err);
        setError(err.message); // Set the error message for display
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or failure)
      }
    };

    fetchPhotos(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Render logic based on loading, error, and photo data
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans antialiased">
      <header className="w-full max-w-4xl text-center py-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Cloudinary Photo Gallery</h1>
        <p className="text-lg text-gray-600">
          Photos fetched from a Node.js backend connected to Cloudinary.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700 text-lg">Loading photos...</p>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="font-bold text-xl mb-2">Error:</p>
            <p>{error}. Please ensure your backend server is running and Cloudinary credentials are correct.</p>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="text-center text-gray-500 p-8">
            <p className="text-xl mb-2">No photos found.</p>
            <p>Please upload some images to your Cloudinary account or adjust the `prefix` in `server.js`.</p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.public_id} // Unique key for each photo
                className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
              >
                <img
                  src={photo.url} // Photo URL from Cloudinary
                  alt={`Cloudinary Photo: ${photo.public_id}`} // Alt text for accessibility
                  className="w-full h-48 object-cover object-center rounded-t-lg"
                  onError={(e) => {
                    // Fallback for broken images
                    e.target.onerror = null; // Prevent infinite loop if fallback also fails
                    e.target.src = `https://placehold.co/400x300/e0e0e0/555555?text=Image+Load+Error`;
                    console.error(`Failed to load image: ${photo.url}`);
                  }}
                />
                <div className="p-3 bg-white rounded-b-lg">
                  <p className="text-sm font-semibold text-gray-700 truncate">{photo.public_id.split('/').pop()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl text-center py-6 mt-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Cloudinary Photo App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;

// Instructions for frontend setup:
// 1. Ensure you have a React app set up (e.g., using `create-react-app`).
//    If not, run: `npx create-react-app my-photo-app` then `cd my-photo-app`.
// 2. Open your React project in your code editor.
// 3. You can put this code in `src/App.js` or create a new component like `src/components/PhotoGallery.jsx`.
//    If you create `src/components/PhotoGallery.jsx`, make sure to import and use it in `src/App.js`:
//    import PhotoGallery from './components/PhotoGallery';
//    function App() { return <PhotoGallery />; }
//    export default App;
// 4. Ensure Tailwind CSS is configured in your React app for the styling to work.
//    If not, follow Tailwind CSS installation guide for Create React App:
//    https://tailwindcss.com/docs/guides/create-react-app
// 5. Run your React app: `npm start`.
//    It will typically open in your browser at http://localhost:3000.
