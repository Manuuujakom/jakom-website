// src/components/GraphicsDesign.js (or GraphicsDesignPage.js)

import React, { useState, useEffect } from 'react';

// OtherPortfolio Component
const OtherPortfolio = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#C9B072] mb-8 text-center">
        Other Portfolio
      </h1>
      <p className="text-lg md:text-xl text-[#CCD2E3] text-center mb-10">
        This section is under development. Please check back later!
      </p>
      <button
        onClick={onBack}
        className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90"
      >
        Back to Graphics & Design
      </button>
    </div>
  );
};

// VideoEditing Component
const VideoEditing = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Video Editing & Production
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Bringing your stories to life through dynamic visual narratives. From raw footage to polished final cuts, we handle all aspects of video production.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Edit" alt="Video Editing" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Post-Production</h3>
          <p className="text-[#CCD2E3]">Seamless editing, color grading, and sound design.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Anim" alt="Animation" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Motion Graphics & Animation</h3>
          <p className="text-[#CCD2E3]">Engaging animated visuals for your videos.</p>
        </div>
      </div>
      <button
        onClick={onBack}
        className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up"
        style={{ animationDelay: '0.8s' }}
      >
        Back to Graphics & Design
      </button>
    </div>
  );
};

// PosterGallery Component
const PosterGallery = ({ onBack }) => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        // Fetch from your local API route (/api/posters)
        const response = await fetch('/api/posters');

        if (!response.ok) {
          const errorDetail = await response.text(); // Get raw text to see server's error
          console.error('Error response from /api/posters:', response.status, response.statusText, errorDetail);
          throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorDetail.substring(0, 100)}...`);
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const rawResponse = await response.text();
            console.error(`Expected JSON from /api/posters, but received content type: ${contentType || 'none'}. Raw response: ${rawResponse.substring(0, 100)}...`);
            throw new Error(`Invalid response format from server. Expected JSON, got ${contentType}.`);
        }

        const data = await response.json(); // Attempt to parse as JSON

        // Assuming your /api/posters will return an array of posters directly
        // If your server sends an error object (e.g., { error: "message" }), you can still check for it
        if (data && data.error) {
            throw new Error(`Server error: ${data.error}. Details: ${data.details || 'No additional details.'}`);
        }
        
        setPosters(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load posters from API:", err);
        setError(
          `Failed to load posters. Please ensure:
            1. Your /api/posters route is set up correctly on the server.
            2. The /api/posters route can successfully fetch data from Cloudinary.
            Error: ${err.message}` // Display the actual error message for debugging
        );
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-8">
        <p className="text-2xl text-[#CCD2E3]">Loading posters from Cloudinary...</p>
        <button
          onClick={onBack}
          className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90"
        >
          Back to Graphics & Design
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-2xl text-red-500 mb-4 whitespace-pre-line">{error}</p>
        <button
          onClick={onBack}
          className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90"
        >
          Back to Graphics & Design
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#C9B072] mb-8">
        Our Poster Portfolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
        {posters.length > 0 ? (
          posters.map((poster) => (
            <div key={poster.id} className="bg-[#1C2C59] rounded-xl p-4 shadow-lg border border-[#4CAF50]">
              <img
                src={poster.imageUrl}
                className="w-full h-64 object-cover rounded-md mb-4"
                alt={poster.title}
              />
              <h3 className="text-xl font-bold text-[#F8F8F8] mb-2">{poster.title}</h3>
              <p className="text-[#CCD2E3]">A stunning example of our print design work.</p>
            </div>
          ))
        ) : (
          <p className="text-xl text-[#CCD2E3] col-span-full">No posters found. Please ensure your Cloudinary setup is correct and contains images.</p>
        )}
      </div>
      <button
        onClick={onBack}
        className="px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90"
      >
        Back to Graphics & Design
      </button>
    </div>
  );
};

// GraphicsDesign Component (main component for this section)
const GraphicsDesign = ({ navigateTo }) => {
  const [showPortfolioMenu, setShowPortfolioMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center relative">
      {/* Portfolio Selection Button at the top right */}
      <div className="absolute top-8 right-8 z-20">
        <div className="relative">
          <button
            onClick={() => setShowPortfolioMenu(!showPortfolioMenu)}
            className="px-6 py-2 bg-[#4CAF50] text-[#0A1128] font-bold text-lg rounded-full shadow-2xl hover:bg-opacity-90 transition duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>View Portfolios</span>
            <svg
              className={`w-5 h-5 ml-2 transition-transform duration-300 ${showPortfolioMenu ? 'rotate-180' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {/* Portfolio Options Menu (Dropdown) */}
          {showPortfolioMenu && (
            <div className="absolute top-full mt-2 right-0 bg-[#1C2C59] text-[#F8F8F8] rounded-xl shadow-xl w-64 overflow-hidden z-30 animate-fade-in-down">
              <button
                onClick={() => { navigateTo('posterGallery'); setShowPortfolioMenu(false); }}
                className="block w-full text-left px-6 py-4 text-lg hover:bg-[#0A1128] border-b border-[#2A3A69] transition duration-200 rounded-t-xl"
              >
                Print & Marketing (Posters)
              </button>
              <button
                onClick={() => { navigateTo('videoEditing'); setShowPortfolioMenu(false); }}
                className="block w-full text-left px-6 py-4 text-lg hover:bg-[#0A1128] border-b border-[#2A3A69] transition duration-200"
              >
                Video Editing & Production
              </button>
              <button
                onClick={() => { navigateTo('otherPortfolio'); setShowPortfolioMenu(false); }}
                className="block w-full text-left px-6 py-4 text-lg hover:bg-[#0A1128] transition duration-200 rounded-b-xl"
              >
                Other Portfolio (Coming Soon!)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Original Graphics & Design Content */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Graphics & Design Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Transform your vision into stunning visual realities. Our graphic design experts craft compelling logos, engaging marketing materials, and cohesive brand identities that resonate with your audience.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Logo" alt="Logo Design" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Logo & Branding</h3>
          <p className="text-[#CCD2E3]">Create a memorable brand identity from the ground up.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Web" alt="Web Design" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Web Design</h3>
          <p className="text-[#CCD2E3]">Visually appealing and user-friendly website interfaces.</p>
        </div>
        <div
          className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Print" alt="Print Design" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Print & Marketing</h3>
          <p className="text-[#CCD2E3]">Brochures, flyers, business cards, and more. <span className="text-[#C9B072] font-semibold">(Select from 'View Portfolios')</span></p>
        </div>
      </div>
    </div>
  );
};

// Main App Component (for overall navigation within this file)
const App = () => {
  const [currentPage, setCurrentPage] = useState('graphicsDesign');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'graphicsDesign':
        return <GraphicsDesign navigateTo={navigateTo} />;
      case 'posterGallery':
        return <PosterGallery onBack={() => navigateTo('graphicsDesign')} />;
      case 'videoEditing':
        return <VideoEditing onBack={() => navigateTo('graphicsDesign')} />;
      case 'otherPortfolio':
        return <OtherPortfolio onBack={() => navigateTo('graphicsDesign')} />;
      default:
        return null;
    }
  };

  return (
    <div className="font-sans">
      {renderContent()}
    </div>
  );
};

export default App;