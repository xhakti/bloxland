import "../App.css";
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sepolia } from '@reown/appkit/networks'

const ConnectPage = () => {
  const { open } = useAppKit()
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)

  // Auto-switch to Sepolia if connected but on wrong network
  useEffect(() => {
    if (isConnected && chainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id })
    }
  }, [isConnected, chainId, switchChain])

  // Redirect to game if wallet is connected and on correct network
  useEffect(() => {
    if (isConnected && chainId === sepolia.id) {
      setTimeout(() => {
        navigate('/game')
      }, 2000) // Give user time to see connection success
    }
  }, [isConnected, chainId, navigate])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await open()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
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
          {isConnected && address && (
            <p className="text-sm text-gray-300 break-all">
              Address: {address}
            </p>
          )}
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
    </div>
  );
};

export default ConnectPage;
