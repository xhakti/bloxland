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
    const [is3DMode, setIs3DMode] = useState(true);
    const isMapInitialized = useRef(false);

    // Toggle between 2D and 3D view modes
    const toggleView = () => {
        if (!mapRef.current) return;

        const map = mapRef.current;
        const newMode = !is3DMode;
        
        if (newMode) {
            // Switch to 3D mode - overhead view
            map.flyTo({
                pitch: 70, // High pitch for overhead 3D view
                bearing: 0, // North-facing for consistent orientation
                duration: 1000,
                essential: true
            });
        } else {
            // Switch to 2D mode - flat view
            map.flyTo({
                pitch: 0, // Flat 2D view
                bearing: 0, // Reset bearing
                duration: 1000,
                essential: true
            });
        }
        
        setIs3DMode(newMode);
    };

    // Preload avatar and animations at location, then fly to it with overhead view
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

            console.log('Avatar preloaded successfully, starting overhead view animation');
            setLoadingStatus('Ready!');

            // Small delay to show "Ready!" status
            await new Promise(resolve => setTimeout(resolve, 500));

            // Hide loading screen
            setIsLoading(false);

            // Overhead 3D view - looking down from above
            map.flyTo({
                center: location,
                zoom: 19, // High zoom for close view
                pitch: 70, // Overhead angle looking down
                bearing: 0, // North-facing for consistency
                duration: 3000, // 3 second smooth animation
                curve: 1.42, // Natural curve for the flight path
                speed: 0.8, // Slightly slower for cinematic effect
                essential: true
            });

            // Call onMapReady after animation starts
            setTimeout(() => {
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
                pitch: 70, // Start with 3D overhead view
                bearing: 0, // North-facing
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

                            // Preload avatar first, then fly to location with overhead view
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

            {/* 2D/3D Toggle Control */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={toggleView}
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 flex items-center gap-2"
                    disabled={isLoading}
                >
                    {is3DMode ? (
                        <>
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M9 9h6v6H9z"/>
                            </svg>
                            2D
                        </>
                    ) : (
                        <>
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
                                <polyline points="7.5,19.79 7.5,14.6 3,12"/>
                                <polyline points="21,12 16.5,14.6 16.5,19.79"/>
                            </svg>
                            3D
                        </>
                    )}
                </button>
            </div>

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
        </div>
    );
};

export default MapContainer;
