import React from 'react';
// import './Card.css'; // Removed: CSS is now integrated directly using Tailwind CSS

const Card = ({ title, children, fullContent = false }) => {
  return (
    // Applied Tailwind classes to mimic the expected Card.css styling
    <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
      {title && (
        // Applied Tailwind classes for the title
        <h2 className="text-2xl font-bold text-[#F8F8F8] mb-2">
          {title}
        </h2>
      )}
      {/* Apply flex-grow and w-full for fullContent, ensuring content can expand */}
      <div className={`flex flex-col items-center w-full ${fullContent ? 'flex-grow' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
