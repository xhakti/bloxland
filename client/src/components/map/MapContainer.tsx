/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MapContainerProps {
    onUserLocationChange?: (location: [number, number] | null) => void;
    onMapReady?: (map: any) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
    onUserLocationChange,
    onMapReady
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const isMapInitialized = useRef(false);

    useEffect(() => {
        // Don't initialize if already done or container not ready
        if (!mapContainerRef.current || isMapInitialized.current) return;

        console.log('Initializing Mapbox...');

        // Set access token
        const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('Mapbox access token is missing! Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file');
            setIsLoading(false);
            return;
        }

        mapboxgl.accessToken = accessToken;

        try {
            // Create the map
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/standard', // Using a standard style that should work
                center: [0, 0],
                zoom: 3,
                pitch: 60,
                bearing: -20,
                maxPitch: 85,
                antialias: true
            });

            mapRef.current = map;
            isMapInitialized.current = true;

            // Handle map load
            map.on('load', () => {
                console.log('Map loaded successfully');

                // Get user location
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const location: [number, number] = [longitude, latitude];

                            console.log('User location:', location);
                            setUserLocation(location);
                            onUserLocationChange?.(location);

                            // Fly to user location
                            map.flyTo({
                                center: location,
                                zoom: 15,
                                pitch: 60,
                                bearing: 0,
                                duration: 2000
                            });

                            setIsLoading(false);
                            onMapReady?.(map);
                        },
                        (error) => {
                            console.warn('Geolocation error:', error);
                            // Use fallback location (Mumbai)
                            const fallbackLocation: [number, number] = [72.900719, 19.072816];
                            setUserLocation(fallbackLocation);
                            onUserLocationChange?.(fallbackLocation);

                            map.flyTo({
                                center: fallbackLocation,
                                zoom: 15,
                                pitch: 60,
                                bearing: 0,
                                duration: 2000
                            });

                            setIsLoading(false);
                            onMapReady?.(map);
                        }
                    );
                } else {
                    console.warn('Geolocation not available');
                    setIsLoading(false);
                    onMapReady?.(map);
                }
            });

            // Handle map errors
            map.on('error', (e) => {
                console.error('Map error:', e);
                setIsLoading(false);
            });

        } catch (error) {
            console.error('Error creating map:', error);
            setIsLoading(false);
        }

        // Cleanup function
        return () => {
            console.log('Cleaning up map...');
            if (mapRef.current) {
                mapRef.current.remove();
            }
            mapRef.current = null;
            isMapInitialized.current = false;
        };
    }, []); // Empty dependency array - only run once

    return (
        <div className="relative w-full h-full">
            {/* Map container - must be empty initially */}
            <div
                ref={mapContainerRef}
                className="w-full h-full"
                style={{ minHeight: '400px' }} // Ensure minimum height
            />

            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <LoadingSpinner />
                </div>
            )}

            {/* Debug info */}
            {import.meta.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-10">
                    <div>Token: {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}</div>
                    <div>Map: {mapRef.current ? '✅ Created' : '❌ Not created'}</div>
                    <div>Loading: {isLoading ? '⏳ Loading' : '✅ Ready'}</div>
                    {userLocation && (
                        <div>Location: {userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MapContainer;
