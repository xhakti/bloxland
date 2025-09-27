/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisconnect } from 'wagmi';
import { useAuthStore } from '../stores/authStore';
import MapContainer from '../components/map/MapContainer';
import PlayerHUD from '../components/game/PlayerHUD';
import GameControls from '../components/game/GameControls';

const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const { disconnect } = useDisconnect();
    const { logout, username, ensName } = useAuthStore();

    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [_mapInstance, setMapInstance] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Your provided Ready Player Me avatar URL
    const [avatarUrl] = useState<string>(
        'https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb'
    );

    const handleUserLocationChange = useCallback((location: [number, number] | null) => {
        console.log('Location changed to:', location);
        setUserLocation(location);
    }, []);

    const handleMapReady = useCallback((map: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Don't log the entire map object, just set the state
        console.log('Map ready - avatar system initialized');
        setMapInstance(map);
        setIsMapReady(true);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            // Clear auth state
            logout();
            // Disconnect wallet
            disconnect();
            // Navigate to home page
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if disconnect fails, still clear auth and redirect
            logout();
            navigate('/');
        }
    }, [logout, disconnect, navigate]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* Map Container with Ready Player Me Avatar */}
            <MapContainer
                onUserLocationChange={handleUserLocationChange}
                onMapReady={handleMapReady}
                avatarUrl={avatarUrl}
            />

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Bloxland" className="w-8 h-8" />
                        <span className="text-white font-bold text-xl">BLOXLAND</span>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-4 py-2 border border-white/20"
                        >
                            <div className="text-right">
                                <p className="text-white font-medium text-sm">{username || 'Explorer'}</p>
                                <p className="text-gray-300 text-xs">{ensName || 'No ENS'}</p>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {(username || 'E').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg">
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        🏠 Home
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // Add settings functionality later
                                        }}
                                        className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        ⚙️ Settings
                                    </button>
                                    <hr className="my-2 border-white/10" />
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}

            {/* Game UI Overlay */}
            {/* {isMapReady && (
                <>
                    <PlayerHUD userLocation={userLocation} />
                    <GameControls />
                </>
            )} */}
        </div>
    );
};

export default GamePage;
