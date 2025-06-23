import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Ensure 'lucide-react' is installed if you plan to add more icons to KidsHub later
// import { Code, Design } from 'lucide-react';

const KidsHub = () => {
  // Game State Variables
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [overlayActive, setOverlayActive] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState("KARIBU CYBER SAFARI!");
  const [overlayMessage, setOverlayMessage] = useState(
    `Jitayarishe kuongeza kasi ya kuandika na ujuzi wako wa kompyuta! Andika maneno ya teknolojia unapoona,
    kusaidia gari lako la safari kusonga mbele. Kila neno sahihi huongeza alama zako na kukusogeza mbele.
    Haraka haraka, na usikose herufi!
    <br/><br/>
    (Get ready to boost your typing speed and computer skills! Type the tech words you see,
    to help your safari vehicle move forward. Every correct word boosts your score and moves you ahead.
    Faster faster, and don't miss a letter!)`
  );
  const [startButtonText, setStartButtonText] = useState("ANZA MCHEZO! (Start Game!)");

  // Refs for DOM elements
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);
  const gameWrapperRef = useRef(null);

  // Game Animation/Interval IDs
  const gameIntervalRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Canvas Drawing Variables
  const vehicleRef = useRef({ x: 50, y: 0, width: 80, height: 50, speed: 0.5 });
  const groundLevelRef = useRef(0);

  // Words and Phrases
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
  ]);

  const swahiliPhrases = useRef({
    start: "ANZA!",
    goodJob: ["Kazi Nzuri!", "Heko!", "Vizuri Sana!", "Endelea!"],
    faster: ["Haraka haraka!", "Ongeza Kasi!", "Usisahau herufi!"],
    gameOver: "MCHEZO UMEKWISHA!",
    playAgain: "Cheza Tena?",
    wrongLetter: "Sio Hiyo!",
    correctWord: "Sahihi!"
  });

  // Audio Context for sound effects
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

  const getRandomWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * words.current.length);
    const newWord = words.current[randomIndex];
    setCurrentWord(newWord);
    setTypedInput('');
    textInputRef.current?.focus();
  }, []);

  const showTemporaryMessage = useCallback((message, color) => {
    const gameWrapper = gameWrapperRef.current;
    if (!gameWrapper) return;

    const tempMessageDiv = document.createElement('div');
    tempMessageDiv.textContent = message;
    tempMessageDiv.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-6xl font-extrabold text-shadow-lg opacity-100 transition-all duration-700 ease-out z-30';
    tempMessageDiv.style.color = color;
    tempMessageDiv.style.fontFamily = "'Press Start 2P', cursive";
    tempMessageDiv.style.textShadow = '3px 3px #000';
    gameWrapper.appendChild(tempMessageDiv);

    // Trigger transition
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

  const endGame = useCallback(() => {
    setGameActive(false);
    clearInterval(gameIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current); // Stop canvas animation
    textInputRef.current.disabled = true;

    setOverlayTitle(swahiliPhrases.current.gameOver);
    setOverlayMessage(
      `Alama zako ni: <span style="color:#ffd700; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!<br/><br/>
      (Your Score: <span style="color:#ffd700; font-size:1.5em; font-family: 'Press Start 2P', cursive;">${score}</span>!)`
    );
    setStartButtonText(swahiliPhrases.current.playAgain);
    setOverlayActive(true);
  }, [score]);

  const startGame = useCallback(() => {
    initAudio(); // Initialize audio context on user interaction
    setScore(0);
    setTimeLeft(60);
    vehicleRef.current.x = 50; // Reset vehicle position
    setGameActive(true);
    setOverlayActive(false);
    if (textInputRef.current) {
      textInputRef.current.disabled = false;
      textInputRef.current.focus();
    }
    getRandomWord();

    // Clear any existing intervals before setting a new one
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }
    gameIntervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    gameLoop(); // Start drawing loop
  }, [getRandomWord, endGame, initAudio]);

  const handleInput = useCallback((event) => {
    if (!gameActive) return;

    const typedValue = event.target.value;
    setTypedInput(typedValue);

    const lowerCaseTyped = typedValue.toLowerCase();
    const lowerCaseCurrent = currentWord.toLowerCase();

    if (lowerCaseTyped === lowerCaseCurrent) {
      setScore(prevScore => prevScore + currentWord.length);
      vehicleRef.current.x += 20; // Move vehicle forward
      const canvas = canvasRef.current;
      if (canvas && vehicleRef.current.x > canvas.width - vehicleRef.current.width) {
        vehicleRef.current.x = canvas.width - vehicleRef.current.width - 50; // Keep in bounds
      }
      playCorrectSound();
      showTemporaryMessage(swahiliPhrases.current.correctWord, 'green');
      getRandomWord(); // Get next word
    }
  }, [gameActive, currentWord, getRandomWord, playCorrectSound, showTemporaryMessage]);

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
    return <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
  }, [currentWord, typedInput]);


  // Canvas drawing logic
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky
    ctx.fillStyle = '#87ceeb'; /* Sky blue */
    ctx.fillRect(0, 0, canvas.width, groundLevelRef.current);

    // Draw ground (dirt)
    ctx.fillStyle = '#a0522d'; /* Sienna */
    ctx.fillRect(0, groundLevelRef.current, canvas.width, canvas.height - groundLevelRef.current);

    // Draw grass on the ground
    ctx.fillStyle = '#367c39'; /* Darker green for grass */
    ctx.fillRect(0, groundLevelRef.current, canvas.width, 10);

    // Draw simple sun
    ctx.fillStyle = '#ffd700'; /* Gold */
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
    ctx.fillStyle = '#b03a2e'; /* Reddish-brown */
    ctx.fillRect(vehicleRef.current.x, groundLevelRef.current - vehicleRef.current.height, vehicleRef.current.width, vehicleRef.current.height);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(vehicleRef.current.x + 20, groundLevelRef.current - 10, 10, 0, Math.PI * 2);
    ctx.arc(vehicleRef.current.x + vehicleRef.current.width - 20, groundLevelRef.current - 10, 10, 0, Math.PI * 2);
    ctx.fill();

    if (gameActive) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameActive]);

  // Responsive Canvas resizing effect
  const resizeCanvas = useCallback(() => {
    const gameWrapper = gameWrapperRef.current;
    const canvas = canvasRef.current;
    if (gameWrapper && canvas) {
      const headerHeight = gameWrapper.querySelector('.game-header')?.offsetHeight || 0;
      const infoHeight = gameWrapper.querySelector('.game-info')?.offsetHeight || 0;
      const typingAreaHeight = gameWrapper.querySelector('.typing-area')?.offsetHeight || 0;

      canvas.width = gameWrapper.clientWidth;
      canvas.height = gameWrapper.clientHeight - headerHeight - infoHeight - typingAreaHeight;
      groundLevelRef.current = canvas.height * 0.8; // 80% of canvas height for ground
      vehicleRef.current.y = groundLevelRef.current - vehicleRef.current.height; // Adjust vehicle y position
      gameLoop(); // Redraw after resize
    }
  }, [gameLoop]);

  useEffect(() => {
    resizeCanvas(); // Set initial canvas size
    window.addEventListener('resize', resizeCanvas); // Resize on window change

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(gameIntervalRef.current);
      cancelAnimationFrame(animationFrameIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [resizeCanvas]); // Dependency array ensures cleanup runs when component unmounts

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        JAKOM Kids Hub
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Ignite curiosity and foster a love for technology and creativity in the next generation! Our Kids Hub offers engaging and interactive programs designed to introduce children to the exciting world of coding, design, and problem-solving through fun activities.
      </p>

      {/* --- Cyber Safari Game Integration --- */}
      <div
        className="game-wrapper relative bg-[rgba(255,255,255,0.1)] rounded-2xl shadow-xl max-w-[900px] w-[95vw] h-[95vh] max-h-[600px] flex flex-col overflow-hidden"
        ref={gameWrapperRef}
      >
        <div className="game-header bg-[#3b82f6] p-4 md:p-3 rounded-t-2xl text-center font-['Press_Start_2P'] text-2xl md:text-xl text-white shadow-md relative z-10">
          CYBER SAFARI: KASI YA KOMPYUTA
        </div>
        <div className="game-info flex justify-around p-3 bg-[#1a4d0f] text-lg md:text-base font-semibold border-b-2 border-[#2a7e19] z-10">
          <div>Alama (Score): <span id="score">{score}</span></div>
          <div>Muda (Time): <span id="timer">{timeLeft}s</span></div>
        </div>
        <canvas id="gameCanvas" ref={canvasRef} className="flex-grow bg-[#87ceeb] block w-full touch-none select-none tap-highlight-transparent"></canvas>
        <div className="typing-area bg-[#3b82f6] p-4 md:p-3 rounded-b-2xl flex flex-col items-center justify-center gap-2 z-10">
          <div id="wordDisplay" className="font-['Press_Start_2P'] text-3xl md:text-2xl text-white text-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis">
            {currentWord ? highlightIncorrectLetters() : "READY!"}
          </div>
          <input
            type="text"
            id="textInput"
            ref={textInputRef}
            value={typedInput}
            onChange={handleInput}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-[80%] max-w-[400px] p-3 md:p-2 border-2 border-white rounded-xl text-lg md:text-base text-center outline-none bg-[#e0f2f7] text-[#333] transition-all duration-200 ease-in-out focus:border-[#ffd700] focus:shadow-md focus:shadow-yellow-400"
            disabled={!gameActive} // Disable input when game is not active
          />
        </div>

        {/* Start/Game Over Overlay */}
        <div
          id="gameOverlay"
          className={`overlay absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center text-center z-50 transition-opacity duration-500 ease ${overlayActive ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <div className="overlay-content p-4">
            <h2 id="overlayTitle" className="font-['Press_Start_2P'] text-4xl md:text-3xl text-[#ffd700] mb-5 text-shadow-xl">
              {overlayTitle}
            </h2>
            <p id="overlayMessage" className="text-xl md:text-lg mb-4 text-white max-w-4xl mx-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: overlayMessage }}></p>
            <button
              id="startButton"
              onClick={startGame}
              className="bg-[#4CAF50] text-white p-4 md:p-3 border-none rounded-xl text-2xl md:text-xl font-bold cursor-pointer transition-all duration-300 ease-in-out shadow-lg shadow-green-700 hover:bg-[#45a049] hover:translate-y-[-2px] hover:shadow-xl active:translate-y-[3px] active:shadow-sm font-['Press_Start_2P']"
            >
              {startButtonText}
            </button>
          </div>
        </div>
      </div>
      {/* --- End Cyber Safari Game Integration --- */}

      {/* Existing Kids Hub content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mt-12">
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
      </div>
      <Link to="/" className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        Back to Home
      </Link>
    </div>
  );
};

export default KidsHub;
