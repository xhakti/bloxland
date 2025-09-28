import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useConnect,
  useSignMessage,
} from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useAuthStore } from "../stores/authStore";
import { useUserRegistrationFlow, getErrorMessage } from "./useApi";
import { apiClient } from "../lib/api";
import type { ApiError, User } from "../lib/api";

export type AuthStep =
  | "connect"
  | "sign"
  | "verify"
  | "username"
  | "location"
  | "complete";

export interface AuthState {
  step: AuthStep;
  isLoading: boolean;
  error: string;
  existingUser: User | null;
  username: string;
  // Location specific
  locationPermission: PermissionState | "unsupported" | null;
  locationStatus: "idle" | "requesting" | "granted" | "denied";
}

export const useConnectPageAuth = () => {
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
    locationPermission: null,
    locationStatus: "idle",
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
      navigate("/game");
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
              step: "location", // proceed to location step
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
              navigate("/game");
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
        navigate("/game");
      }, 1500);
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
      case "location":
        return "Enable Location";
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
      case "location":
        return "We use your approximate location to place you in the world, show nearby checkpoints and quests. You stay in control.";
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
    if (
      authState.step === "location" &&
      authState.locationStatus === "requesting"
    )
      return "Requesting...";
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
      case "location":
        if (authState.locationStatus === "granted") return "Continue";
        if (authState.locationStatus === "denied") return "Skip for now";
        return "Enable Location";
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
      case "location": {
        const proceed = () => {
          if (authState.existingUser) {
            // Existing user skips username entirely
            setAuthState((prev) => ({ ...prev, step: "complete" }));
            setShowOverlay(true);
            setTimeout(() => navigate("/game"), 1200);
          } else {
            // New user now chooses username after location
            setAuthState((prev) => ({ ...prev, step: "username" }));
          }
        };

        if (authState.locationStatus === "granted") {
          proceed();
        } else if (authState.locationStatus === "denied") {
          proceed();
        } else {
          requestLocationPermission();
        }
        break;
      }
      default:
        break;
    }
  };

  const isButtonDisabled = () => {
    if (authState.step === "username") {
      return !authState.username.trim() || authState.isLoading || isRegistering;
    }
    if (authState.step === "location") {
      return authState.locationStatus === "requesting";
    }
    return (
      isConnecting ||
      authState.isLoading ||
      isSignPending ||
      authState.step === "complete" ||
      authState.step === "verify"
    );
  };

  // Request location permission logic
  const requestLocationPermission = () => {
    if (!("geolocation" in navigator)) {
      setAuthState((prev) => ({
        ...prev,
        locationPermission: "unsupported",
        locationStatus: "denied",
      }));
      return;
    }
    setAuthState((prev) => ({ ...prev, locationStatus: "requesting" }));
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("[Location] Granted", pos.coords);
          setAuthState((prev) => ({ ...prev, locationStatus: "granted" }));
        },
        (err) => {
          console.warn("[Location] Denied or error", err);
          setAuthState((prev) => ({
            ...prev,
            locationStatus: "denied",
            error: prev.error || "",
          }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (e) {
      console.error("[Location] Exception requesting permission", e);
      setAuthState((prev) => ({ ...prev, locationStatus: "denied" }));
    }
  };

  // Proactively query permission state (where supported) when entering location step
  useEffect(() => {
    if (
      authState.step === "location" &&
      "permissions" in navigator &&
      (navigator as any).permissions
    ) {
      try {
        (navigator as any).permissions
          .query({ name: "geolocation" })
          .then((status: any) => {
            setAuthState((prev) => ({
              ...prev,
              locationPermission: status.state as PermissionState,
            }));
            if (status.state === "granted") {
              setAuthState((prev) => ({ ...prev, locationStatus: "granted" }));
            } else if (status.state === "denied") {
              setAuthState((prev) => ({ ...prev, locationStatus: "denied" }));
            }
            status.onchange = () => {
              setAuthState((prev) => ({
                ...prev,
                locationPermission: status.state as PermissionState,
              }));
            };
          })
          .catch(() => {
            /* ignore */
          });
      } catch {
        /* ignore */
      }
    }
  }, [authState.step]);

  return {
    // State
    authState,
    showOverlay,
    isConnecting,
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
    requestLocationPermission,
  };
};
