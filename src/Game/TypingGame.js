import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TypingGame.css';
import debounce from 'lodash.debounce'; // Import debounce utility

// --- Game Words and Phrases ---
const GAME_DURATION = 60; // seconds
const VEHICLE_WIDTH = 80; // Defined as a constant for consistent access
const VEHICLE_HEIGHT = 50; // Also define vehicle height as a constant

// Removed the static 'words' array. We will fetch words dynamically.
// const words = [
//     "Keyboard", "Mouse", "Monitor", "CPU", "RAM", "ROM", "Software", "Hardware",
//     "Browser", "Internet", "Wi-Fi", "Ethernet", "Firewall", "Virus", "Antivirus",
//     "Backup", "Cloud", "Server", "Network", "Byte", "Bit", "Pixel", "Resolution",
//     "USB", "HDMI", "Bluetooth", "Code", "Program", "Algorithm", "Loop", "Variable",
//     "Function", "Debug", "HTML", "CSS", "JavaScript", "Database", "Security",
//     "Processor", "Storage", "Application", "Website", "Domain", "Hosting",
//     "Encryption", "Malware", "Phishing", "Spam", "Firewall", "Router",
//     "Modem", "Gigabyte", "Megabyte", "Kilobyte", "TeraByte", "Output", "Input",
//     "Array", "Object", "Boolean", "String", "Integer", "Float", "Syntax", "Error"
// ];

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
    <div className="game-header">
        CYBER SAFARI: KASI YA KOMPUTA
    </div>
);

// --- GameInfo Component ---
const GameInfo = ({ score, timeLeft }) => (
    <div className="game-info">
        <div>Alama (Score): <span>{score}</span></div>
        <div>Muda (Time): <span>{timeLeft}</span>s</div>
    </div>
);

// --- GameCanvas Component ---
const GameCanvas = React.memo(({ gameActive, vehicleX }) => {
    const canvasRef = useRef(null);

    const drawGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const groundLevel = canvas.height * 0.8;
        const vehicleY = groundLevel - VEHICLE_HEIGHT;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw sky
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, groundLevel);

        // Draw ground (dirt)
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

        // Draw grass on the ground
        ctx.fillStyle = '#367c39';
        ctx.fillRect(0, groundLevel, canvas.width, 10);

        // Draw simple sun
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(canvas.width - 70, 70, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw simple clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
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

        // Draw safari vehicle (simple rectangle with wheels)
        ctx.fillStyle = '#b03a2e';
        ctx.fillRect(vehicleX, vehicleY, VEHICLE_WIDTH, VEHICLE_HEIGHT);
        // Wheels
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(vehicleX + 20, groundLevel - 10, 10, 0, Math.PI * 2);
        ctx.arc(vehicleX + VEHICLE_WIDTH - 20, groundLevel - 10, 10, 0, Math.PI * 2);
        ctx.fill();
    }, [vehicleX]);

    // Debounce the drawGame function for ResizeObserver
    const debouncedDrawGame = useCallback(
        debounce(() => {
            drawGame();
        }, 50), // Adjust debounce time as needed (e.g., 50ms to 200ms)
        [drawGame]
    );

    // This effect handles initial sizing and redraws on resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Ensure canvas is available before observing

        const resizeObserver = new ResizeObserver(() => {
            debouncedDrawGame();
        });

        resizeObserver.observe(canvas);

        return () => {
            resizeObserver.disconnect();
            debouncedDrawGame.cancel();
        };
    }, [debouncedDrawGame]);


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
    }, [gameActive, drawGame]);

    return <canvas id="gameCanvas" ref={canvasRef}></canvas>;
});

// --- TypingArea Component ---
const TypingArea = React.memo(({ currentWord, typedInput, handleInput, gameActive }) => {
    const highlightIncorrectLetters = useCallback(() => {
        const displayedWord = currentWord;
        let highlightedHtml = '';
        for (let i = 0; i < displayedWord.length; i++) {
            if (typedInput[i] && typedInput[i].toLowerCase() === displayedWord[i].toLowerCase()) {
                highlightedHtml += `<span style="color: yellow;">${displayedWord[i]}</span>`;
            } else if (typedInput[i]) {
                highlightedHtml += `<span style="color: red;">${displayedWord[i]}</span>`;
            } else {
                highlightedHtml += `<span>${displayedWord[i]}</span>`;
            }
        }
        return { __html: highlightedHtml };
    }, [currentWord, typedInput]);

    const inputRef = useRef(null);

    // Focus input when game starts or word changes
    useEffect(() => {
        if (gameActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameActive, currentWord]);


    return (
        <div className="typing-area">
            <div id="wordDisplay" dangerouslySetInnerHTML={highlightIncorrectLetters()}></div>
            <input
                type="text"
                id="textInput"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                value={typedInput}
                onChange={handleInput}
                disabled={!gameActive}
                ref={inputRef}
            />
        </div>
    );
});

// --- GameOverlay Component ---
const GameOverlay = ({ isActive, title, message, buttonText, onStartGame }) => (
    <div id="gameOverlay" className={`overlay ${isActive ? 'active' : ''}`}>
        <div className="overlay-content">
            <h2 id="overlayTitle">{title}</h2>
            <p id="overlayMessage" dangerouslySetInnerHTML={{ __html: message }}></p>
            <button id="startButton" onClick={onStartGame}>{buttonText}</button>
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
            // You can adjust the length parameter if the API supports it.
            // For example: `https://random-word-api.herokuapp.com/word?length=5` for 5-letter words
            const response = await fetch('https://random-word-api.herokuapp.com/word');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // The API returns an array, usually with one word: ["example"]
            if (data && data.length > 0) {
                setCurrentWord(data[0]);
            } else {
                // Fallback if API returns empty array or unexpected data
                console.warn('API returned no words. Using fallback word.');
                setCurrentWord("fallback"); // A simple fallback
            }
        } catch (error) {
            console.error("Failed to fetch word:", error);
            setCurrentWord("error"); // Show an error word or handle gracefully
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
            // you might want to penalize or simply not advance.
            // For now, let's just clear the input and get a new word (with no score).
            // showTemporaryMessage(swahiliPhrases.wrongLetter, 'orange'); // Optional: show a "wrong" message
            // setTypedInput('');
            // fetchRandomWord();
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
        <div className="typing-game-wrapper">
            <GameHeader />
            <GameInfo score={score} timeLeft={timeLeft} />
            <GameCanvas gameActive={gameActive} vehicleX={vehicleX} />
            {isLoadingWord ? ( // Show a loading message when fetching a word
                <div className="typing-area loading-word-message">
                    Inapakia neno... (Loading word...)
                </div>
            ) : (
                <TypingArea
                    currentWord={currentWord}
                    typedInput={typedInput}
                    handleInput={handleInput}
                    gameActive={gameActive}
                />
            )}
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