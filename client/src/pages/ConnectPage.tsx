import "../App.css";
import { useAccount, useChainId, useSwitchChain, useConnect } from 'wagmi'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const ConnectPage = () => {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Auto-switch to Sepolia if connected but on wrong network
  useEffect(() => {
    if (isConnected && chainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id })
    }
  }, [isConnected, chainId, switchChain])

  // Show overlay and redirect to game if wallet is connected and on correct network
  useEffect(() => {
    if (isConnected && chainId === sepolia.id) {
      setShowOverlay(true)
      setTimeout(() => {
        navigate('/game')
      }, 3000) // Give user time to see connection success and overlay
    }
  }, [isConnected, chainId, navigate])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect({ connector: injected() })
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Format address to show first 5 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return '0x343...2342'
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`
  }
  return (
    <div
      className="min-h-[100dvh] w-full text-white overflow-x-hidden flex items-center justify-center"
      style={{
        backgroundColor: "#000000",
        opacity: 1,
        backgroundImage:
          "radial-gradient(#3a3838 0.5px, transparent 0.5px), radial-gradient(#3a3838 0.5px, #000000 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      }}
    >
      <div className="text-center space-y-8 px-6 sm:px-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="./logo.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16" />
          <p className="text-2xl sm:text-3xl font-bold ml-3">BLOXLAND</p>
        </div>
        
        {/* Title and Description */}
        <div className="space-y-4 max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {isConnected ? 'Wallet Connected!' : 'Connect Your Wallet'}
          </h1>
          <p className="text-base sm:text-lg text-white leading-relaxed">
            {isConnected 
              ? `Connected to Sepolia testnet. Redirecting to game...` 
              : 'Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.'
            }
          </p>
        </div>
        
        {/* Connect Wallet Button */}
        <div className="flex justify-center mt-8">
          {!isConnected ? (
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">Preparing your adventure...</p>
            </div>
          )}
        </div>
      </div>

      {/* Address Overlay */}
      {showOverlay && isConnected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/70 text-white p-6 rounded-lg backdrop-blur-sm border border-white/20 max-w-md mx-4">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Wallet Connected!</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Your Address:</p>
                <p className="text-lg font-mono bg-white/10 px-3 py-2 rounded border">
                  {formatAddress(address || '')}
                </p>
              </div>
              <p className="text-sm text-gray-400">
                Redirecting to game in a moment...
              </p>
              <button 
                onClick={() => setShowOverlay(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectPage;
