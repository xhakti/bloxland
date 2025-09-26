import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
// import SettingsPage from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/game" element={<GamePage />} />
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
