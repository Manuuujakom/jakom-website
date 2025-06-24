import React, { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce'; // Import debounce utility

// --- Game Words and Phrases ---
const GAME_DURATION = 60; // seconds
const VEHICLE_WIDTH = 70; // Slightly smaller vehicle width
const VEHICLE_HEIGHT = 45; // Slightly smaller vehicle height

const swahiliPhrases = {
    welcomeTitle: "KARIBU CYBER SAFARI!",
    welcomeMessage: `Jitayarishe kuongeza kasi ya kuandika na ujuzi wako wa kompyuta! Andika maneno ya teknolojia unapoona,
                    kusaidia gari lako la safari kusonga mbele. Kila neno sahihi huongeza alama zako na kukusogeza mbele.
                    Haraka haraka, na usikose herufi!
                    <br><br>
                    (Get ready to boost your typing speed and computer skills! Type the tech words you see,
                    to help your safari vehicle move forward. Every correct word boosts your score and moves you ahead.
                    Faster faster, and don't miss a letter!)`,
    startButton: "ANZA MCHEZO! (Start Game!)",
    goodJob: ["Kazi Nzuri!", "Heko!", "Vizuri Sana!", "Endelea!"],
    faster: ["Haraka haraka!", "Ongeza Kasi!", "Usisahau herufi!"],
    gameOver: "MCHEZO UMEKWISHA!",
    playAgain: "Cheza Tena? (Play Again?)",
    wrongLetter: "Sio Hiyo!",
    correctWord: "Sahihi!"
};

// --- GameHeader Component ---
const GameHeader = () => (
    <div className="text-4xl font-bold text-white text-center py-4 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg shadow-lg mb-4">
        CYBER SAFARI: KASI YA KOMPUTA
    </div>
);

// --- GameInfo Component ---
const GameInfo = ({ score, timeLeft }) => (
    <div className="flex justify-around items-center w-full max-w-md mx-auto bg-gray-800 text-white p-4 rounded-lg shadow-md mb-4 text-xl font-semibold border-2 border-yellow-500">
        <div>Alama (Score): <span className="text-yellow-400">{score}</span></div>
        <div>Muda (Time): <span className="text-yellow-400">{timeLeft}</span>s</div>
    </div>
);

// --- GameCanvas Component ---
const GameCanvas = React.memo(({ gameActive, vehicleX }) => {
    const canvasRef = useRef(null);

    const drawGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions based on its actual rendered size (from CSS)
        // This should always be done at the start of the draw function
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const groundLevel = canvas.height * 0.8;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw sky - Gradient for a nicer sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
        skyGradient.addColorStop(0, '#87ceeb'); // Light blue at top
        skyGradient.addColorStop(1, '#6a5acd'); // Slightly deeper blue towards horizon
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, groundLevel);

        // Draw ground (dirt road)
        ctx.fillStyle = '#a0522d'; // Sienna / Rust color for dirt
        ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

        // Draw main grass strip on the ground
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.fillRect(0, groundLevel, canvas.width, 10);

        // Draw simple sun
        ctx.fillStyle = '#ffd700'; // Gold color
        ctx.beginPath();
        ctx.arc(canvas.width - 70, 70, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw simple clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // White with some transparency
        ctx.beginPath();
        ctx.arc(150, 80, 30, 0, Math.PI * 2);
        ctx.arc(190, 80, 25, 0, Math.PI * 2);
        ctx.arc(170, 60, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(canvas.width - 250, 100, 25, 0, Math.PI * 2);
        ctx.arc(canvas.width - 210, 100, 20, 0, Math.PI * 2);
        ctx.arc(canvas.width - 230, 80, 18, 0, Math.PI * 2);
        ctx.fill();

        // --- Draw Road Features ---

        // Draw small patches of dark green grass (more varied)
        ctx.fillStyle = '#006400'; // Dark green
        const grassPatchHeight = 15;
        const grassPatchWidth = 20;
        const grassOffset = 5;
        for (let i = 0; i < canvas.width; i += 70) { // Draw grass every 70 pixels
            ctx.beginPath();
            ctx.moveTo(i, groundLevel - grassPatchHeight + grassOffset);
            ctx.lineTo(i + grassPatchWidth / 2, groundLevel + grassOffset);
            ctx.lineTo(i + grassPatchWidth, groundLevel - grassPatchHeight + grassOffset);
            ctx.fill();
        }

        // Draw simple signpost
        const signPostX = canvas.width - 150;
        const signPostY = groundLevel - 80;
        const signPostWidth = 10;
        const signPostHeight = 70;
        const signWidth = 60;
        const signHeight = 30;

        // Signpost pole (brown)
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ctx.fillRect(signPostX, signPostY, signPostWidth, signPostHeight);

        // Sign itself (light beige)
        ctx.fillStyle = '#F5F5DC'; // Beige
        ctx.fillRect(signPostX - (signWidth - signPostWidth) / 2, signPostY - signHeight, signWidth, signHeight);
        ctx.strokeStyle = '#333'; // Dark border for sign
        ctx.lineWidth = 2;
        ctx.strokeRect(signPostX - (signWidth - signPostWidth) / 2, signPostY - signHeight, signWidth, signHeight);
        
        // Add text to sign (optional, can be dynamic)
        ctx.fillStyle = '#000';
        ctx.font = '12px "Press Start 2P", cursive'; // Smaller font for sign
        ctx.textAlign = 'center';
        ctx.fillText("SAFARI", signPostX + signPostWidth / 2, signPostY - signHeight + 20); // Center text on sign

        // Draw Safari Vehicle
        const vehicleY = groundLevel - VEHICLE_HEIGHT - 5; // Adjust Y for a slightly lifted look

        // Vehicle body (reddish-brown)
        ctx.fillStyle = '#8B0000'; // DarkRed, a nice reddish-brown
        ctx.beginPath();
        ctx.roundRect(vehicleX, vehicleY, VEHICLE_WIDTH, VEHICLE_HEIGHT, 8); // Rounded corners
        ctx.fill();
        ctx.strokeStyle = '#333'; // Border for the vehicle
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vehicle roof (light beige)
        ctx.fillStyle = '#F5F5DC'; // Beige
        ctx.beginPath();
        ctx.roundRect(vehicleX + 5, vehicleY - 15, VEHICLE_WIDTH - 10, 20, 5); // Smaller, rounded roof
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Wheels (dark gray)
        ctx.fillStyle = '#333';
        const wheelRadius = 8; // Slightly smaller wheels
        ctx.beginPath();
        ctx.arc(vehicleX + wheelRadius + 5, groundLevel - wheelRadius - 2, wheelRadius, 0, Math.PI * 2); // Front wheel
        ctx.arc(vehicleX + VEHICLE_WIDTH - wheelRadius - 5, groundLevel - wheelRadius - 2, wheelRadius, 0, Math.PI * 2); // Rear wheel
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Headlights (small yellow circles)
        ctx.fillStyle = '#FFFF00'; // Yellow
        ctx.beginPath();
        ctx.arc(vehicleX + VEHICLE_WIDTH - 5, vehicleY + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vehicleX + VEHICLE_WIDTH - 5, vehicleY + VEHICLE_HEIGHT - 15, 3, 0, Math.PI * 2);
        ctx.fill();

    }, [vehicleX]); // vehicleX is a dependency for drawGame

    // Debounce the drawGame function for ResizeObserver
    const debouncedDrawGame = useCallback(
        debounce(() => {
            drawGame();
        }, 50), // Adjust debounce time as needed (e.g., 50ms to 200ms)
        [drawGame] // drawGame is a stable dependency here
    );

    // This effect handles initial sizing and redraws on resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Ensure canvas is available before observing

        const resizeObserver = new ResizeObserver(() => {
            // Simply call the debounced drawing function.
            // drawGame itself will handle setting canvas.width/height to match offsetWidth/offsetHeight.
            debouncedDrawGame();
        });

        resizeObserver.observe(canvas);

        // Initial draw: Ensure canvas dimensions are set correctly on mount
        // and then draw the initial scene.
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
            drawGame(); // Call drawGame directly for the first render
        }

        return () => {
            resizeObserver.disconnect();
            debouncedDrawGame.cancel();
        };
    }, [debouncedDrawGame, drawGame]); // Dependencies include debouncedDrawGame and drawGame

    // This effect handles the animation loop
    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            drawGame();
            animationFrameId = requestAnimationFrame(animate);
        };

        if (gameActive) {
            animate();
        } else {
            cancelAnimationFrame(animationFrameId);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameActive, drawGame]); // Dependencies for animation loop

    return (
        <canvas
            id="gameCanvas"
            ref={canvasRef}
            className="w-full h-80 bg-gray-200 rounded-lg shadow-inner border-2 border-gray-600"
            style={{ fontFamily: "'Press Start 2P', cursive" }} // Apply font for canvas text
        ></canvas>
    );
});

// --- TypingArea Component ---
const TypingArea = React.memo(({ currentWord, typedInput, handleInput, gameActive, isLoadingWord }) => {
    const highlightIncorrectLetters = useCallback(() => {
        const displayedWord = currentWord;
        let highlightedHtml = '';
        for (let i = 0; i < displayedWord.length; i++) {
            if (typedInput[i] && typedInput[i].toLowerCase() === displayedWord[i].toLowerCase()) {
                highlightedHtml += `<span class="text-yellow-400">${displayedWord[i]}</span>`;
            } else if (typedInput[i]) {
                highlightedHtml += `<span class="text-red-500">${displayedWord[i]}</span>`;
            } else {
                highlightedHtml += `<span class="text-gray-300">${displayedWord[i]}</span>`;
            }
        }
        return { __html: highlightedHtml };
    }, [currentWord, typedInput]);

    const inputRef = useRef(null);

    // Focus input when game starts or word changes
    useEffect(() => {
        if (gameActive && !isLoadingWord && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameActive, currentWord, isLoadingWord]);


    return (
        <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-md mt-4">
            {isLoadingWord ? (
                <div className="text-xl text-yellow-300 font-semibold mb-4 animate-pulse">
                    Inapakia neno... (Loading word...)
                </div>
            ) : (
                <>
                    <div
                        id="wordDisplay"
                        className="text-4xl font-bold mb-4 tracking-wider"
                        dangerouslySetInnerHTML={highlightIncorrectLetters()}
                    ></div>
                    <input
                        type="text"
                        id="textInput"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={typedInput}
                        onChange={handleInput}
                        disabled={!gameActive || isLoadingWord}
                        ref={inputRef}
                        className="w-full max-w-md p-3 text-2xl text-center bg-gray-700 text-white rounded-lg border-2 border-yellow-500 focus:outline-none focus:border-yellow-300 transition-all duration-200"
                    />
                </>
            )}
        </div>
    );
});

// --- GameOverlay Component ---
const GameOverlay = ({ isActive, title, message, buttonText, onStartGame }) => (
    <div
        id="gameOverlay"
        className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-500 ${
            isActive ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
    >
        <div className="bg-gray-900 border-4 border-yellow-500 rounded-lg shadow-xl p-8 text-center max-w-lg mx-auto">
            <h2 id="overlayTitle" className="text-yellow-400 text-5xl font-extrabold mb-4 animate-bounce-slow">
                {title}
            </h2>
            <p
                id="overlayMessage"
                className="text-white text-lg mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: message }}
            ></p>
            <button
                id="startButton"
                onClick={onStartGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full text-2xl uppercase shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
            >
                {buttonText}
            </button>
        </div>
    </div>
);

// --- Main TypingGame Component ---
function TypingGame() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentWord, setCurrentWord] = useState('');
    const [typedInput, setTypedInput] = useState('');
    const [gameActive, setGameActive] = useState(false);
    const [overlayActive, setOverlayActive] = useState(true);
    const [overlayTitle, setOverlayTitle] = useState(swahiliPhrases.welcomeTitle);
    const [overlayMessage, setOverlayMessage] = useState(swahiliPhrases.welcomeMessage);
    const [startButtonText, setStartButtonText] = useState(swahiliPhrases.startButton);
    const [vehicleX, setVehicleX] = useState(50); // Vehicle X position for canvas drawing
    const [isLoadingWord, setIsLoadingWord] = useState(false); // New state for loading indicator

    const audioContextRef = useRef(null);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported in this browser. No sound effects.');
            }
        }
    }, []);

    const playCorrectSound = useCallback(() => {
        if (!audioContextRef.current) return;
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.15);
        oscillator.stop(audioContextRef.current.currentTime + 0.15);
    }, []);

    const playTimeUpSound = useCallback(() => {
        if (!audioContextRef.current) return;
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.8, audioContextRef.current.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
    }, []);

    // --- New function to fetch a random word ---
    const fetchRandomWord = useCallback(async () => {
        setIsLoadingWord(true); // Set loading state
        try {
            // Using a different API for tech-related words, or a generic one.
            // random-word-api.herokuapp.com is general, let's use a list of tech words as fallback
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data && data.length > 0) {
                setCurrentWord(data[0]);
            } else {
                // Fallback to a hardcoded list if API fails or returns no words
                console.warn('API returned no words. Using fallback tech words.');
                const fallbackWords = [
                    "algorithm", "backend", "cloud", "database", "encryption",
                    "frontend", "framework", "internet", "javascript", "keyboard",
                    "malware", "network", "protocol", "security", "server",
                    "software", "storage", "terminal", "website", "wireless"
                ];
                const randomIndex = Math.floor(Math.random() * fallbackWords.length);
                setCurrentWord(fallbackWords[randomIndex]);
            }
        } catch (error) {
            console.error("Failed to fetch word:", error);
            // Fallback to a hardcoded list on error
            const fallbackWords = [
                "algorithm", "backend", "cloud", "database", "encryption",
                "frontend", "framework", "internet", "javascript", "keyboard",
                "malware", "network", "protocol", "security", "server",
                "software", "storage", "terminal", "website", "wireless"
            ];
            const randomIndex = Math.floor(Math.random() * fallbackWords.length);
            setCurrentWord(fallbackWords[randomIndex]);
        } finally {
            setIsLoadingWord(false); // Clear loading state
            setTypedInput(''); // Clear input for the new word
        }
    }, []);


    const showTemporaryMessage = useCallback((message, color) => {
        const gameWrapper = document.querySelector('.typing-game-wrapper');
        if (!gameWrapper) return;

        const tempMessageDiv = document.createElement('div');
        tempMessageDiv.textContent = message;
        tempMessageDiv.style.position = 'absolute';
        tempMessageDiv.style.top = '50%';
        tempMessageDiv.style.left = '50%';
        tempMessageDiv.style.transform = 'translate(-50%, -50%)';
        tempMessageDiv.style.fontSize = '3em';
        tempMessageDiv.style.fontFamily = "'Press Start 2P', cursive";
        tempMessageDiv.style.color = color;
        tempMessageDiv.style.textShadow = '3px 3px #000';
        tempMessageDiv.style.opacity = '1';
        tempMessageDiv.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        tempMessageDiv.style.zIndex = '30';
        gameWrapper.appendChild(tempMessageDiv);

        setTimeout(() => {
            tempMessageDiv.style.opacity = '0';
            tempMessageDiv.style.transform = 'translate(-50%, -100%) scale(0.8)';
        }, 500);

        tempMessageDiv.addEventListener('transitionend', () => {
            if (tempMessageDiv.parentNode) {
                tempMessageDiv.parentNode.removeChild(tempMessageDiv);
            }
        }, { once: true });
    }, []);

    const handleInput = useCallback((event) => {
        if (!gameActive || isLoadingWord) return; // Prevent typing while loading

        const typedText = event.target.value;
        setTypedInput(typedText);

        if (typedText.toLowerCase() === currentWord.toLowerCase()) {
            setScore(prevScore => prevScore + currentWord.length);
            setVehicleX(prevX => {
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    // Adjust movement based on word length to prevent too fast/slow movement
                    const movementFactor = Math.max(1, currentWord.length / 5); // Longer words move more
                    const newX = prevX + (20 * movementFactor);
                    return Math.min(newX, canvas.width - VEHICLE_WIDTH - 50);
                }
                return prevX;
            });
            playCorrectSound();
            showTemporaryMessage(swahiliPhrases.correctWord, 'green');
            fetchRandomWord(); // Fetch a new word
        } else if (typedText.length >= currentWord.length) {
            // If the typed text is as long as the word but incorrect,
            // for now, we just clear the input and get a new word (no score penalty)
            setTypedInput('');
            showTemporaryMessage(swahiliPhrases.wrongLetter, 'orange');
            fetchRandomWord();
        }
    }, [gameActive, currentWord, playCorrectSound, fetchRandomWord, showTemporaryMessage, isLoadingWord]); // Added isLoadingWord to dependencies

    const startGame = useCallback(() => {
        initAudio();
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setVehicleX(50);
        setGameActive(true);
        setOverlayActive(false);
        fetchRandomWord(); // Initial word fetch
        setTypedInput('');
    }, [fetchRandomWord, initAudio]);

    const endGame = useCallback(() => {
        setGameActive(false);
        setOverlayActive(true);
        setOverlayTitle(swahiliPhrases.gameOver);
        setOverlayMessage(`Alama zako ni: <span style="color:#ffd700; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!<br><br>
                            (Your Score: <span style="color:#ffd700; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!)`);
        setStartButtonText(swahiliPhrases.playAgain);
        playTimeUpSound();
    }, [score, playTimeUpSound]);

    // Timer effect
    useEffect(() => {
        let gameInterval;
        if (gameActive) {
            gameInterval = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(gameInterval);
                        endGame();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => clearInterval(gameInterval);
    }, [gameActive, endGame]);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 p-4 font-inter">
            {/* Added a link for the custom font, assuming it's available or will be linked in the parent HTML */}
            <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                .font-press-start {
                    font-family: 'Press Start 2P', cursive;
                }
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite ease-in-out;
                }
                `}
            </style>
            <GameHeader />
            <GameInfo score={score} timeLeft={timeLeft} />
            <GameCanvas gameActive={gameActive} vehicleX={vehicleX} />
            <TypingArea
                currentWord={currentWord}
                typedInput={typedInput}
                handleInput={handleInput}
                gameActive={gameActive}
                isLoadingWord={isLoadingWord} // Pass isLoadingWord to TypingArea
            />
            <GameOverlay
                isActive={overlayActive}
                title={overlayTitle}
                message={overlayMessage}
                buttonText={startButtonText}
                onStartGame={startGame}
            />
        </div>
    );
}

export default TypingGame;
