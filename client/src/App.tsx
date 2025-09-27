import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from './config/appkit'
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ConnectPage from './pages/ConnectPage';
// import SettingsPage from './pages/SettingsPage';
import './index.css';

// Setup queryClient
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/connect" element={<ConnectPage />} />
              <Route path="/temp" element={<Temp />} />
              <Route path="/game" element={<GamePage />} />
              {/* <Route path="/settings" element={<SettingsPage />} /> */}
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
