import React, { useState, useEffect } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize'; // Import necessary actions if needed

// OtherPortfolio Component (No changes needed for this guide)
const OtherPortfolio = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#C9B072] mb-8 text-center">
        Other Portfolio
      </h1>
      <p className="text-lg md:text-xl text-[#CCD2E3] text-center mb-10">
        This section is under development. Please check back later!
      </p>
      <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
        Back to Graphics & Design
      </button>
    </div>
  );
};

// VideoEditing Component (No changes needed for this guide)
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
      <button onClick={onBack} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        Back to Graphics & Design
      </button>
    </div>
  );
};

// PosterGallery Component to fetch and display posters
const PosterGallery = ({ onBack }) => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'desvdirg3' // Replace with your actual Cloudinary Cloud Name
    }
  });

  useEffect(() => {
    const fetchCloudinaryPosters = async () => {
      try {
        // In a real application, you'd likely fetch public IDs from a backend API
        // For demonstration, we'll use a hardcoded array of public IDs.
        // Make sure these public IDs exist in your Cloudinary account.
        const publicIds = [
          { id: '1', publicId: 'samples/landscapes/beach-on-patrol', title: 'Tropical Sunset' },
          { id: '2', publicId: 'samples/food/pot-roast', title: 'Delicious Pot Roast' },
          { id: '3', publicId: 'samples/bike', title: 'Mountain Biking' },
          { id: '4', publicId: 'samples/animals/kitten-playing', title: 'Playful Kitten' },
          // Add more public IDs as needed
        ];

        // Map public IDs to Cloudinary image objects
        const loadedPosters = publicIds.map(item => ({
          id: item.id,
          title: item.title,
          // Construct the Cloudinary image object
          cldImg: cld.image(item.publicId)
                      .resize(fill().width(300).height(200)) // Apply transformations
                      .quality('auto')
                      .format('auto')
        }));

        setPosters(loadedPosters);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Cloudinary posters:", err);
        setError("Failed to load posters. Please check your Cloudinary configuration and public IDs.");
        setLoading(false);
      }
    };

    fetchCloudinaryPosters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-8">
        <p className="text-2xl text-[#CCD2E3]">Loading posters from Cloudinary...</p>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
          Back to Graphics & Design
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center p-8">
        <p className="text-2xl text-red-500 mb-4">{error}</p>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
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
              <AdvancedImage
                cldImg={poster.cldImg}
                className="w-full h-64 object-cover rounded-md mb-4"
                alt={poster.title}
              />
              <h3 className="text-xl font-bold text-[#F8F8F8] mb-2">{poster.title}</h3>
              <p className="text-[#CCD2E3]">A stunning example of our print design work.</p>
            </div>
          ))
        ) : (
          <p className="text-xl text-[#CCD2E3] col-span-full">No posters found. Please add public IDs to the `PosterGallery` component or configure your backend to provide them.</p>
        )}
      </div>
      <button onClick={onBack} className="px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
        Back to Graphics & Design
      </button>
    </div>
  );
};


// GraphicsDesign Component (now includes the portfolio selector)
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
              {/* Removed Graphics & Design from dropdown as it's the default view */}
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

// Main App Component
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