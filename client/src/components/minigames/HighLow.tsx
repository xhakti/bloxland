import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const HighLow = () => {
  const [number, setNumber] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [guess, setGuess] = useState<string | null>(null);
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
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    setNumber(randomNumber);
    setIsRevealed(false);
    setShowConfetti(false);
    setGameStarted(true);
    setGuess(null);
  };

  const handleGuess = (guessType: "high" | "low") => {
    if (isRevealed) return;

    setGuess(guessType);
    setIsRevealed(true);
    
    const isCorrect = 
      (guessType === "high" && number > 50) || 
      (guessType === "low" && number <= 50);
    
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const getNumberCategory = (num: number) => {
    return num > 50 ? "high" : "low";
  };

  const isCorrect = guess === getNumberCategory(number);

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
          📊 High or Low
        </motion.h2>
        
        {/* Game Area */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Number Display */}
          <div className="mb-8">
            <motion.div
              className="relative inline-block"
              animate={{ 
                rotateY: isRevealed ? [0, 180, 360] : 0,
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.div
                className={`text-8xl font-bold transition-all duration-700 ${
                  isRevealed ? "text-white" : "text-white/30"
                }`}
                style={{
                  filter: isRevealed ? "none" : "blur(20px)",
                }}
                animate={{
                  scale: isRevealed ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.8 }}
              >
                {gameStarted ? number : "?"}
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
                🎲 Generate Number
              </motion.button>
            ) : !isRevealed ? (
              <motion.div 
                key="guessing"
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.p 
                  className="text-gray-300 text-lg mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  High (51-100) or Low (1-50)?
                </motion.p>
                <div className="flex gap-6 justify-center">
                  <motion.button
                    onClick={() => handleGuess("low")}
                    className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg border-2 border-white"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    📉 Low
                  </motion.button>
                  <motion.button
                    onClick={() => handleGuess("high")}
                    className="px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg border-2 border-white"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    📈 High
                  </motion.button>
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
                  {isCorrect ? "🎉 Brilliant!" : "❌ Try again!"}
                </motion.div>
                <motion.p 
                  className="text-gray-300 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-white font-bold text-2xl">{number}</span> is {getNumberCategory(number)}
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

export default HighLow;
