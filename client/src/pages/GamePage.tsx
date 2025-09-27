/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisconnect } from 'wagmi';
import { useAuthStore } from '../stores/authStore';
import MapContainer from '../components/map/MapContainer';
import PlayerHUD from '../components/game/PlayerHUD';
import GameControls from '../components/game/GameControls';
import BottomBar from '../components/BottomBar';

const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const { disconnect } = useDisconnect();
    const { logout, username, ensName } = useAuthStore();

    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [_mapInstance, setMapInstance] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

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
                showCheckpoints={true}
            />
            <BottomBar 
                username={username || undefined}
                ensName={ensName || undefined}
                onLogout={handleLogout}
            />


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
