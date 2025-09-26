/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AvatarLayer } from '../player/AvatarLayer';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MapContainerProps {
    onUserLocationChange?: (location: [number, number] | null) => void;
    onMapReady?: (map: any) => void;
    avatarUrl?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
    onUserLocationChange,
    onMapReady,
    avatarUrl = 'https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb'
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const avatarLayerRef = useRef<AvatarLayer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const isMapInitialized = useRef(false);

    // Preload avatar and animations at location, then fly to it with Pokémon GO style camera
    const preloadAvatarAndFly = async (map: any, location: [number, number]) => {
        try {
            console.log('Preloading avatar at location:', location);
            setLoadingStatus('Loading avatar...');

            // Create avatar layer at the target location
            const avatarLayer = new AvatarLayer({
                id: 'user-avatar',
                avatarUrl: avatarUrl,
                position: location,
                scale: 5
            });

            // Add avatar layer to map
            avatarLayerRef.current = avatarLayer;
            map.addLayer(avatarLayer);

            setLoadingStatus('Loading animations...');

            // Wait for avatar and animations to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('Avatar preloaded successfully, starting Pokémon GO style fly animation');
            setLoadingStatus('Ready!');

            // Small delay to show "Ready!" status
            await new Promise(resolve => setTimeout(resolve, 500));

            // Hide loading screen
            setIsLoading(false);

            // Pokémon GO style camera animation - flies to a position above and behind the avatar
            map.flyTo({
                center: location,
                zoom: 19, // Higher zoom for closer view like Pokémon GO
                pitch: 65, // Tilted angle looking down at the avatar (Pokémon GO style)
                bearing: -17.6, // Slight rotation for more dynamic view
                duration: 3000, // 3 second smooth animation
                curve: 1.42, // Natural curve for the flight path
                speed: 0.8, // Slightly slower for cinematic effect
                essential: true
            });

            // Call onMapReady after animation starts
            setTimeout(() => {
                // Don't log the entire map object, just indicate it's ready
                console.log('Map and avatar system ready');
                onMapReady?.(map);
            }, 500);

        } catch (error) {
            console.error('Error preloading avatar:', error);
            setLoadingStatus('Error loading avatar');
            setIsLoading(false);
            onMapReady?.(map);
        }
    };

    useEffect(() => {
        if (!mapContainerRef.current || isMapInitialized.current) return;

        console.log('Initializing map...');

        const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('Mapbox access token is missing!');
            setLoadingStatus('Missing Mapbox token');
            setIsLoading(false);
            return;
        }

        mapboxgl.accessToken = accessToken;

        try {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/standard',
                center: [0, 0],
                zoom: 3,
                pitch: 60,
                bearing: -20,
                maxPitch: 85,
                antialias: true
            });

            mapRef.current = map;
            isMapInitialized.current = true;

            map.on('load', () => {
                console.log('Map loaded, getting location...');
                setLoadingStatus('Getting location...');

                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const location: [number, number] = [longitude, latitude];

                            console.log('Location obtained:', location);
                            setUserLocation(location);
                            onUserLocationChange?.(location);

                            // Preload avatar first, then fly to location with Pokémon GO style
                            preloadAvatarAndFly(map, location);
                        },
                        (error) => {
                            console.warn('Geolocation error:', error);
                            // Use Mumbai as fallback
                            const fallbackLocation: [number, number] = [72.900719, 19.072816];
                            setUserLocation(fallbackLocation);
                            onUserLocationChange?.(fallbackLocation);

                            preloadAvatarAndFly(map, fallbackLocation);
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                    );
                } else {
                    console.warn('Geolocation not available');
                    const defaultLocation: [number, number] = [0, 0];
                    setUserLocation(defaultLocation);
                    onUserLocationChange?.(defaultLocation);

                    preloadAvatarAndFly(map, defaultLocation);
                }
            });

            map.on('error', (e) => {
                console.error('Map error:', e);
                setLoadingStatus('Map error');
                setIsLoading(false);
            });

        } catch (error) {
            console.error('Error creating map:', error);
            setLoadingStatus('Failed to create map');
            setIsLoading(false);
        }

        return () => {
            console.log('Cleaning up...');
            if (avatarLayerRef.current && mapRef.current) {
                try {
                    mapRef.current.removeLayer(avatarLayerRef.current.id);
                } catch (error) {
                    console.warn('Error during cleanup:', error);
                }
            }
            if (mapRef.current) {
                mapRef.current.remove();
            }
            mapRef.current = null;
            avatarLayerRef.current = null;
            isMapInitialized.current = false;
        };
    }, [avatarUrl]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapContainerRef}
                className="w-full h-full"
                style={{ minHeight: '400px' }}
            />

            {/* Simple loading overlay - no gradient */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                    <div className="text-center space-y-6">
                        <LoadingSpinner />
                        <div className="text-white space-y-2">
                            <p className="text-lg">{loadingStatus}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Avatar status indicator */}
            {!isLoading && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-lg text-white p-3 rounded-lg text-sm z-10 max-w-xs">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-semibold">Avatar Ready</span>
                    </div>
                    <div className="text-xs space-y-1 opacity-75">
                        <div>🎮 Pokémon GO style view</div>
                        <div>📍 {userLocation?.[1].toFixed(4)}, {userLocation?.[0].toFixed(4)}</div>
                    </div>
                </div>
            )}

            {/* Animation status */}
            {!isLoading && avatarLayerRef.current && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-lg text-white p-3 rounded-lg text-sm z-10">
                    <div className="text-xs space-y-1">
                        <div className="font-semibold">Animation Status</div>
                        <div>Current: {avatarLayerRef.current.getCurrentAnimation() || 'Idle'}</div>
                        <div>Loaded: {avatarLayerRef.current.getAvailableAnimations().length} animations</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapContainer;
