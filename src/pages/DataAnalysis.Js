import React from 'react';

const DataAnalysis = () => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Data Analysis Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Unlock the power of your data with our comprehensive data analysis services. We transform raw data into actionable insights, helping you make informed business decisions and identify growth opportunities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Trends" alt="Trend Analysis" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Trend Analysis</h3>
            <p className="text-[#CCD2E3]">Identify patterns and predict future outcomes.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Reports" alt="Custom Reports" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Custom Reporting</h3>
            <p className="text-[#CCD2E3]">Tailored reports for clear and concise understanding.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Insights" alt="Actionable Insights" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Actionable Insights</h3>
            <p className="text-[#CCD2E3]">Translate complex data into strategic business moves.</p>
        </div>
      </div>
      <button onClick={() => window.history.back()} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        Back to Home
      </button>
    </div>
  );
};

export default DataAnalysis;
