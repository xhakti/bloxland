import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter } from './config/appkit';
import { useAuthStore, useAuthSync } from './stores/authStore';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load components to prevent circular imports
const HomePage = React.lazy(() => import('./pages/HomePage'));
const GamePage = React.lazy(() => import('./pages/GamePage'));
const ConnectPage = React.lazy(() => import('./pages/ConnectPage'));
const CreateCheckpointPage = React.lazy(() => import('./pages/CreateCheckpointPage'));

import './index.css';

// Setup queryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <LoadingSpinner />
  </div>
)

// Protected Route Component (only for Game page)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized, address, timestamp, hasSigned } = useAuthStore()

  // Debug route protection decisions
  React.useEffect(() => {
    console.log('[ProtectedRoute] Auth state check:', {
      isAuthenticated,
      isConnected,
      isOnCorrectNetwork,
      isLoading,
      isInitialized,
      hasAddress: !!address,
      hasSigned,
      sessionAge: timestamp ? (Date.now() - timestamp) / (1000 * 60 * 60 * 24) : null
    });
  }, [isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized, address, timestamp, hasSigned]);

  // Show loading while initializing or loading persistence
  if (!isInitialized || isLoading) {
    console.log('[ProtectedRoute] Showing loader - not initialized or loading');
    return <PageLoader />
  }

  // Check if we have a valid auth session
  const hasValidAuth = isAuthenticated && address && timestamp;
  const isSessionExpired = timestamp ? (Date.now() - timestamp) > (7 * 24 * 60 * 60 * 1000) : false;

  // Redirect if not properly authenticated or session expired
  if (!hasValidAuth || isSessionExpired || !isConnected || !isOnCorrectNetwork) {
    console.log('[ProtectedRoute] Redirecting to connect - invalid auth:', {
      hasValidAuth,
      isSessionExpired,
      isConnected,
      isOnCorrectNetwork
    });
    return <Navigate to="/connect" replace />
  }

  console.log('[ProtectedRoute] Access granted - rendering protected content');
  return <>{children}</>
}

// Auth Route Component (redirect if already authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized, address, timestamp, hasSigned } = useAuthStore()

  // Debug auth route decisions
  React.useEffect(() => {
    console.log('[AuthRoute] Auth state check:', {
      isAuthenticated,
      isConnected,
      isOnCorrectNetwork,
      isLoading,
      isInitialized,
      hasAddress: !!address,
      hasSigned,
      sessionAge: timestamp ? (Date.now() - timestamp) / (1000 * 60 * 60 * 24) : null
    });
  }, [isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized, address, timestamp, hasSigned]);

  // Show loading while initializing or loading persistence
  if (!isInitialized || isLoading) {
    console.log('[AuthRoute] Showing loader - not initialized or loading');
    return <PageLoader />
  }

  // Check if we have a valid complete auth session
  const hasValidAuth = isAuthenticated && address && timestamp && isConnected && isOnCorrectNetwork;
  const isSessionExpired = timestamp ? (Date.now() - timestamp) > (7 * 24 * 60 * 60 * 1000) : false;

  // Redirect if already fully authenticated and session is valid
  if (hasValidAuth && !isSessionExpired) {
    console.log('[AuthRoute] Redirecting to game - already authenticated');
    return <Navigate to="/game" replace />
  }

  console.log('[AuthRoute] Showing auth page - not fully authenticated');
  return <>{children}</>
}

// Auth sync component
const AuthSync = ({ children }: { children: React.ReactNode }) => {
  useAuthSync()
  return <>{children}</>
}

// Main App Content
const AppContent = () => {
  return (
    <AuthSync>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/connect"
              element={
                <AuthRoute>
                  <ConnectPage />
                </AuthRoute>
              }
            />
            {/* HomePage is NOT protected */}
            <Route
              path="/"
              element={<HomePage />}
            />
            {/* Only GamePage is protected */}
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />
            {/* CreateCheckpointPage is also protected */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateCheckpointPage />
                </ProtectedRoute>
              }
            />
            {/* Default redirect to home, not connect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthSync>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
