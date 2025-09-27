import {
  useAccount,
  useChainId,
  useSwitchChain,
  useConnect,
  useSignMessage,
} from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { baseSepolia, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useAuthStore } from "../stores/authStore";
import { useUserRegistrationFlow, getErrorMessage } from "../hooks/useApi";
import { apiClient } from "../lib/api";
import type { ApiError, User } from "../lib/api";

type AuthStep = "connect" | "sign" | "verify" | "username" | "complete";

interface AuthState {
  step: AuthStep;
  isLoading: boolean;
  error: string;
  existingUser: User | null;
  username: string;
}

const ConnectPage = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect } = useConnect();
  const navigate = useNavigate();
  const {
    setAuthentication,
    isAuthenticated,
    isOnCorrectNetwork,
    refreshAuth,
    hasSigned,
    setHasSigned,
  } = useAuthStore();

  // Consolidated auth state
  const [authState, setAuthState] = useState<AuthState>({
    step: "connect",
    isLoading: false,
    error: "",
    existingUser: null,
    username: "",
  });

  const [showOverlay, setShowOverlay] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // API registration hook
  const {
    registerUser,
    isLoading: isRegistering,
    error: registrationError,
    reset: resetRegistration,
  } = useUserRegistrationFlow();

  const {
    signMessage,
    data: signature,
    isPending: isSignPending,
    error: signError,
  } = useSignMessage();

  // Debug logging
  const log = useCallback((message: string, data?: any) => {
    console.log(`[ConnectPage] ${message}`, data || "");
  }, []);

  // Check if already authenticated on page load
  useEffect(() => {
    // First, refresh auth state to clear any expired sessions
    refreshAuth();

    // Get the current auth state from store after refresh
    const authStore = useAuthStore.getState();

    log("Checking persisted auth state", {
      isAuthenticated,
      isConnected,
      isOnCorrectNetwork,
      hasSigned,
      hasStoredAuth: authStore.isAuthenticated,
      hasAddress: !!authStore.address,
      hasSignature: !!authStore.signature,
      hasUsername: !!authStore.username,
    });

    // If fully authenticated and connected, redirect to game
    if (isAuthenticated && isConnected && isOnCorrectNetwork) {
      log("Already authenticated and connected, redirecting to game");
      // navigate('/game')
      navigate("/game-integrations");
      return;
    }

    // If we have persisted valid auth, wait for wallet connection
    if (authStore.isAuthenticated && !isConnected) {
      log(
        "Have valid persisted auth but wallet not connected, waiting for connection"
      );
      setAuthState((prev) => ({ ...prev, step: "connect", error: "" }));
      return;
    }

    // If connected but not authenticated, start fresh auth flow
    if (isConnected && !isAuthenticated) {
      log("Wallet connected but not authenticated, starting fresh auth flow");
    }
  }, [
    isAuthenticated,
    isConnected,
    isOnCorrectNetwork,
    hasSigned,
    navigate,
    log,
    refreshAuth,
  ]);

  // Auto-switch to Base Sepolia if connected but on wrong network only if not already on Sepolia
  useEffect(() => {
    if (isConnected && chainId !== baseSepolia.id && chainId !== sepolia.id) {
      log("Switching to Base Sepolia network");
      switchChain({ chainId: baseSepolia.id });
    }
  }, [isConnected, chainId, switchChain, log]);

  // Main auth flow controller
  useEffect(() => {
    log("Auth flow check", {
      isConnected,
      chainId,
      baseSepolia: baseSepolia.id,
      sepolia: sepolia.id,
      signature: !!signature,
      address,
      currentStep: authState.step,
    });

    if (!isConnected) {
      log("Not connected, setting step to connect");
      setAuthState((prev) => ({ ...prev, step: "connect", error: "" }));
      return;
    }

    if (chainId !== baseSepolia.id && chainId !== sepolia.id) {
      log("Wrong network, staying on connect");
      return;
    }

    if (authState.step === "connect") {
      // Check if wallet has been signed before and we have the same address
      const storedAddress = useAuthStore.getState().address;
      if (hasSigned && address && storedAddress === address) {
        log(
          "Wallet already signed before with same address, skipping to verification"
        );
        setAuthState((prev) => ({ ...prev, step: "verify", error: "" }));
        return;
      } else if (hasSigned && address && storedAddress !== address) {
        log(
          "Wallet signed before but different address, requiring new signature"
        );
        setHasSigned(false); // Reset hasSigned for new address
      }

      log("Moving to sign step");
      setAuthState((prev) => ({ ...prev, step: "sign", error: "" }));
      return;
    }

    // Handle verification step - either from signing or from skipped signing (hasSigned=true)
    if (
      (signature && address && authState.step === "sign") ||
      (hasSigned && address && authState.step === "verify")
    ) {
      log(
        signature
          ? "Signature received, starting verification"
          : "Skipped signing (already signed), starting verification"
      );
      // Call verification inline
      const doVerify = async () => {
        if (!address) {
          log("Missing address for verification");
          return;
        }

        // If we don't have a signature but hasSigned is true, we can proceed with stored auth
        if (!signature && !hasSigned) {
          log("Missing signature and wallet not signed before");
          return;
        }

        log("Starting user verification for address:", address);

        setAuthState((prev) => ({
          ...prev,
          step: "verify",
          isLoading: true,
          error: "",
        }));

        try {
          const response = await apiClient.getUserByAddress(address);
          log("API Response received:", response);

          const userData = response.data;

          if (userData && userData.id) {
            log("Existing user found:", userData);

            const resolvedUsername = userData.username?.trim() || "explorer";
            const normalizedUsername = resolvedUsername.toLowerCase();
            const resolvedEnsName =
              userData.subDomainName || `${normalizedUsername}.bloxland.eth`;

            setAuthState((prev) => ({
              ...prev,
              step: "complete",
              isLoading: false,
              existingUser: userData,
              username: normalizedUsername,
              error: "",
            }));

            // Set authentication in store
            // Use current signature or stored signature if hasSigned is true
            const authSignature =
              signature ||
              useAuthStore.getState().signature ||
              `signed-${address}-${Date.now()}`;
            setAuthentication({
              address: userData.userAddress,
              signature: authSignature,
              username: normalizedUsername,
              ensName: resolvedEnsName,
            });

            log("Authentication set for existing user, showing overlay");
            setShowOverlay(true);

            setTimeout(() => {
              log("Navigating to game");
              // navigate('/game')
              navigate("/game-integrations");
            }, 1500);
          } else {
            log("No existing user found, proceeding to username step");
            setAuthState((prev) => ({
              ...prev,
              step: "username",
              isLoading: false,
              existingUser: null,
              error: "",
            }));
          }
        } catch (error) {
          log("Error during user verification:", error);

          const apiError = error as ApiError;

          if (apiError?.status === 404) {
            log("User not found (404), proceeding to username step");
            setAuthState((prev) => ({
              ...prev,
              step: "username",
              isLoading: false,
              existingUser: null,
              error: "",
            }));
          } else {
            log("API error during verification:", apiError);
            setAuthState((prev) => ({
              ...prev,
              step: "username",
              isLoading: false,
              error:
                getErrorMessage(apiError) ||
                "Verification failed, proceeding to registration",
            }));
          }
        }
      };

      doVerify();
    }
  }, [
    isConnected,
    chainId,
    signature,
    address,
    authState.step,
    hasSigned,
    log,
    setAuthentication,
    setHasSigned,
    navigate,
  ]);

  // Create authentication message
  const message = `Welcome to BLOXLAND!\n\nPlease sign this message to authenticate and start your adventure.\n\nTimestamp: ${Date.now()}\nAddress: ${address}\nChain: Sepolia Testnet`;

  const handleConnect = async () => {
    setIsConnecting(true);
    setAuthState((prev) => ({ ...prev, error: "" }));
    try {
      await connect({ connector: injected() });
      log("Wallet connected successfully");
    } catch (error) {
      log("Connection failed:", error);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to connect wallet. Please try again.",
      }));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSign = async () => {
    if (!address) return;

    setAuthState((prev) => ({ ...prev, isLoading: true, error: "" }));
    try {
      signMessage({ message });
      log("Sign message initiated");
    } catch (error) {
      log("Signing failed:", error);
      setAuthState((prev) => ({
        ...prev,
        error: "Signing failed. Please try again.",
      }));
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Username validation
  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username))
      return "Username can only contain letters, numbers, hyphens, and underscores";
    if (username.startsWith("-") || username.endsWith("-"))
      return "Username cannot start or end with a hyphen";
    return null;
  };

  // Reset registration error when username changes
  useEffect(() => {
    if (registrationError) {
      resetRegistration();
    }
  }, [authState.username, registrationError, resetRegistration]);

  const handleUsernameChange = (newUsername: string) => {
    setAuthState((prev) => ({
      ...prev,
      username: newUsername.toLowerCase(),
      error: "",
    }));
  };

  const handleUsernameSubmit = async () => {
    const sanitizedUsername = authState.username.trim().toLowerCase();
    const validationError = validateUsername(sanitizedUsername);

    if (validationError) {
      setAuthState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    if (!address) {
      setAuthState((prev) => ({
        ...prev,
        error: "Address missing. Please try again.",
      }));
      return;
    }

    // Get signature from current state or stored state if hasSigned
    const authSignature =
      signature ||
      useAuthStore.getState().signature ||
      `signed-${address}-${Date.now()}`;
    if (!authSignature) {
      setAuthState((prev) => ({
        ...prev,
        error: "Authentication signature missing. Please try again.",
      }));
      return;
    }

    log("Starting user registration for username:", sanitizedUsername);
    setAuthState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      // Register user with the API
      const registrationResponse = await registerUser({
        address,
        username: sanitizedUsername,
        email: undefined,
        referrer: undefined,
      });

      log("User registered successfully:", registrationResponse);

      // Store authentication in Zustand store
      setAuthentication({
        address: address!,
        signature: authSignature,
        username: sanitizedUsername,
        ensName: `${sanitizedUsername}.bloxland.eth`,
      });

      setAuthState((prev) => ({
        ...prev,
        step: "complete",
        isLoading: false,
        username: sanitizedUsername,
        error: "",
      }));

      setShowOverlay(true);
      setTimeout(() => {
        log("Navigating to game after registration");
        // navigate('/game')
        navigate("/game-integrations");
      }, 2000);
    } catch (error: any) {
      log("User registration failed:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (
        error.message?.includes("username") ||
        error.message?.includes("taken") ||
        error.message?.includes("exists")
      ) {
        errorMessage = "Username is already taken. Please try another.";
      } else if (
        error.message?.includes("address") ||
        error.message?.includes("wallet")
      ) {
        errorMessage =
          "This wallet address is already registered. Please use a different address.";
      } else {
        errorMessage = getErrorMessage(error) || errorMessage;
      }

      setAuthState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "0x343...2342";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  const getTitle = () => {
    switch (authState.step) {
      case "connect":
        return "Connect Your Wallet";
      case "sign":
        return "Sign to Authenticate";
      case "verify":
        return authState.existingUser
          ? "Welcome Back, Explorer!"
          : "Verifying Your Account";
      case "username":
        return "Choose Your Username";
      case "complete":
        return authState.existingUser
          ? "Welcome Back to Bloxland!"
          : "Welcome to Bloxland!";
      default:
        return "Connect Your Wallet";
    }
  };

  const getDescription = () => {
    switch (authState.step) {
      case "connect":
        return "Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.";
      case "sign":
        return "Please sign the message to complete authentication and access the game securely.";
      case "verify":
        return authState.existingUser
          ? "We found your account. Preparing your world..."
          : "Hold tight while we check if you already have a Bloxland profile.";
      case "username":
        return "Choose a unique username for your Bloxland ENS domain. This will be your identity in the game.";
      case "complete":
        return authState.existingUser
          ? "Everything is ready. Taking you back into the action!"
          : `Your ENS domain ${getEnsDisplayName()} is ready! Redirecting to your adventure...`;
      default:
        return "Connect your Web3 wallet to start your adventure in Bloxland and earn crypto rewards.";
    }
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (authState.isLoading && authState.step === "sign") return "Signing...";
    if (authState.isLoading && authState.step === "verify")
      return "Verifying account...";
    if (authState.isLoading && authState.step === "username")
      return "Creating account...";
    if (isSignPending) return "Signing...";
    if (isRegistering) return "Creating account...";

    switch (authState.step) {
      case "connect":
        return "Connect Wallet";
      case "sign":
        return "Sign Message";
      case "verify":
        return "Verifying account...";
      case "username":
        return "Claim Username";
      case "complete":
        return "Welcome to Bloxland! ✓";
      default:
        return "Connect Wallet";
    }
  };

  const getCurrentError = () => {
    if (signError) return "Signing failed. Please try again.";
    if (authState.error) return authState.error;
    if (registrationError) return getErrorMessage(registrationError);
    return "";
  };

  const getEnsDisplayName = () => {
    return (
      authState.existingUser?.subDomainName ??
      (authState.username ? `${authState.username}.bloxland.eth` : "")
    );
  };

  const handleButtonClick = () => {
    switch (authState.step) {
      case "connect":
        handleConnect();
        break;
      case "sign":
        handleSign();
        break;
      case "verify":
        // No manual action while verifying
        break;
      case "username":
        handleUsernameSubmit();
        break;
      default:
        break;
    }
  };

  const isButtonDisabled = () => {
    if (authState.step === "username") {
      return !authState.username.trim() || authState.isLoading || isRegistering;
    }
    return (
      isConnecting ||
      authState.isLoading ||
      isSignPending ||
      authState.step === "complete" ||
      authState.step === "verify"
    );
  };

  return (
    <div className="connect-page-bg min-h-[100dvh] w-full text-white overflow-x-hidden flex items-center justify-center">
      <div className="text-center space-y-8 px-6 sm:px-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="./logo.png"
            alt="logo"
            className="w-12 h-12 sm:w-16 sm:h-16"
          />
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
        {isConnected &&
          authState.step !== "complete" &&
          authState.step !== "username" && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network:</span>
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
                  <span className="text-gray-300">Address:</span>
                  <span className="text-blue-400 font-mono">
                    {formatAddress(address || "")}
                  </span>
                </div>
                {authState.step === "sign" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-orange-400">Ready to sign</span>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Username Input Section */}
        {authState.step === "username" && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="text-left">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-2"
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
                    className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">
                    .bloxland.eth
                  </div>
                </div>
              </div>

              {/* Username Preview */}
              {authState.username && !authState.error && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-300 text-sm">
                    📍 Your ENS:{" "}
                    <span className="font-mono">
                      {authState.username}.bloxland.eth
                    </span>
                  </p>
                </div>
              )}

              {/* Character count */}
              <div className="text-right text-xs text-gray-400">
                {authState.username.length}/20 characters
              </div>
            </div>
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
          {authState.step === "complete" ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">
                Preparing your adventure...
              </p>
            </div>
          ) : authState.step === "verify" ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-300">Verifying your account...</p>
            </div>
          ) : (
            <button
              onClick={handleButtonClick}
              disabled={isButtonDisabled()}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {getButtonText()}
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {["connect", "sign", "verify", "username", "complete"].map(
            (step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === authState.step
                    ? "bg-blue-400 scale-125"
                    : [
                        "connect",
                        "sign",
                        "verify",
                        "username",
                        "complete",
                      ].indexOf(authState.step) > index
                    ? "bg-green-400"
                    : "bg-gray-600"
                }`}
              />
            )
          )}
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
              <h3 className="text-xl font-semibold">Welcome to Bloxland!</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Your Address:</p>
                <p className="text-lg font-mono bg-white/10 px-3 py-2 rounded border">
                  {formatAddress(address || "")}
                </p>
                <p className="text-sm text-gray-300">Your ENS Domain:</p>
                <p className="text-lg font-mono bg-green-500/20 px-3 py-2 rounded border border-green-500/50 text-green-300">
                  {getEnsDisplayName() || "pending"}
                </p>
                <p className="text-sm text-gray-300">Network:</p>
                <p className="text-sm text-green-400">Base Sepolia Testnet ✓</p>
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
