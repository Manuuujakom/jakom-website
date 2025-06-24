import React, { useState } from 'react';
import Card from '../components/Card/Card'; // Assuming your Card component is here
import TypingGame from '../Game/TypingGame'; // Import the TypingGame component

const KidsHub = () => {
    // State to control whether the TypingGame is shown
    const [showTypingGame, setShowTypingGame] = useState(false);

    // Removed themeColors as it's no longer used
    // const themeColors = {
    //     primaryBg: '#0A1128',
    //     textColor: '#F8F8F8',
    //     accentColor: '#C9B072',
    //     secondaryText: '#CCD2E3',
    //     borderColor: '#4CAF50',
    // };

    return (
        <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
            {/* Conditionally render the game or the main Kids Hub content */}
            {showTypingGame ? (
                // Render the TypingGame when showTypingGame is true
                <Card title="Cyber Safari: Typing Challenge" fullContent={true}>
                    <TypingGame />
                    {/* Add a button to close the game and go back to Kids Hub content */}
                    <button
                        onClick={() => setShowTypingGame(false)}
                        className="mt-4 px-6 py-2 bg-[#C9B072] text-[#0A1128] font-semibold text-md rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90"
                        style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 40 }}
                    >
                        Close Game
                    </button>
                </Card>
            ) : (
                // Render the main Kids Hub content when showTypingGame is false
                <>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
                        JAKOM Kids Hub
                    </h1>
                    <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Ignite curiosity and foster a love for technology and creativity in the next generation! Our Kids Hub offers engaging and interactive programs designed to introduce children to the exciting world of coding, design, and problem-solving through fun activities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-10">
                        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Code" alt="Coding Workshops" className="mb-4 rounded-full p-2" />
                            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Coding Workshops</h3>
                            <p className="text-[#CCD2E3]">Fun and interactive coding lessons for all ages.</p>
                        </div>
                        <div
                            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Design" alt="Creative Design" className="mb-4 rounded-full p-2" />
                            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Creative Design Challenges</h3>
                            <p className="text-[#CCD2E3]">Spark imagination through digital art and design.</p>
                        </div>
                        {/* The "Fun Games" Section - now clickable to show the game */}
                        <div
                            className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up cursor-pointer hover:scale-105 transition duration-300" // Added cursor-pointer and hover effects back
                            style={{ animationDelay: '0.8s' }}
                            onClick={() => setShowTypingGame(true)} // Set showTypingGame to true on click
                        >
                            <img src="https://placehold.co/100x100/0A1128/C9B072?text=PLAY" alt="Fun Games" className="mb-4 rounded-full p-2" />
                            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Fun Games</h3>
                            <p className="text-[#CCD2E3]">Enjoy engaging and interactive games!</p> {/* Removed "Currently unavailable" */}
                        </div>
                    </div>

                    <button onClick={() => window.history.back()} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                        Back to Home
                    </button>
                </>
            )}
        </div>
    );
};

export default KidsHub;