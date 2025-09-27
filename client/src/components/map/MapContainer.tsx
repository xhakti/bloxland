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
    const geolocateControlRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [is3DMode, setIs3DMode] = useState(true);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
    const isMapInitialized = useRef(false);

    // Map style options
    const mapStyles = [
        { name: 'Standard', value: 'mapbox://styles/mapbox/standard' },
        { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
        { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
        { name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
        { name: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
        { name: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' }
    ];

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

    // Locate user function
    const locateUser = () => {
        if (!mapRef.current || !geolocateControlRef.current) return;

        // Trigger the geolocate control
        geolocateControlRef.current.trigger();
    };

    // Toggle user tracking
    const toggleUserTracking = () => {
        if (!mapRef.current || !geolocateControlRef.current) return;

        if (isFollowingUser) {
            // Stop tracking
            geolocateControlRef.current._updateCamera = false;
            setIsFollowingUser(false);
        } else {
            // Start tracking
            geolocateControlRef.current._updateCamera = true;
            locateUser();
            setIsFollowingUser(true);
        }
    };

    // Reset map to initial view
    const resetMapView = () => {
        if (!mapRef.current || !userLocation) return;

        mapRef.current.flyTo({
            center: userLocation,
            zoom: 19,
            pitch: is3DMode ? 70 : 0,
            bearing: 0,
            duration: 2000,
            essential: true
        });
    };

    // Change map style
    const changeMapStyle = (styleUrl: string) => {
        if (!mapRef.current) return;

        mapRef.current.setStyle(styleUrl);
        setMapStyle(styleUrl);

        // Re-add avatar layer after style change
        mapRef.current.once('styledata', () => {
            if (avatarLayerRef.current && userLocation) {
                try {
                    mapRef.current.addLayer(avatarLayerRef.current);
                } catch (error) {
                    console.warn('Avatar layer already exists or error re-adding:', error);
                }
            }
        });
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
                style: mapStyle,
                center: [0, 0],
                zoom: 3,
                pitch: 70, // Start with 3D overhead view
                bearing: 0, // North-facing
                maxPitch: 85,
                antialias: true
            });

            mapRef.current = map;
            isMapInitialized.current = true;

            // Add navigation controls
            const navigationControl = new mapboxgl.NavigationControl({
                showCompass: true,
                showZoom: true,
                visualizePitch: true
            });
            map.addControl(navigationControl, 'top-right');

            // Add geolocate control
            const geolocateControl = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                    timeout: 10000
                },
                trackUserLocation: true,
                showUserHeading: true,
                showAccuracyCircle: true
            });

            geolocateControlRef.current = geolocateControl;
            map.addControl(geolocateControl, 'top-right');

            // Add fullscreen control
            const fullscreenControl = new mapboxgl.FullscreenControl();
            map.addControl(fullscreenControl, 'top-right');

            // Add scale control
            const scaleControl = new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'metric'
            });
            map.addControl(scaleControl, 'bottom-left');

            // Listen to geolocate events
            geolocateControl.on('geolocate', (e: any) => {
                const location: [number, number] = [e.coords.longitude, e.coords.latitude];
                console.log('Geolocate event:', location);
                setUserLocation(location);
                onUserLocationChange?.(location);
                setIsFollowingUser(true);
            });

            geolocateControl.on('trackuserlocationstart', () => {
                console.log('Started tracking user location');
                setIsFollowingUser(true);
            });

            geolocateControl.on('trackuserlocationend', () => {
                console.log('Stopped tracking user location');
                setIsFollowingUser(false);
            });

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
            geolocateControlRef.current = null;
            isMapInitialized.current = false;
        };
    }, [avatarUrl, mapStyle]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapContainerRef}
                className="w-full h-full"
                style={{ minHeight: '400px' }}
            />

            {/* Custom Controls Panel */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {/* 2D/3D Toggle Control */}
                <button
                    onClick={toggleView}
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 flex items-center gap-2"
                    disabled={isLoading}
                    title={`Switch to ${is3DMode ? '2D' : '3D'} view`}
                >
                    {is3DMode ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M9 9h6v6H9z"/>
                            </svg>
                            2D
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
                                <polyline points="7.5,19.79 7.5,14.6 3,12"/>
                                <polyline points="21,12 16.5,14.6 16.5,19.79"/>
                            </svg>
                            3D
                        </>
                    )}
                </button>

                {/* Quick locate user button */}
                <button
                    onClick={locateUser}
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 flex items-center gap-2"
                    disabled={isLoading}
                    title="Locate me"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                    </svg>
                    Locate
                </button>

                {/* User tracking toggle */}
                <button
                    onClick={toggleUserTracking}
                    className={`border border-gray-300 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors duration-200 flex items-center gap-2 ${
                        isFollowingUser 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                    title={isFollowingUser ? "Stop following" : "Follow location"}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {isFollowingUser ? 'Following' : 'Follow'}
                </button>

                {/* Reset view button */}
                <button
                    onClick={resetMapView}
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 flex items-center gap-2"
                    disabled={isLoading || !userLocation}
                    title="Reset view"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                    </svg>
                    Reset
                </button>
            </div>

            {/* Map Style Selector */}
            <div className="absolute bottom-4 right-4 z-10">
                <select
                    value={mapStyle}
                    onChange={(e) => changeMapStyle(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                >
                    {mapStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                            {style.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status indicator */}
            {userLocation && (
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-black/70 text-white px-3 py-2 rounded-md text-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isFollowingUser ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <span>
                                {userLocation[1].toFixed(6)}, {userLocation[0].toFixed(6)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

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
