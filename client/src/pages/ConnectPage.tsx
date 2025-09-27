import { useAccount, useChainId, useSwitchChain, useConnect, useSignMessage } from 'wagmi'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { useAuthStore } from '../stores/authStore'

const ConnectPage = () => {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()
  const navigate = useNavigate()
  const { setAuthentication, isAuthenticated, isOnCorrectNetwork } = useAuthStore()

  const [isConnecting, setIsConnecting] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [authStep, setAuthStep] = useState<'connect' | 'sign' | 'username' | 'complete'>('connect')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // Check if already authenticated on page load
  useEffect(() => {
    if (isAuthenticated && isConnected && isOnCorrectNetwork) {
      // Already authenticated, redirect to game
      navigate('/game')
    }
  }, [isAuthenticated, isConnected, isOnCorrectNetwork, navigate])

  // Create authentication message
  const message = `Welcome to BLOXLAND!\n\nPlease sign this message to authenticate and start your adventure.\n\nTimestamp: ${Date.now()}\nAddress: ${address}\nChain: Sepolia Testnet`

  const { signMessage, data: signature, isPending: isSignPending, error: signError } = useSignMessage()

  // Auto-switch to Sepolia if connected but on wrong network
  useEffect(() => {
    if (isConnected && chainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id })
    }
  }, [isConnected, chainId, switchChain])

  // Update auth step based on connection status
  useEffect(() => {
    if (isConnected && chainId === sepolia.id && authStep === 'connect') {
      setAuthStep('sign')
    } else if (!isConnected && authStep !== 'connect') {
      setAuthStep('connect')
    }
  }, [isConnected, chainId, authStep])

  // Handle successful signing -> move to username step
  useEffect(() => {
    if (signature && address && chainId === sepolia.id && authStep === 'sign') {
      setAuthStep('username')
    }
  }, [signature, address, chainId, authStep])

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

  const handleSign = async () => {
    if (!address) return

    setIsAuthenticating(true)
    try {
      signMessage({ message })
    } catch (error) {
      console.error('Signing failed:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Username validation
  const validateUsername = (username: string) => {
    if (!username) return 'Username is required'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, hyphens, and underscores'
    if (username.startsWith('-') || username.endsWith('-')) return 'Username cannot start or end with a hyphen'
    return null
  }

  // Mock function to check username availability (you'll replace this with actual API call)
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock some taken usernames for demo
    const takenUsernames = ['admin', 'test', 'user', 'player1', 'gamer']
    return !takenUsernames.includes(username.toLowerCase())
  }

  const handleUsernameSubmit = async () => {
    const validationError = validateUsername(username)
    if (validationError) {
      setUsernameError(validationError)
      return
    }

    setIsCheckingUsername(true)
    setUsernameError('')

    try {
      const isAvailable = await checkUsernameAvailability(username)

      if (!isAvailable) {
        setUsernameError('Username is already taken. Please try another.')
        return
      }

      // Username is valid and available
      setAuthStep('complete')

      // Store authentication in Zustand store
      setAuthentication({
        address: address!,
        signature: signature!,
        username,
        ensName: `${username}.bloxland.eth`
      })

      setShowOverlay(true)
      setTimeout(() => {
        navigate('/game')
      }, 3000)

    } catch (error) {
      console.error('Username check failed:', error)
      setUsernameError('Error checking username availability. Please try again.')
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Format address to show first 5 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return '0x343...2342'
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`
  }

  const getTitle = () => {
    switch (authStep) {
      case 'connect':
        return 'Connect Your Wallet'
      case 'sign':
        return 'Sign to Authenticate'
      case 'username':
        return 'Choose Your Username'
      case 'complete':
        return 'Welcome to Bloxland!'
      default:
        return 'Connect Your Wallet'
    }
  }

  const getDescription = () => {
    switch (authStep) {
      case 'connect':
        return 'Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.'
      case 'sign':
        return 'Please sign the message to complete authentication and access the game securely.'
      case 'username':
        return 'Choose a unique username for your Bloxland ENS domain. This will be your identity in the game.'
      case 'complete':
        return `Your ENS domain ${username}.bloxland.eth is ready! Redirecting to your adventure...`
      default:
        return 'Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.'
    }
  }

  const getButtonText = () => {
    if (isConnecting) return 'Connecting...'
    if (isAuthenticating || isSignPending) return 'Signing...'
    if (isCheckingUsername) return 'Checking availability...'

    switch (authStep) {
      case 'connect':
        return 'Connect Wallet'
      case 'sign':
        return 'Sign Message'
      case 'username':
        return 'Claim Username'
      case 'complete':
        return 'Welcome to Bloxland! ✓'
      default:
        return 'Connect Wallet'
    }
  }

  const handleButtonClick = () => {
    switch (authStep) {
      case 'connect':
        handleConnect()
        break
      case 'sign':
        handleSign()
        break
      case 'username':
        handleUsernameSubmit()
        break
      default:
        break
    }
  }

  const isButtonDisabled = () => {
    if (authStep === 'username') {
      return !username.trim() || isCheckingUsername
    }
    return isConnecting || isAuthenticating || isSignPending || authStep === 'complete'
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
            {getTitle()}
          </h1>
          <p className="text-base sm:text-lg text-white leading-relaxed">
            {getDescription()}
          </p>
        </div>

        {/* Connection Status Info */}
        {isConnected && authStep !== 'complete' && authStep !== 'username' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-md mx-auto">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Network:</span>
                <span className={chainId === sepolia.id ? 'text-green-400' : 'text-yellow-400'}>
                  {chainId === sepolia.id ? 'Sepolia Testnet ✓' : 'Wrong Network ⚠️'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Address:</span>
                <span className="text-blue-400 font-mono">{formatAddress(address || '')}</span>
              </div>
              {authStep === 'sign' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-orange-400">Ready to sign</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Username Input Section */}
        {authStep === 'username' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="text-left">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase())
                      setUsernameError('')
                    }}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">
                    .bloxland.eth
                  </div>
                </div>
              </div>

              {/* Username Preview */}
              {username && !usernameError && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-300 text-sm">
                    📍 Your ENS: <span className="font-mono">{username}.bloxland.eth</span>
                  </p>
                </div>
              )}

              {/* Character count */}
              <div className="text-right text-xs text-gray-400">
                {username.length}/20 characters
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(signError || usernameError) && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-red-300 text-sm">
              ❌ {signError ? 'Signing failed. Please try again.' : usernameError}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mt-8">
          {authStep !== 'complete' ? (
            <button
              onClick={handleButtonClick}
              disabled={isButtonDisabled()}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {getButtonText()}
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">Preparing your adventure...</p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {['connect', 'sign', 'username', 'complete'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${step === authStep
                ? 'bg-blue-400 scale-125'
                : ['connect', 'sign', 'username', 'complete'].indexOf(authStep) > index
                  ? 'bg-green-400'
                  : 'bg-gray-600'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Success Overlay */}
      {showOverlay && authStep === 'complete' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/70 text-white p-6 rounded-lg backdrop-blur-sm border border-white/20 max-w-md mx-4">
            <div className="text-center space-y-4">
              <div className="text-4xl text-green-400 mb-4 animate-bounce">🎉</div>
              <h3 className="text-xl font-semibold">Welcome to Bloxland!</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Your Address:</p>
                <p className="text-lg font-mono bg-white/10 px-3 py-2 rounded border">
                  {formatAddress(address || '')}
                </p>
                <p className="text-sm text-gray-300">Your ENS Domain:</p>
                <p className="text-lg font-mono bg-green-500/20 px-3 py-2 rounded border border-green-500/50 text-green-300">
                  {username}.bloxland.eth
                </p>
                <p className="text-sm text-gray-300">Network:</p>
                <p className="text-sm text-green-400">Sepolia Testnet ✓</p>
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
