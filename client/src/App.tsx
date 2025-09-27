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
const GameIntegrationsPage = React.lazy(() => import('./pages/GameIntegrationsPage'));
const CreateCheckpointPage = React.lazy(() => import('./pages/CreateCheckpointPage'));
const SponsorDashboard = React.lazy(() => import('./pages/SponsorDashboard'));
const CheckpointDetailPage = React.lazy(() => import('./pages/CheckpointDetailPage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const MiniGamesPage = React.lazy(() => import('./pages/MiniGamesPage'));

import './index.css';

// Setup queryClient with optimized settings to prevent spam
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduced from 3 to prevent spam
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Prevent spam on focus
      refetchOnReconnect: false, // Prevent spam on reconnect
      refetchOnMount: false, // Prevent spam on component mount
      networkMode: 'offlineFirst', // Better offline handling
    },
    mutations: {
      retry: 0, // Disable mutation retries to prevent spam
      networkMode: 'offlineFirst',
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <LoadingSpinner />
  </div>
);

// Auth wrapper component to handle authentication state
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthSync(); // This handles the wallet connection sync
  return <>{children}</>;
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
};

// Main App component
const App: React.FC = () => {
  if (!wagmiAdapter?.wagmiConfig) {
    return <PageLoader />;
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <Router>
            <div className="App min-h-screen bg-black">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/connect" element={<ConnectPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/mini-games" element={<MiniGamesPage />} />
                  <Route path="/game-integrations" element={
                    <GameIntegrationsPage />
                  } />
                  <Route
                    path="/game"
                    element={
                      <ProtectedRoute>
                        <GamePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/create-checkpoint" element={
                    <ProtectedRoute>
                      <CreateCheckpointPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sponsor-dashboard" element={
                    <ProtectedRoute>
                      <SponsorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkpoint/:id" element={
                    <ProtectedRoute>
                      <CheckpointDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AuthWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
