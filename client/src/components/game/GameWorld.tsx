import { useState } from 'react';
import MapContainer from '../map/MapContainer';
import AvatarCreator from '../player/AvatarCreator';
import { GlassmorphismModal } from '../ui/GlassmorphismModal';

interface GameWorldProps {
    onLocationChange?: (location: [number, number] | null) => void;
}

const GameWorld: React.FC<GameWorldProps> = ({ onLocationChange }) => {
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showAvatarCreator, setShowAvatarCreator] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleLocationChange = (location: [number, number] | null) => {
        setUserLocation(location);
        onLocationChange?.(location);
    };

    const handleMapReady = (map: mapboxgl.Map) => {
        setMapInstance(map);
    };

    return (
        <>
            <MapContainer
                onUserLocationChange={handleLocationChange}
                onMapReady={handleMapReady}
            />

            {/* Avatar Creator Modal */}
            <GlassmorphismModal
                isOpen={showAvatarCreator}
                onClose={() => setShowAvatarCreator(false)}
            >
                <AvatarCreator
                    onAvatarCreated={(url: string) => {
                        setAvatarUrl(url);
                        setShowAvatarCreator(false);
                    }}
                />
            </GlassmorphismModal>
        </>
    );
};

export default GameWorld;
