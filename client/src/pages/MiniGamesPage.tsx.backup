import "../App.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import GuessTheDice from "../components/minigames/GuessTheDice";
import HighLow from "../components/minigames/HighLow";
import EvenOdd from "../components/minigames/EvenOdd";

const MiniGamesPage = () => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, username } =
    useAuthStore();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "dice",
      title: "Guess the Dice",
      description: "Predict the dice number",
      icon: "🎲",
      component: GuessTheDice,
      gradient: "from-white to-gray-200",
      hoverGradient: "from-gray-100 to-white",
    },
    {
      id: "highlow",
      title: "High or Low",
      description: "Above or below 50?",
      icon: "📊",
      component: HighLow,
      gradient: "from-gray-800 to-black",
      hoverGradient: "from-gray-700 to-gray-900",
    },
    {
      id: "evenodd",
      title: "Even or Odd",
      description: "Mathematical intuition",
      icon: "🔢",
      component: EvenOdd,
      gradient: "from-white to-gray-200",
      hoverGradient: "from-gray-100 to-white",
    },
  ];

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const SelectedGameComponent = selectedGame
    ? games.find((game) => game.id === selectedGame)?.component
    : null;

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        // Use a cubic bezier easing array accepted by framer-motion (same feel as easeOut)
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    },
  };

  return (
    <div className="w-full text-white overflow-x-hidden relative" style={{ backgroundColor: "#000000" }}>
      {/* Background Image with low opacity */}
      <div
        className="absolute inset-0 w-full h-full grayscale-75"
        style={{
          backgroundImage: "url('./bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.05,
        }}
      ></div>
      
      {/* Main Content */}
      <div className="min-h-[100dvh] w-full relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <motion.img
                src="./logo.png"
                alt="logo"
                className="w-8 h-8 sm:w-10 sm:h-10"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.p
                className="text-xl sm:text-2xl font-bold ml-2 group-hover:text-yellow-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                BLOXLAND
              </motion.p>
            </Link>
          </div>

          {/* Auth Status Indicator */}
          {isConnected && (
            <motion.div
              className="hidden sm:flex items-center space-x-2 text-xs overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isAuthenticated && isOnCorrectNetwork ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Authenticated</span>
                  {username && (
                    <span className="text-neutral-400">({username})</span>
                  )}
                </div>
              ) : isConnected && !isOnCorrectNetwork ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400">Wrong Network</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400">Setup Incomplete</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="h-[calc(100dvh-96px)] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              {!selectedGame ? (
                <motion.div
                  key="menu"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Page Title */}
                  <motion.div
                    className="text-center mb-12"
                    variants={itemVariants}
                  >
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.8,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      Mini Games
                    </motion.h1>
                    <motion.p
                      className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                      variants={itemVariants}
                    >
                      Test your intuition and luck ✨
                    </motion.p>
                  </motion.div>

                  {/* Games Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12"
                    variants={containerVariants}
                  >
                    {games.map((game, index) => (
                      <motion.div
                        key={game.id}
                        variants={itemVariants}
                        className={`bg-gradient-to-br ${game.gradient} p-[2px] rounded-2xl cursor-pointer group`}
                        onClick={() => handleGameSelect(game.id)}
                        whileHover={{
                          scale: 1.05,
                          y: -10,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      >
                        <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-8 h-full group-hover:bg-black/70 transition-all duration-300 grid-bg border border-white/10">
                          <div className="text-center">
                            <motion.div
                              className="text-6xl mb-6"
                              whileHover={{
                                scale: 1.2,
                                rotate: [0, -10, 10, -10, 0],
                                transition: { duration: 0.5 },
                              }}
                            >
                              {game.icon}
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                              {game.title}
                            </h3>
                            <p className="text-gray-300 text-base mb-6 group-hover:text-gray-200 transition-colors">
                              {game.description}
                            </p>
                            <motion.div
                              className={`px-6 py-3 ${game.id === 'highlow' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800 border-2 border-white'} font-semibold rounded-xl transition-all inline-block`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Play Now
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {/* Back Button */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      onClick={handleBackToMenu}
                      className="flex items-center space-x-3 text-white hover:text-yellow-400 transition-colors group"
                      whileHover={{ x: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.svg
                        className="w-6 h-6 group-hover:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ x: -3 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </motion.svg>
                      <span className="text-lg font-medium">Back to Games</span>
                    </motion.button>
                  </motion.div>

                  {/* Selected Game Component */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {SelectedGameComponent && <SelectedGameComponent />}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGamesPage;

