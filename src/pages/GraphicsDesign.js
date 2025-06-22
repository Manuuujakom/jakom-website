import React from 'react';

const GraphicsDesign = () => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Graphics & Design Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Transform your vision into stunning visual realities. Our graphic design experts craft compelling logos, engaging marketing materials, and cohesive brand identities that resonate with your audience.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Example Service Item */}
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
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Print" alt="Print Design" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Print & Marketing</h3>
            <p className="text-[#CCD2E3]">Brochures, flyers, business cards, and more.</p>
        </div>
      </div>
      {/* Back button */}
      <button onClick={() => window.history.back()} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        Back to Home
      </button>
    </div>
  );
};

export default GraphicsDesign;
