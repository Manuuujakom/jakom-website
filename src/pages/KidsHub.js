import React, { useState, useEffect, useRef, useCallback } from 'react';

// CyberSafariGame Component
const CyberSafariGame = ({ themeColors, onClose }) => {
  // Destructure theme colors for easier access
  const { primaryBg, textColor, accentColor, secondaryText, borderColor } = themeColors;

  // Game state variables
  const canvasRef = useRef(null);
  const wordDisplayRef = useRef(null);
  const textInputRef = useRef(null);
  const gameWrapperRef = useRef(null); // Ref for the main game wrapper for sizing

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // GAME_DURATION
  const [currentWord, setCurrentWord] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState('KARIBU CYBER SAFARI!');
  const [overlayMessage, setOverlayMessage] = useState(
    `Jitayarishe kuongeza kasi ya kuandika na ujuzi wako wa kompyuta! Andika maneno ya teknolojia unapoona,
    kusaidia gari lako la safari kusonga mbele. Kila neno sahihi huongeza alama zako na kukusogeza mbele.
    Haraka haraka, na usikose herufi!
    <br><br>
    (Get ready to boost your typing speed and computer skills! Type the tech words you see,
    to help your safari vehicle move forward. Every correct word boosts your score and moves you ahead.
    Faster faster, and don't miss a letter!)`
  );
  const [startButtonText, setStartButtonText] = useState('ANZA MCHEZO! (Start Game!)');

  // Interval and animation frame IDs
  const gameIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Audio Context for sound effects
  const audioContextRef = useRef(null);

  // Tech-related words with a mix of difficulty
  const words = useRef([
    "Keyboard", "Mouse", "Monitor", "CPU", "RAM", "ROM", "Software", "Hardware",
    "Browser", "Internet", "Wi-Fi", "Ethernet", "Firewall", "Virus", "Antivirus",
    "Backup", "Cloud", "Server", "Network", "Byte", "Bit", "Pixel", "Resolution",
    "USB", "HDMI", "Bluetooth", "Code", "Program", "Algorithm", "Loop", "Variable",
    "Function", "Debug", "HTML", "CSS", "JavaScript", "Database", "Security",
    "Processor", "Storage", "Application", "Website", "Domain", "Hosting",
    "Encryption", "Malware", "Phishing", "Spam", "Firewall", "Router",
    "Modem", "Gigabyte", "Megabyte", "Kilobyte", "TeraByte", "Output", "Input",
    "Array", "Object", "Boolean", "String", "Integer", "Float", "Syntax", "Error"
  ]).current; // Use useRef for constant data

  // Shuffled words for the current session to prevent repetition
  const shuffledWordsForSession = useRef([]);

  // Swahili phrases for encouragement/game events
  const swahiliPhrases = {
    start: "ANZA!",
    goodJob: ["Kazi Nzuri!", "Heko!", "Vizuri Sana!", "Endelea!"],
    faster: ["Haraka haraka!", "Ongeza Kasi!", "Usisahau herufi!"],
    gameOver: "MCHEZO UMEKWISHA!",
    playAgain: "Cheza Tena?",
    wrongLetter: "Sio Hiyo!",
    correctWord: "Sahihi!",
    gameQuit: "MCHEZO UMEACHWA!",
    quitMessage: "Umeamua kuacha mchezo. Tufanye tena! (You chose to quit the game. Let's play again!)"
  };

  // Canvas Drawing Properties
  const vehicle = useRef({ x: 50, y: 0, width: 80, height: 50, speed: 0.5 }).current;
  const groundLevelRef = useRef(0); // Will be set based on canvas height

  // Function to initialize AudioContext on user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported in this browser. No sound effects.', e);
      }
    }
  }, []);

  const playCorrectSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4
    gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.15); // Quick fade out
    oscillator.stop(audioContextRef.current.currentTime + 0.15);
  }, []);

  // Game Functions
  const getRandomWord = useCallback(() => {
    // If all words have been used, reshuffle the entire list
    if (shuffledWordsForSession.current.length === 0) {
      // Fisher-Yates (Knuth) shuffle algorithm for `words`
      let tempWords = [...words.current]; // Create a mutable copy of words.current
      for (let i = tempWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempWords[i], tempWords[j]] = [tempWords[j], tempWords[i]]; // Swap
      }
      shuffledWordsForSession.current = tempWords;
    }

    const wordToUse = shuffledWordsForSession.current.pop(); // Get and remove the last word
    setCurrentWord(wordToUse.toLowerCase());
    if (wordDisplayRef.current) {
      wordDisplayRef.current.textContent = wordToUse; // Display original case
    }
    if (textInputRef.current) {
      textInputRef.current.value = '';
      textInputRef.current.focus();
    }
  }, [words]); // Dependency on words.current implicit through words.current.length

  // Unified End Game function for timer end and quit
  const endGame = useCallback((quit = false) => {
    setGameActive(false);
    clearInterval(gameIntervalRef.current);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (textInputRef.current) {
      textInputRef.current.disabled = true;
    }

    if (quit) {
      setOverlayTitle(swahiliPhrases.gameQuit);
      setOverlayMessage(swahiliPhrases.quitMessage);
    } else {
      setOverlayTitle(swahiliPhrases.gameOver);
      setOverlayMessage(
        `Alama zako ni: <span style="color:${accentColor}; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!<br><br>
        (Your Score: <span style="color:${accentColor}; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!)`
      );
    }
    setStartButtonText(swahiliPhrases.playAgain);
    setShowOverlay(true);
  }, [score, accentColor, swahiliPhrases]);

  const updateGame = useCallback(() => {
    setTimeLeft(prevTime => {
      const newTime = prevTime - 1;
      if (newTime <= 0) {
        endGame(false); // Game ended by timer
        return 0;
      }
      return newTime;
    });
  }, [endGame]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const groundLevel = groundLevelRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw sky
    ctx.fillStyle = '#87ceeb'; /* Sky blue */
    ctx.fillRect(0, 0, canvas.width, groundLevel);

    // Draw ground (dirt)
    ctx.fillStyle = '#a0522d'; /* Sienna */
    ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

    // Draw grass on the ground - using theme's border color or a darker variant
    ctx.fillStyle = '#367c39'; /* Darker green for grass, blends well with the border color */
    ctx.fillRect(0, groundLevel, canvas.width, 10); /* Thin strip of grass */

    // Draw simple sun - using theme's accent color
    ctx.fillStyle = accentColor;
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
    ctx.fillStyle = '#b03a2e'; /* Reddish-brown, a complementary color */
    ctx.fillRect(vehicle.x, groundLevel - vehicle.height, vehicle.width, vehicle.height);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(vehicle.x + 20, groundLevel - 10, 10, 0, Math.PI * 2);
    ctx.arc(vehicle.x + vehicle.width - 20, groundLevel - 10, 10, 0, Math.PI * 2);
    ctx.fill();

    if (gameActive) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameActive, accentColor, vehicle]);

  const highlightIncorrectLetters = useCallback((typedText) => {
    const displayedWord = wordDisplayRef.current?.textContent;
    if (!displayedWord) return;

    let highlightedHtml = '';
    for (let i = 0; i < displayedWord.length; i++) {
      if (typedText[i] && typedText[i].toLowerCase() === displayedWord[i].toLowerCase()) {
        highlightedHtml += `<span style="color: yellow;">${displayedWord[i]}</span>`;
      } else if (typedText[i]) {
        highlightedHtml += `<span style="color: red;">${displayedWord[i]}</span>`;
      } else {
        highlightedHtml += `<span>${displayedWord[i]}</span>`;
      }
    }
    wordDisplayRef.current.innerHTML = highlightedHtml;
  }, []);

  const showTemporaryMessage = useCallback((message, color) => {
    const gameWrapper = gameWrapperRef.current;
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

  const handleInput = useCallback(() => {
    if (!gameActive) return;

    const typedText = textInputRef.current.value.toLowerCase();
    if (typedText === currentWord) {
      setScore(prevScore => prevScore + currentWord.length);
      vehicle.x += 20; // Move vehicle forward
      const canvas = canvasRef.current;
      if (canvas && vehicle.x > canvas.width - vehicle.width) {
        vehicle.x = canvas.width - vehicle.width - 50; // Keep in bounds
      }
      playCorrectSound();
      showTemporaryMessage(swahiliPhrases.correctWord, 'green');
      getRandomWord(); // Get next word
    } else {
      highlightIncorrectLetters(typedText);
    }
  }, [gameActive, currentWord, vehicle, playCorrectSound, showTemporaryMessage, getRandomWord, highlightIncorrectLetters, swahiliPhrases.correctWord]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(60); // Reset to GAME_DURATION
    vehicle.x = 50; // Reset vehicle position
    setGameActive(true);
    setShowOverlay(false);
    shuffledWordsForSession.current = []; // Clear and re-shuffle words for new session
    if (textInputRef.current) {
      textInputRef.current.disabled = false;
      textInputRef.current.value = '';
      textInputRef.current.focus();
    }
    getRandomWord(); // Get the first word of the new session
    gameIntervalRef.current = setInterval(updateGame, 1000);
    gameLoop();
  }, [getRandomWord, updateGame, gameLoop, vehicle]);

  const handleQuitGame = useCallback(() => {
    endGame(true); // Call endGame with 'quit' flag
  }, [endGame]);


  const resizeCanvas = useCallback(() => {
    const gameWrapper = gameWrapperRef.current;
    const canvas = canvasRef.current;
    if (!gameWrapper || !canvas) return;

    const header = gameWrapper.querySelector('.game-header');
    const info = gameWrapper.querySelector('.game-info');
    const typingArea = gameWrapper.querySelector('.typing-area');

    const headerHeight = header ? header.offsetHeight : 0;
    const infoHeight = info ? info.offsetHeight : 0;
    const typingAreaHeight = typingArea ? typingArea.offsetHeight : 0;

    canvas.width = gameWrapper.clientWidth;
    canvas.height = gameWrapper.clientHeight - headerHeight - infoHeight - typingAreaHeight;
    groundLevelRef.current = canvas.height * 0.8; // 80% of canvas height for ground
    vehicle.y = groundLevelRef.current - vehicle.height; // Adjust vehicle y position
    gameLoop(); // Redraw after resize
  }, [gameLoop, vehicle]);

  // Initial setup and resize on component mount
  useEffect(() => {
    resizeCanvas(); // Set initial canvas size
    window.addEventListener('resize', resizeCanvas); // Resize on window change

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(gameIntervalRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
      }
    };
  }, [resizeCanvas]); // Dependency: resizeCanvas is stable due to useCallback

  // Effect to update game loop when gameActive changes
  useEffect(() => {
    if (gameActive) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameActive, gameLoop]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Full-screen overlay for the game */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
           style={{ backgroundColor: `rgba(10, 17, 40, 0.95)` }}> {/* Using primaryBg with opacity for backdrop */}
        <div
          ref={gameWrapperRef}
          className="relative rounded-xl shadow-lg flex flex-col overflow-hidden max-w-[900px] w-full h-full max-h-[600px]"
          style={{
            backgroundColor: `rgba(255, 255, 255, 0.1)`, // Slightly transparent white overlay over main background
            boxShadow: `0 0 30px rgba(0, 0, 0, 0.4)`,
            color: textColor // Default text color
          }}
        >
          {/* Close button for the game modal */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ease"
            style={{ backgroundColor: accentColor, color: primaryBg }}
          >
            X Close Game
          </button>

          <div className="game-header p-[15px_20px] rounded-t-[20px] text-center text-[1.5rem] relative z-10"
               style={{ backgroundColor: accentColor, fontFamily: "'Press Start 2P', cursive", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)" }}>
            CYBER SAFARI: KASI YA KOMPYUTA
          </div>
          <div className="game-info flex justify-around p-[10px_20px] text-[1.1rem] font-semibold border-b-[2px] z-9"
               style={{ backgroundColor: borderColor, borderColor: borderColor }}>
            <div>Alama (Score): <span id="score">{score}</span></div>
            <div>Muda (Time): <span id="timer">{timeLeft}s</span></div>
            {gameActive && ( // Show quit button only when game is active
              <button
                onClick={handleQuitGame}
                className="px-4 py-1 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 ease"
                style={{ backgroundColor: primaryBg, color: textColor, border: `1px solid ${textColor}` }}
              >
                Acha Mchezo (Quit)
              </button>
            )}
          </div>
          <canvas ref={canvasRef} id="gameCanvas" className="flex-grow block w-full touch-action-none select-none -webkit-tap-highlight-color:transparent"
                  style={{ backgroundColor: '#87ceeb' }}></canvas>
          <div className="typing-area p-[15px_20px] rounded-b-[20px] flex flex-col items-center justify-center gap-[10px] z-10"
               style={{ backgroundColor: accentColor }}>
            <div ref={wordDisplayRef} id="wordDisplay" className="text-[1.8rem] mb-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
                 style={{ fontFamily: "'Press Start 2P', cursive", color: textColor, textShadow: "2px 2px #000" }}>READY!</div>
            <input
              ref={textInputRef}
              type="text"
              id="textInput"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={handleInput}
              disabled={!gameActive}
              className="w-[80%] max-w-[400px] p-[10px_15px] border-[2px] rounded-[10px] text-[1.2rem] text-center outline-none transition-all duration-200 ease-in-out"
              style={{
                borderColor: textColor,
                backgroundColor: secondaryText, // Using secondaryText for input background
                color: primaryBg, // Input text color same as primary background for contrast
              }}
            />
          </div>

          {/* Start/Game Over Overlay */}
          {showOverlay && (
            <div id="gameOverlay" className={`overlay absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center text-center z-20 transition-opacity duration-500 ease ${showOverlay ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <div className="overlay-content">
                <h2 id="overlayTitle" className="text-[2.5rem] mb-[20px] text-shadow-[3px_3px_#000]"
                    style={{ fontFamily: "'Press Start 2P', cursive", color: accentColor }}
                    dangerouslySetInnerHTML={{ __html: overlayTitle }}
                ></h2>
                <p id="overlayMessage" className="text-[1.2rem] mb-[15px] max-w-[80%] mx-auto leading-tight"
                   style={{ color: textColor }}
                   dangerouslySetInnerHTML={{ __html: overlayMessage }}
                ></p>
                <button
                  id="startButton"
                  onClick={() => { initAudio(); startGame(); }}
                  className="px-[30px] py-[15px] border-none rounded-[10px] text-[1.5rem] font-bold cursor-pointer transition-all duration-300 ease shadow-[0_5px_#367c39] hover:translate-y-[-2px] hover:shadow-[0_7px_#367c39] active:translate-y-[3px] active:shadow-[0_2px_#367c39]"
                  style={{ backgroundColor: borderColor, color: textColor, fontFamily: "'Press Start 2P', cursive" }}
                >
                  {startButtonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// KidsHub Component
const KidsHub = () => {
  const [showCyberSafariGame, setShowCyberSafariGame] = useState(false);

  // Define theme colors for consistent styling
  const themeColors = {
    primaryBg: '#0A1128',
    textColor: '#F8F8F8',
    accentColor: '#C9B072',
    secondaryText: '#CCD2E3',
    borderColor: '#4CAF50',
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
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
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Design" alt="Creative Design" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Creative Design Challenges</h3>
          <p className="text-[#CCD2E3]">Spark imagination through digital art and design.</p>
        </div>
        {/* New Games Section */}
        <div
          className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up cursor-pointer hover:scale-105 transition-transform duration-300"
          style={{ animationDelay: '0.8s' }}
          onClick={() => setShowCyberSafariGame(true)}
        >
          {/* Using a placeholder for a game icon, you can replace with a real one */}
          <img src="https://placehold.co/100x100/0A1128/C9B072?text=PLAY" alt="Fun Games" className="mb-4 rounded-full p-2" />
          <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Fun Games</h3>
          <p className="text-[#CCD2E3]">Enjoy engaging and interactive games!</p>
        </div>
      </div>

      {/* Cyber Safari Game as a Conditional Overlay */}
      {showCyberSafariGame && (
        <CyberSafariGame themeColors={themeColors} onClose={() => setShowCyberSafariGame(false)} />
      )}

      <button onClick={() => window.history.back()} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        Back to Home
      </button>
    </div>
  );
};

export default KidsHub;
