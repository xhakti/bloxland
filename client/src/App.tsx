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

import './index.css';

// Setup queryClient
const queryClient = new QueryClient()

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <LoadingSpinner />
  </div>
)

// Protected Route Component (only for Game page)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized } = useAuthStore()

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  // Redirect if not properly authenticated
  if (!isConnected || !isOnCorrectNetwork || !isAuthenticated) {
    return <Navigate to="/connect" replace />
  }

  return <>{children}</>
}

// Auth Route Component (redirect if already authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, isLoading, isInitialized } = useAuthStore()

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  // Redirect if already authenticated
  if (isConnected && isOnCorrectNetwork && isAuthenticated) {
    return <Navigate to="/game" replace />
  }

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
