// src/pages/GraphicsDesign.js
import React from 'react';

const GraphicsDesignPage = () => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center py-16 px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-8 text-center">
        Graphics & Design Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl text-center leading-relaxed mb-12">
        This is the Graphics & Design page. Our designers are ready to bring your visual ideas to life!
      </p>
      <img src="https://placehold.co/600x400/C9B072/0A1128?text=Graphics+Design" alt="Graphics Design" className="rounded-xl shadow-lg mb-8" />
      <a
        href="/contact-us"
        className="px-8 py-3 bg-[#4CAF50] text-[#F8F8F8] font-semibold text-lg rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
      >
        Get a Design Quote
      </a>
    </div>
  );
};

export default GraphicsDesignPage;
