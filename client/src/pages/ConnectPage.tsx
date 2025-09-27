import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }) as T;
}

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Request queue class to prevent spam
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequest = 0;
  private minInterval = 2000; // 2 seconds between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          if (now - this.lastRequest < this.minInterval) {
            await new Promise(resolveDelay =>
              setTimeout(resolveDelay, this.minInterval - (now - this.lastRequest))
            );
          }

          const result = await request();
          this.lastRequest = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      await request();
    }
    this.processing = false;
  }
}

const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  // Use the correct auth store properties based on your actual store
  const {
    isAuthenticated,
    address: storedAddress,
    username,
    ensName: storedEnsName,
    setAuthentication,
    logout,
    setLoading,
  } = useAuthStore();

  // Local state to manage UI steps and errors (since they don't exist in your auth store)
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'connecting' | 'verifying' | 'registering' | 'redirecting'>('connecting');

  const requestQueue = useRef(new RequestQueue());
  const connectionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Connection handler
  const connectWallet = useCallback(async () => {
    if (isConnecting || connectionAttempts >= 3) return;

    setIsConnecting(true);
    setConnectionAttempts(prev => prev + 1);
    setError('');

    try {
      await requestQueue.current.add(async () => {
        if (isMobile() && (window as any).ethereum?.isMetaMask) {
          // Direct MetaMask connection for mobile
          await (window as any).ethereum.request({
            method: 'eth_requestAccounts'
          });
        } else {
          await open();
        }
      });
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, connectionAttempts, open]);

  // Handle mobile deep-link connection
  const handleMobileConnection = useCallback(async () => {
    if (!isMobile()) {
      connectWallet();
      return;
    }

    try {
      setIsConnecting(true);

      // Check if MetaMask is available
      if ((window as any).ethereum?.isMetaMask) {
        await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
      } else {
        // Fallback to WalletConnect for mobile
        const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        window.open(metamaskUrl, '_blank');

        // Set timeout for mobile connection
        connectionTimeoutRef.current = setTimeout(() => {
          setError('Connection timeout. Please try again.');
          setIsConnecting(false);
        }, 30000);
      }
    } catch (error: any) {
      console.error('Mobile connection failed:', error);
      setError(`Mobile connection failed: ${error.message}`);
      setIsConnecting(false);
    }
  }, [connectWallet]);

  // Effect to handle connection state changes
  useEffect(() => {
    if (isConnected && address) {
      clearTimeout(connectionTimeoutRef.current);
      setStep('verifying');

      // Simulate verification process
      setTimeout(() => {
        setStep('registering');

        // Use your actual store's setAuthentication method
        setAuthentication({
          address: address,
          signature: 'mock-signature', // You'll need to implement actual signing
          username: username || address.slice(0, 8),
          ensName: ensName || storedEnsName || `${username || address.slice(0, 8)}.bloxland.eth`,
        });

        setStep('redirecting');
        setIsConnecting(false);
        setConnectionAttempts(0);

        // Auto-redirect after successful connection
        setTimeout(() => {
          navigate('/game');
        }, 2000);
      }, 1500);
    }
  }, [isConnected, address, ensName, username, storedEnsName, setAuthentication, navigate]);

  // Reset connection attempts after 5 minutes
  useEffect(() => {
    if (connectionAttempts > 0) {
      const resetTimer = setTimeout(() => {
        setConnectionAttempts(0);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(resetTimer);
    }
  }, [connectionAttempts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(connectionTimeoutRef.current);
    };
  }, []);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getDescription = () => {
    switch (step) {
      case 'connecting':
        return 'Connect your wallet to enter the game';
      case 'verifying':
        return 'Verifying your wallet connection...';
      case 'registering':
        return 'Setting up your game profile...';
      case 'redirecting':
        return 'Connection successful! Loading game...';
      default:
        return 'Connect your wallet to start your Web3 adventure';
    }
  };

  const getCurrentError = () => {
    if (error) return error;
    if (connectionAttempts >= 3) return 'Too many connection attempts. Please wait and try again.';
    return '';
  };

  const getEnsDisplayName = () => {
    if (ensName) return ensName;
    if (storedEnsName) return storedEnsName;
    if (username) return `${username}.bloxland.eth`;
    return null;
  };

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      logout();
      setError('');
      setConnectionAttempts(0);
      setStep('connecting');
    } catch (error: any) {
      console.error('Disconnect failed:', error);
    }
  }, [disconnect, logout]);

  return (
    <div className="connect-page-bg min-h-[100dvh] w-full text-white overflow-x-hidden flex items-center justify-center">
      <div className="text-center space-y-8 px-6 sm:px-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="./logo.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16" />
          <p className="text-2xl sm:text-3xl font-bold ml-3">BLOXLAND</p>
        </div>

        {/* Title and Description */}
        <div className="space-y-4 max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {getDescription()}
          </h1>
          <p className="text-base sm:text-lg text-white leading-relaxed">
            Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.
          </p>
        </div>

        {/* Connection Status Info */}
        {isConnected && address && step !== 'redirecting' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-md mx-auto">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Network:</span>
                <span className="text-green-400">Sepolia Testnet ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Address:</span>
                <span className="text-blue-400 font-mono">{formatAddress(address || '')}</span>
              </div>
              {step === 'verifying' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-orange-400">Verifying account</span>
                </div>
              )}
            </div>
          </div>
        )}

        {username && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-green-300 text-sm">
              📍 Your ENS: <span className="font-mono">{username}.bloxland.eth</span>
            </p>
          </div>
        )}

        {/* Error Messages */}
        {getCurrentError() && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-red-300 text-sm">❌ {getCurrentError()}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mt-8">
          {step === 'redirecting' ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">Preparing your adventure...</p>
            </div>
          ) : step === 'verifying' ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">Verifying your account...</p>
            </div>
          ) : !isConnected ? (
            <button
              onClick={handleMobileConnection}
              disabled={isConnecting || connectionAttempts >= 3}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connecting...
                </span>
              ) : connectionAttempts >= 3 ? (
                'Too Many Attempts'
              ) : (
                'Connect Wallet'
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Disconnect Wallet
            </button>
          )}
        </div>

        {/* Connection Attempts Counter */}
        {connectionAttempts > 0 && connectionAttempts < 3 && (
          <div className="flex justify-center space-x-2 mt-6">
            {[1, 2, 3].map((attempt) => (
              <div
                key={attempt}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${attempt <= connectionAttempts ? 'bg-red-400' : 'bg-gray-600'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center max-w-md mx-auto">
          <p className="text-gray-400 text-sm">
            Make sure you have MetaMask installed and are on the Sepolia network
          </p>
          {isMobile() && (
            <p className="text-gray-400 text-xs mt-2">
              On mobile? The MetaMask app will open automatically
            </p>
          )}
        </div>
      </div>

      {/* Success Overlay */}
      {step === 'redirecting' && isConnected && (
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
                  {getEnsDisplayName() || 'pending'}
                </p>
                <p className="text-sm text-gray-300">Network:</p>
                <p className="text-sm text-green-400">Sepolia Testnet ✓</p>
              </div>
              <p className="text-sm text-gray-400">
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
