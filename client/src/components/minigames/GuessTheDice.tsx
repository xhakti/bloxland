import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const GuessTheDice = () => {
  const [diceNumber, setDiceNumber] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startNewGame = () => {
    const randomNumber = Math.floor(Math.random() * 6) + 1;
    setDiceNumber(randomNumber);
    setIsRevealed(false);
    setShowConfetti(false);
    setGameStarted(true);
    setGuess(null);
  };

  const handleGuess = (guessNumber: number) => {
    if (isRevealed) return;
    
    setGuess(guessNumber);
    setIsRevealed(true);
    
    if (guessNumber === diceNumber) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const getDiceSymbol = (number: number) => {
    const symbols = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    return symbols[number] || "";
  };

  const isCorrect = guess === diceNumber;

  return (
    <div className="max-w-2xl mx-auto">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-3xl font-bold text-white mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          🎲 Guess the Dice
        </motion.h2>
        
        {/* Game Area */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Dice Display */}
          <div className="mb-8">
            <motion.div
              className="relative inline-block"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isRevealed ? 360 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <motion.div
                className={`text-8xl transition-all duration-700 ${
                  isRevealed ? "text-white" : "text-white/30"
                }`}
                style={{
                  filter: isRevealed ? "none" : "blur(15px)",
                }}
                animate={{
                  scale: isRevealed ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.6 }}
              >
                {gameStarted ? getDiceSymbol(diceNumber) : "🎲"}
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!gameStarted ? (
              <motion.button
                key="start"
                onClick={startNewGame}
                className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg border-2 border-white"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                🎯 Start Game
              </motion.button>
            ) : !isRevealed ? (
              <motion.div 
                key="guessing"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.p 
                  className="text-gray-300 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  What number is on the dice?
                </motion.p>
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((number, index) => (
                    <motion.button
                      key={number}
                      onClick={() => handleGuess(number)}
                      className="p-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all border-2 border-white text-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {number}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className={`text-3xl font-bold ${
                    isCorrect ? "text-white" : "text-gray-400"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                >
                  {isCorrect ? "🎉 Perfect!" : "❌ Not quite!"}
                </motion.div>
                <motion.p 
                  className="text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  You guessed <span className="text-white font-bold">{guess}</span>, it was <span className="text-white font-bold">{diceNumber}</span>
                </motion.p>
                <motion.button
                  onClick={startNewGame}
                  className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all border-2 border-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GuessTheDice;
