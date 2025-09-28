import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import RotatingGlobe from "./RotatingGlobe";

const Hero = () => {
  const {
    isAuthenticated,
    isConnected,
    isOnCorrectNetwork,
    username,
    address,
  } = useAuthStore();

  // Determine what button to show and where to navigate
  const getButtonConfig = () => {
    if (isAuthenticated && isConnected && isOnCorrectNetwork) {
      return {
        text: "Continue Playing",
        link: "/game",
        subtitle: `Welcome back, ${username || address?.slice(0, 6)}!`,
      };
    } else if (isConnected && !isOnCorrectNetwork) {
      return {
        text: "Switch to Sepolia",
        link: "/connect",
        subtitle: "Switch to Sepolia testnet to continue",
      };
    } else if (isConnected && !isAuthenticated) {
      return {
        text: "Complete Setup",
        link: "/connect",
        subtitle: "Complete authentication to start playing",
      };
    } else {
      return {
        text: "Enter (connect wallet)",
        link: "/connect",
        subtitle: "Connect your wallet to start your Web3 adventure",
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="min-h-[100dvh] w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center">
          <img
            src="./logo.png"
            alt="logo"
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <p className="text-xl sm:text-2xl font-bold ml-2">BLOXLAND</p>
        </div>

        {/* Auth Status Indicator */}
        {isConnected && (
          <div className="hidden sm:flex items-center space-x-2 text-xs overflow-hidden">
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
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="h-[calc(100dvh-72px)] relative z-10">
        {/* Mobile Layout (Stacked) */}
        <div className="lg:hidden flex flex-col h-full">
          {/* Content Section - Mobile */}
          <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 px-6 sm:px-8">
            <div className="space-y-3 sm:space-y-4 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-parkinsans">
                Walk.
                <br />
                Discover.
                <br />
                Earn.
              </h1>
              <p className="text-base sm:text-lg text-white leading-relaxed max-w-md mx-auto px-2 font-lexend">
                The revolutionary Web3 game where your real-world steps unlock
                digital treasures at every checkpoint. Explore your city,
                complete challenges, and earn crypto rewards while building your
                unique avatar collection.
              </p>
            </div>

            {/* Button with Status - Mobile */}
            <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 px-4 sm:px-0 space-y-2 w-full">
              <Link
                to={buttonConfig.link}
                className="w-full max-w-sm px-6 sm:px-8 py-3 border-2 border-white text-black text-center font-semibold rounded-lg bg-white  hover:text-black transition-all duration-300 transform hover:scale-105 active:scale-95 font-lexend"
              >
                {buttonConfig.text}
              </Link>
              {buttonConfig.subtitle && (
                <p className="text-xs sm:text-sm text-neutral-400 text-center">
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
              <h1 className="text-4xl xl:text-6xl font-bold text-white leading-tight font-parkinsans">
                Walk.
                <br />
                Discover.
                <br />
                Earn.
              </h1>
              <p className="text-lg xl:text-xl text-white leading-relaxed pr-4 font-lexend">
                The revolutionary Web3 game where your real-world steps unlock
                digital treasures at every checkpoint. Explore your city,
                complete challenges, and earn crypto rewards while building your
                unique avatar collection.
              </p>
            </div>

            {/* Button with Status - Desktop */}
            <div className="flex flex-col items-start mt-8 space-y-2 w-full">
              <Link
                to={buttonConfig.link}
                className="w-full px-8 py-3 font-semibold rounded-lg bg-white text-black transition-all duration-300 transform hover:scale-105 font-lexend text-center"
              >
                {buttonConfig.text}
              </Link>
              {buttonConfig.subtitle && (
                <p className="text-sm text-neutral-400 mt-2">
                  {buttonConfig.subtitle}
                </p>
              )}
            </div>

            {/* Player Stats Preview (if authenticated) */}
            {isAuthenticated && isOnCorrectNetwork && (
              <div className="mt-6 p-4 grid-bg border border-white/10 rounded-lg max-w-sm backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Player Status
                </h3>
                <div className="space-y-1 text-xs">
                  {username && (
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Username:</span>
                      <span className="text-blue-400">{username}</span>
                    </div>
                  )}
                  {address && (
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Wallet:</span>
                      <span className="text-green-400">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Network:</span>
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
  );
};

export default Hero;
