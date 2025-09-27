/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import MapContainer from '../components/map/MapContainer';
import PlayerHUD from '../components/game/PlayerHUD';
import GameControls from '../components/game/GameControls';

const GamePage: React.FC = () => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [_mapInstance, setMapInstance] = useState<any>(null);

    // Your provided Ready Player Me avatar URL
    const [avatarUrl] = useState<string>(
        'https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb'
    );

    const handleUserLocationChange = useCallback((location: [number, number] | null) => {
        console.log('Location changed to:', location);
        setUserLocation(location);
    }, []);

    const handleMapReady = useCallback((map: any) => {
        // Don't log the entire map object, just set the state
        console.log('Map ready - avatar system initialized');
        setMapInstance(map);
        setIsMapReady(true);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* Map Container with Ready Player Me Avatar */}
            <MapContainer
                onUserLocationChange={handleUserLocationChange}
                onMapReady={handleMapReady}
                avatarUrl={avatarUrl}
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
