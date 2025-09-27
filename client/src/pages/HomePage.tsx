import "../App.css";
import RotatingGlobe from "../components/ui/RotatingGlobe";
import Gameplay from "../components/ui/Gameplay";
import HowItWorks from "../components/ui/HowItWorks";
import RealRewards from "../components/ui/RealRewards";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const HomePage = () => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, username, address } = useAuthStore();

  // Determine what button to show and where to navigate
  const getButtonConfig = () => {
    if (isAuthenticated && isConnected && isOnCorrectNetwork) {
      return {
        text: "Continue Playing",
        link: "/game",
        subtitle: `Welcome back, ${username || address?.slice(0, 6)}!`
      };
    } else if (isConnected && !isOnCorrectNetwork) {
      return {
        text: "Switch to Sepolia",
        link: "/connect",
        subtitle: "Switch to Sepolia testnet to continue"
      };
    } else if (isConnected && !isAuthenticated) {
      return {
        text: "Complete Setup",
        link: "/connect",
        subtitle: "Complete authentication to start playing"
      };
    } else {
      return {
        text: "Enter Game",
        link: "/connect",
        subtitle: "Connect your wallet to start your Web3 adventure"
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div
      className="min-h-[100dvh] w-full text-white overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        opacity: 1,
        backgroundImage:
          "radial-gradient(#3a3838 0.5px, transparent 0.5px), radial-gradient(#3a3838 0.5px, #000000 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      }}
    >
      <div className="min-h-[100dvh] w-full">
        <div className="w-full min-h-[100dvh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <img src="./logo.png" alt="logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <p className="text-xl sm:text-2xl font-bold ml-2">BLOXLAND</p>
            </div>

            {/* Auth Status Indicator */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 text-xs">
                {isAuthenticated && isOnCorrectNetwork ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Authenticated</span>
                    {username && (
                      <span className="text-gray-400">({username})</span>
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
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="h-[calc(100dvh-72px)]">
            {/* Mobile Layout (Stacked) */}
            <div className="lg:hidden flex flex-col h-full">
              {/* Content Section - Mobile */}
              <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 px-6 sm:px-8">
                <div className="space-y-3 sm:space-y-4 text-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                    Walk. Discover. Collect.
                  </h1>
                  <p className="text-base sm:text-lg text-white leading-relaxed max-w-md mx-auto px-2">
                    The revolutionary Web3 game where your real-world steps unlock digital treasures at every checkpoint.
                  </p>
                  <p className="text-sm sm:text-base text-white max-w-sm mx-auto px-2">
                    Explore your city, complete challenges, and earn crypto rewards while building your unique avatar collection.
                  </p>
                </div>

                {/* Button with Status - Mobile */}
                <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 px-4 sm:px-0 space-y-2">
                  <Link
                    to={buttonConfig.link}
                    className="px-6 sm:px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    {buttonConfig.text}
                  </Link>
                  {buttonConfig.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-400 text-center">
                      {buttonConfig.subtitle}
                    </p>
                  )}
                </div>

                {/* Mobile Auth Status */}
                {isConnected && (
                  <div className="sm:hidden flex justify-center mt-4">
                    {isAuthenticated && isOnCorrectNetwork ? (
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400">Ready to Play</span>
                      </div>
                    ) : isConnected && !isOnCorrectNetwork ? (
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400">Switch Network</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-orange-400">Complete Setup</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="h-64 sm:h-80 w-full">
                <RotatingGlobe />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col justify-center space-y-6 px-8 xl:px-12">
                <div className="space-y-4">
                  <h1 className="text-4xl xl:text-6xl font-bold text-white leading-tight">
                    Walk. Discover. Collect.
                  </h1>
                  <p className="text-lg xl:text-xl text-white leading-relaxed pr-4">
                    The revolutionary Web3 game where your real-world steps unlock digital treasures at every checkpoint.
                  </p>
                  <p className="text-base xl:text-lg text-white pr-4">
                    Explore your city, complete challenges, and earn crypto rewards while building your unique avatar collection.
                  </p>
                </div>

                {/* Button with Status - Desktop */}
                <div className="flex flex-col items-start mt-8 space-y-2">
                  <Link
                    to={buttonConfig.link}
                    className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                  >
                    {buttonConfig.text}
                  </Link>
                  {buttonConfig.subtitle && (
                    <p className="text-sm text-gray-400">
                      {buttonConfig.subtitle}
                    </p>
                  )}
                </div>

                {/* Player Stats Preview (if authenticated) */}
                {isAuthenticated && isOnCorrectNetwork && (
                  <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-sm">
                    <h3 className="text-sm font-semibold text-white mb-2">Player Status</h3>
                    <div className="space-y-1 text-xs">
                      {username && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Username:</span>
                          <span className="text-blue-400">{username}</span>
                        </div>
                      )}
                      {address && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Wallet:</span>
                          <span className="text-green-400 font-mono">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-300">Network:</span>
                        <span className="text-green-400">Sepolia ✓</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-full">
                <RotatingGlobe />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gameplay Section */}
      <Gameplay />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Real Rewards Section */}
      <RealRewards />
    </div>
  );
};

export default HomePage;
