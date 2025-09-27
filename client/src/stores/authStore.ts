import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import React from "react";

interface AuthState {
  // Auth data
  isAuthenticated: boolean;
  address: string | null;
  signature: string | null;
  username: string | null;
  ensName: string | null;
  timestamp: number | null;

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
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
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
      isConnected: false,
      chainId: null,
      isOnCorrectNetwork: false,
      isLoading: true,
      isInitialized: false,

      // Actions
      setWalletConnection: (connected, address, chainId) => {
        const isOnCorrectNetwork = chainId === sepolia.id;

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
          });
        }
      },

      setAuthentication: (authData) => {
        const timestamp = Date.now();
        set({
          isAuthenticated: true,
          address: authData.address,
          signature: authData.signature,
          username: authData.username,
          ensName: authData.ensName,
          timestamp,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          address: null,
          signature: null,
          username: null,
          ensName: null,
          timestamp: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: "bloxland-auth",
      partialize: (state) => ({
        // Only persist auth data, not wallet connection state
        isAuthenticated: state.isAuthenticated,
        address: state.address,
        signature: state.signature,
        username: state.username,
        ensName: state.ensName,
        timestamp: state.timestamp,
      }),
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

  React.useEffect(() => {
    // Sync wallet connection state
    setWalletConnection(isConnected, address || null, chainId || null);

    // Check if stored auth is still valid
    if (isAuthenticated && timestamp) {
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
      const storedAddress = useAuthStore.getState().address;
      const isWrongAddress = address !== storedAddress;

      if (
        isExpired ||
        isWrongAddress ||
        !isConnected ||
        chainId !== sepolia.id
      ) {
        logout();
      }
    } // Mark as initialized after first sync
    if (!useAuthStore.getState().isInitialized) {
      setInitialized(true);
      setLoading(false);
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
