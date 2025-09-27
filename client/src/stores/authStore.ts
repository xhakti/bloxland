import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAccount, useChainId } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import React from "react";

// Type for data that gets persisted to localStorage
interface PersistedAuthState {
  isAuthenticated: boolean;
  address: string | null;
  signature: string | null;
  username: string | null;
  ensName: string | null;
  timestamp: number | null;
  hasSigned: boolean;
  userType: 'user' | 'sponsor' | null;
}

interface AuthState {
  // Auth data
  isAuthenticated: boolean;
  address: string | null;
  signature: string | null;
  username: string | null;
  ensName: string | null;
  timestamp: number | null;
  hasSigned: boolean;
  userType: 'user' | 'sponsor' | null;

  // Wallet connection state
  isConnected: boolean;
  chainId: number | null;
  isOnCorrectNetwork: boolean;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setWalletConnection: (
    connected: boolean,
    address: string | null,
    chainId: number | null
  ) => void;
  setAuthentication: (authData: {
    address: string;
    signature: string;
    username: string;
    ensName: string;
  }) => void;
  setHasSigned: (hasSigned: boolean) => void;
  setUserType: (userType: 'user' | 'sponsor') => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  refreshAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      address: null,
      signature: null,
      username: null,
      ensName: null,
      timestamp: null,
      hasSigned: false,
      userType: null,
      isConnected: false,
      chainId: null,
      isOnCorrectNetwork: false,
      isLoading: true,
      isInitialized: false,

      // Actions
      setWalletConnection: (connected, address, chainId) => {
        const isOnCorrectNetwork = chainId === sepolia.id || chainId === baseSepolia.id;

        set({
          isConnected: connected,
          chainId,
          isOnCorrectNetwork,
        });

        // Clear auth if disconnected or wrong network
        if (!connected || !isOnCorrectNetwork) {
          set({
            isAuthenticated: false,
            address: null,
            signature: null,
            username: null,
            ensName: null,
            timestamp: null,
            hasSigned: false,
            userType: null,
          });
        }
      },

      setAuthentication: (authData) => {
        const timestamp = Date.now();
        console.log("[AuthStore] setAuthentication called:", {
          authData,
          timestamp,
        });

        set({
          isAuthenticated: true,
          address: authData.address,
          signature: authData.signature,
          username: authData.username,
          ensName: authData.ensName,
          timestamp,
          hasSigned: true,
        });

        // Debug: Check localStorage after setting
        setTimeout(() => {
          const stored = localStorage.getItem("bloxland-auth");
          console.log(
            "[AuthStore] localStorage after setAuthentication:",
            stored
          );
          const state = get();
          console.log("[AuthStore] Current state after setAuthentication:", {
            isAuthenticated: state.isAuthenticated,
            address: state.address,
            username: state.username,
            timestamp: state.timestamp,
          });
        }, 100);
      },

      setHasSigned: (hasSigned) => {
        console.log("[AuthStore] setHasSigned called:", hasSigned);
        set({ hasSigned });
      },

      setUserType: (userType) => {
        console.log("[AuthStore] setUserType called:", userType);
        set({ userType });
      },

      logout: () => {
        console.log(
          "[AuthStore] logout called, resetting all auth state including hasSigned"
        );
        set({
          isAuthenticated: false,
          address: null,
          signature: null,
          username: null,
          ensName: null,
          timestamp: null,
          hasSigned: false,
          userType: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      refreshAuth: () => {
        const state = get();
        if (state.isAuthenticated && state.timestamp) {
          const isExpired =
            Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days
          if (isExpired) {
            console.log("Refreshing expired auth session, resetting hasSigned");
            set({
              isAuthenticated: false,
              address: null,
              signature: null,
              username: null,
              ensName: null,
              timestamp: null,
              hasSigned: false,
              userType: null,
            });
          }
        }
      },
    }),
    {
      name: "bloxland-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        address: state.address,
        signature: state.signature,
        username: state.username,
        ensName: state.ensName,
        timestamp: state.timestamp,
        hasSigned: state.hasSigned,
        userType: state.userType,
      }),
      merge: (persistedState, currentState) => {
        console.log("[AuthStore] merge called with:", {
          persistedState,
          currentState: {
            isAuthenticated: currentState.isAuthenticated,
            isInitialized: currentState.isInitialized,
          },
        });

        return {
          ...currentState,
          ...(persistedState || {}),
        };
      },
      onRehydrateStorage: () => (state, error) => {
        console.log("[AuthStore] Rehydrating from storage:", { state, error });
        if (error) {
          console.error("[AuthStore] Rehydration error:", error);
        }
        if (state && state.timestamp) {
          const age = Date.now() - state.timestamp;
          const isExpired = age > 7 * 24 * 60 * 60 * 1000;
          console.log("[AuthStore] Rehydrated session age:", {
            age: age / (1000 * 60 * 60 * 24),
            days: true,
            isExpired,
          });
          if (isExpired) {
            console.log(
              "[AuthStore] Session expired during rehydration, clearing auth data and hasSigned"
            );
            state.isAuthenticated = false;
            state.address = null;
            state.signature = null;
            state.username = null;
            state.ensName = null;
            state.timestamp = null;
            state.hasSigned = false;
            state.userType = null;
          }
        }
        return state;
      },
    }
  )
);

// Hook to sync wagmi state with zustand
export const useAuthSync = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const {
    setWalletConnection,
    setLoading,
    setInitialized,
    isAuthenticated,
    timestamp,
    logout,
  } = useAuthStore();

  // Debug initial state on mount - run once
  const [hasLoggedInitial, setHasLoggedInitial] = React.useState(false);

  React.useEffect(() => {
    if (!hasLoggedInitial) {
      console.log("[useAuthSync] Component mounted, checking initial state...");

      // Check localStorage directly
      const storedAuth = localStorage.getItem("bloxland-auth");
      console.log("[useAuthSync] Raw localStorage:", storedAuth);

      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          console.log("[useAuthSync] Parsed localStorage:", parsed);
        } catch (e) {
          console.error("[useAuthSync] Failed to parse localStorage:", e);
        }
      } else {
        console.log("[useAuthSync] No data in localStorage");
      }

      // Check zustand state
      const authState = useAuthStore.getState();
      console.log("[useAuthSync] Initial Zustand state:", {
        isAuthenticated: authState.isAuthenticated,
        address: authState.address,
        username: authState.username,
        timestamp: authState.timestamp,
        isInitialized: authState.isInitialized,
      });

      // Check wagmi state
      console.log("[useAuthSync] Initial Wagmi state:", {
        isConnected,
        address,
        chainId,
      });

      setHasLoggedInitial(true);
    }
  }, [isConnected, address, chainId, hasLoggedInitial]);

  React.useEffect(() => {
    console.log("[useAuthSync] Effect triggered with:", {
      isConnected,
      address,
      chainId,
      isAuthenticated,
      timestamp,
      isInitialized: useAuthStore.getState().isInitialized,
    });

    // Always sync wallet connection state
    setWalletConnection(isConnected, address || null, chainId || null);

    // Only validate auth if we're initialized (to prevent clearing persisted auth during startup)
    const authState = useAuthStore.getState();
    if (authState.isInitialized && isAuthenticated && timestamp) {
      const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days
      const storedAddress = useAuthStore.getState().address;
      const isWrongAddress =
        address && storedAddress && address !== storedAddress;

      console.log("[useAuthSync] Auth validity check:", {
        isAuthenticated,
        timestamp,
        age: timestamp ? (Date.now() - timestamp) / (1000 * 60 * 60 * 24) : 0,
        isExpired,
        storedAddress,
        currentAddress: address,
        isWrongAddress,
      });

      // Only logout if definitely expired or wrong address
      if (isExpired) {
        console.log("Auth session expired:", { isExpired });
        logout();
      } else if (isWrongAddress) {
        console.log("Auth address mismatch:", {
          storedAddress,
          currentAddress: address,
        });
        logout();
      }
    }

    // Mark as initialized after first sync
    const currentState = useAuthStore.getState();
    if (!currentState.isInitialized) {
      console.log(
        "[useAuthSync] Setting initialized and clearing loading state"
      );
      setInitialized(true);
      setLoading(false);

      // Check localStorage again after initialization
      setTimeout(() => {
        const storedAfterInit = localStorage.getItem("bloxland-auth");
        console.log(
          "[useAuthSync] localStorage after initialization:",
          storedAfterInit
        );
      }, 100);
    }
  }, [
    isConnected,
    address,
    chainId,
    isAuthenticated,
    timestamp,
    setWalletConnection,
    setLoading,
    setInitialized,
    logout,
  ]);
};
