// src/components/PlaceholderPage.js
// This component provides a generic structure for pages that are not yet fully developed.

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6">{title}</h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10">
        Content for {title} will go here. You can edit the actual page file (e.g., `src/pages/{title}.js`) to add your specific content.
      </p>
      <Link to="/" className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
        Back to Home
      </Link>
    </div>
  );
};

export default PlaceholderPage;
