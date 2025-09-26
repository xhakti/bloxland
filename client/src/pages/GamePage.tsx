/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import MapContainer from '../components/map/MapContainer';
import PlayerHUD from '../components/game/PlayerHUD';
import GameControls from '../components/game/GameControls';

const GamePage: React.FC = () => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [_mapInstance, setMapInstance] = useState<any>(null);

    const handleUserLocationChange = useCallback((location: [number, number] | null) => {
        console.log('Location changed:', location);
        setUserLocation(location);
    }, []);

    const handleMapReady = useCallback((map: any) => {
        console.log('Map ready:', map);
        setMapInstance(map);
        setIsMapReady(true);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* Map Container */}
            <MapContainer
                onUserLocationChange={handleUserLocationChange}
                onMapReady={handleMapReady}
            />

            {/* Game UI Overlay */}
            {isMapReady && (
                <>
                    <PlayerHUD userLocation={userLocation} />
                    <GameControls />
                </>
            )}

            {/* Simple debug info */}
            {import.meta.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-10">
                    <div>Map Ready: {isMapReady ? '✅' : '❌'}</div>
                    <div>Has Location: {userLocation ? '✅' : '❌'}</div>
                </div>
            )}
        </div>
    );
};

export default GamePage;
