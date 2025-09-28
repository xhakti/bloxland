import React from "react";
import { useConnectPageAuth } from "../hooks/useConnectPageAuth";
import { baseSepolia, sepolia } from "wagmi/chains";

const ConnectPage = () => {
  const {
    // State
    authState,
    showOverlay,
    chainId,
    address,
    isConnected,

    // Actions
    handleButtonClick,
    handleUsernameChange,
    formatAddress,

    // Computed values
    getTitle,
    getDescription,
    getButtonText,
    getCurrentError,
    getEnsDisplayName,
    isButtonDisabled,
  } = useConnectPageAuth();

  return (
    <div className="min-h-[100dvh] w-full text-white overflow-x-hidden relative" style={{ backgroundColor: "#000000" }}>
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
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center">
        <div className="text-center space-y-8 px-6 sm:px-8 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="./logo.png"
              alt="logo"
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
            <p className="text-2xl sm:text-3xl font-bold ml-3 font-parkinsans">BLOXLAND</p>
          </div>

          {/* Title and Description */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight font-parkinsans">
              {getTitle()}
            </h1>

            {/* Why Connect Explanation */}
            <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-neutral-300 font-lexend leading-relaxed">
                <span className="text-blue-400 font-semibold">Why connect?</span> We need to verify your wallet to create your unique Bloxland identity and ensure secure gameplay. Your signature proves you own the wallet without sharing private keys.
              </p>
            </div>
          </div>

          {/* Connection Status Info (hidden during location, username & complete steps) */}
          {isConnected &&
            authState.step !== "complete" &&
            authState.step !== "location" &&
            authState.step !== "username" && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 font-lexend">Network:</span>
                    <span
                      className={
                        chainId === baseSepolia.id || chainId === sepolia.id
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {chainId === baseSepolia.id || chainId === sepolia.id
                        ? " Sepolia Testnet ✓"
                        : "Wrong Network ⚠️"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 font-lexend">Address:</span>
                    <span className="text-blue-400 font-mono">
                      {formatAddress(address || "")}
                    </span>
                  </div>
                  {authState.step === "sign" && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 font-lexend">Status:</span>
                      <span className="text-orange-400">Ready to sign</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Location Permission Step - now before username */}
          {authState.step === "location" && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
              <div className="space-y-5 text-left">
                <h3 className="text-lg font-semibold text-white font-lexend">Enable Location</h3>
                <p className="text-sm text-neutral-300 font-lexend leading-relaxed">
                  We use your approximate location to place you in the world, show nearby checkpoints, quests and reward zones. Precise coordinates are not permanently stored.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400 font-lexend">
                  <li>Improves map centering & avatar spawn</li>
                  <li>Unlocks location-based quests & rewards</li>
                  <li>You can skip and enable later in settings</li>
                </ul>
                {authState.locationStatus === 'granted' && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm font-lexend">✅ Location active</div>
                )}
                {authState.locationStatus === 'denied' && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-300 text-sm font-lexend">⚠️ Permission denied or blocked. You can proceed without it.</div>
                )}
                {authState.locationStatus === 'requesting' && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-blue-300 text-sm font-lexend animate-pulse">Requesting permission...</div>
                )}
              </div>
            </div>
          )}

          {/* Username Input Section (moved after location) */}
          {authState.step === "username" && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="text-left">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-neutral-300 mb-2 font-lexend"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={authState.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-lexend"
                      maxLength={20}
                    />
                    <div className="absolute right-3 top-3 text-neutral-400 text-sm font-lexend">
                      .bloxland.eth
                    </div>
                  </div>
                </div>

                {/* Username Preview */}
                {authState.username && !authState.error && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <p className="text-green-300 text-sm font-lexend">
                      📍 Your ENS:{" "}
                      <span className="font-mono">
                        {authState.username}.bloxland.eth
                      </span>
                    </p>
                  </div>
                )}

                {/* Character count */}
                <div className="text-right text-xs text-neutral-400 font-lexend">
                  {authState.username.length}/20 characters
                </div>
              </div>
            </div>
          )}


          {/* Error Messages */}
          {getCurrentError() && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-300 text-sm font-lexend">❌ {getCurrentError()}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            {authState.step === "complete" ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-neutral-300 font-lexend">
                  Preparing your adventure...
                </p>
              </div>
            ) : authState.step === "verify" ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-neutral-300 font-lexend">Verifying your account...</p>
              </div>
            ) : (
              <button
                onClick={handleButtonClick}
                disabled={isButtonDisabled()}
                className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-lexend text-lg"
              >
                {getButtonText()}
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {["connect", "sign", "verify", "location", "username", "complete"].map(
              (step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${step === authState.step
                    ? "bg-blue-400 scale-125"
                    : [
                      "connect", "sign", "verify", "location", "username", "complete",
                    ].indexOf(authState.step) > index
                      ? "bg-green-400"
                      : "bg-neutral-600"
                    }`}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {showOverlay && authState.step === "complete" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/70 text-white p-6 rounded-lg backdrop-blur-sm border border-white/20 max-w-md mx-4">
            <div className="text-center space-y-4">
              <div className="text-4xl text-green-400 mb-4 animate-bounce">
                🎉
              </div>
              <h3 className="text-xl font-semibold font-parkinsans">Welcome to Bloxland!</h3>
              <div className="space-y-2">
                <p className="text-sm text-neutral-300 font-lexend">Your Address:</p>
                <p className="text-lg font-mono bg-white/10 px-3 py-2 rounded border">
                  {formatAddress(address || "")}
                </p>
                <p className="text-sm text-neutral-300 font-lexend">Your ENS Domain:</p>
                <p className="text-lg font-mono bg-green-500/20 px-3 py-2 rounded border border-green-500/50 text-green-300">
                  {getEnsDisplayName() || "pending"}
                </p>
                <p className="text-sm text-neutral-300 font-lexend">Network:</p>
                <p className="text-sm text-green-400 font-lexend">Base Sepolia Testnet ✓</p>
              </div>
              <p className="text-sm text-neutral-400 font-lexend">
                Redirecting to game in a moment...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectPage;