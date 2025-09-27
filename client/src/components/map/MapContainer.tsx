import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AvatarLayer } from '../player/AvatarLayer';
import LoadingSpinner from '../ui/LoadingSpinner';
import CheckpointModal from '../ui/CheckpointModal';

interface Checkpoint {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    createdAt: string;
    // Sponsor fields
    sponsorName?: string;
    description?: string;
    logoUrl?: string;
    reward?: number;
    task?: string;
    participations?: number;
}

interface MapContainerProps {
    onUserLocationChange?: (location: [number, number] | null) => void;
    onMapReady?: (map: any) => void;
    avatarUrl?: string;
    showCheckpoints?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
    onUserLocationChange,
    onMapReady,
    avatarUrl = 'https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb',
    showCheckpoints = false
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const avatarLayerRef = useRef<any>(null);
    const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
    const isMapInitialized = useRef(false);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const checkpointMarkersRef = useRef<mapboxgl.Marker[]>([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
    const [showCheckpointModal, setShowCheckpointModal] = useState(false);

    // Map style options
    const mapStyles = [
        { name: 'Standard', value: 'mapbox://styles/mapbox/standard' },
        { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
        { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
        { name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
        { name: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
        { name: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' }
    ];

    // Load checkpoints from localStorage
    const loadCheckpoints = useCallback(() => {
        if (!showCheckpoints) return;
        
        try {
            const savedCheckpoints = localStorage.getItem('checkpoints');
            if (savedCheckpoints) {
                const parsedCheckpoints: Checkpoint[] = JSON.parse(savedCheckpoints);
                setCheckpoints(parsedCheckpoints);
            }
        } catch (error) {
            console.error('Error loading checkpoints:', error);
        }
    }, [showCheckpoints]);

    // Create checkpoint marker
    const createCheckpointMarker = useCallback((checkpoint: Checkpoint) => {
        if (!mapRef.current) return null;

        // Create marker element with logo and name
        const el = document.createElement('div');
        el.className = 'checkpoint-marker cursor-pointer';
        
        // Different display for sponsor vs user checkpoints
        if (checkpoint.sponsorName) {
            // Sponsor checkpoint with logo and branding
            el.innerHTML = `
                <div class="relative group">
                    <div class="w-12 h-12 bg-black border-2 border-yellow-400 rounded-lg overflow-hidden shadow-lg hover:scale-110 transition-transform">
                        ${checkpoint.logoUrl 
                            ? `<img src="${checkpoint.logoUrl}" alt="${checkpoint.sponsorName}" class="w-full h-full object-cover" />`
                            : `<div class="w-full h-full bg-yellow-400 flex items-center justify-center">
                                 <div class="w-6 h-6 bg-black rounded-full"></div>
                               </div>`
                        }
                    </div>
                    <div class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-yellow-400/30">
                        <div class="font-semibold">${checkpoint.name}</div>
                        <div class="text-yellow-400 text-xs">${checkpoint.sponsorName}</div>
                        <div class="text-gray-300 text-xs">${checkpoint.reward || 100} tokens</div>
                    </div>
                    <div class="absolute inset-0 bg-yellow-400 rounded-lg animate-ping opacity-30"></div>
                </div>
            `;
        } else {
            // Regular user checkpoint
            el.innerHTML = `
                <div class="relative group">
                    <div class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform shadow-lg">
                        <div class="w-4 h-4 bg-yellow-600 rounded-full"></div>
                    </div>
                    <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        ${checkpoint.name}
                    </div>
                    <div class="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                </div>
            `;
        }

        // Add click handler for checkpoint interaction
        el.addEventListener('click', () => {
            setSelectedCheckpoint(checkpoint);
            setShowCheckpointModal(true);
        });

        // Create and return marker
        const marker = new mapboxgl.Marker(el)
            .setLngLat([checkpoint.longitude, checkpoint.latitude])
            .addTo(mapRef.current);

        return marker;
    }, []);

    // Add all checkpoint markers to map
    const addCheckpointMarkers = useCallback(() => {
        if (!mapRef.current || !showCheckpoints) return;

        // Remove existing markers
        checkpointMarkersRef.current.forEach(marker => marker.remove());
        checkpointMarkersRef.current = [];

        // Add new markers
        checkpoints.forEach(checkpoint => {
            const marker = createCheckpointMarker(checkpoint);
            if (marker) {
                checkpointMarkersRef.current.push(marker);
            }
        });
    }, [checkpoints, createCheckpointMarker, showCheckpoints]);

    // Handle checkpoint modal close
    const handleCloseCheckpointModal = () => {
        setShowCheckpointModal(false);
        setSelectedCheckpoint(null);
    };

    // Handle start task from modal
    const handleStartTask = () => {
        // TODO: Implement task start logic
        console.log('Starting task for checkpoint:', selectedCheckpoint?.name);
    };

    // Handle view on map from modal (close modal and center on checkpoint)
    const handleViewOnMap = () => {
        if (selectedCheckpoint && mapRef.current) {
            mapRef.current.flyTo({
                center: [selectedCheckpoint.longitude, selectedCheckpoint.latitude],
                zoom: 18,
                duration: 1000
            });
            handleCloseCheckpointModal();
        }
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
                    mapRef.current!.addLayer(avatarLayerRef.current);
                } catch (error) {
                    console.warn('Avatar layer already exists or error re-adding:', error);
                }
            }
        });
    };

    // Preload avatar and animations at location, then fly to it with overhead view
    const preloadAvatarAndFly = useCallback(async (map: any, location: [number, number]) => {
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
    }, [avatarUrl, onMapReady]);

    // Load checkpoints when component mounts or showCheckpoints changes
    useEffect(() => {
        loadCheckpoints();
    }, [loadCheckpoints]);

    // Add checkpoint markers when checkpoints change or map is ready
    useEffect(() => {
        if (mapRef.current && !isLoading) {
            addCheckpointMarkers();
        }
    }, [checkpoints, isLoading, addCheckpointMarkers]);

    // Listen for localStorage changes to update checkpoints in real-time
    useEffect(() => {
        if (!showCheckpoints) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'checkpoints') {
                loadCheckpoints();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadCheckpoints, showCheckpoints]);

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
            // Clean up checkpoint markers
            checkpointMarkersRef.current.forEach(marker => marker.remove());
            checkpointMarkersRef.current = [];

            if (mapRef.current) {
                mapRef.current.remove();
            }

            mapRef.current = null;
            avatarLayerRef.current = null;
            geolocateControlRef.current = null;
            isMapInitialized.current = false;
        };
    }, [avatarUrl, mapStyle, onUserLocationChange, preloadAvatarAndFly]);

    return (
        <div className="relative w-full h-full">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map Style Selector */}
            <div className="absolute bottom-4 right-4 z-10">
                <select
                    value={mapStyle}
                    onChange={(e) => changeMapStyle(e.target.value)}
                    className="bg-white/95 border border-black/10 rounded-md px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer backdrop-blur-sm shadow-sm focus:outline-none focus:border-blue-500 focus:shadow-blue-500/20 focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    aria-label="Select map style"
                    title="Choose map style"
                >
                    {mapStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                            {style.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status indicator - Tailwind Classes */}
            {userLocation && (
                <div className="absolute bottom-15 left-5 z-[1000] bg-black/80 text-white px-3 py-2 rounded-md text-xs font-mono backdrop-blur-sm">
                    📍 {userLocation[1].toFixed(6)}, {userLocation[0].toFixed(6)}
                </div>
            )}

            {/* Loading overlay - Tailwind Classes */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[2000] backdrop-blur-sm">
                    <LoadingSpinner />
                    <p className="text-white mt-4 text-sm font-medium">{loadingStatus}</p>
                </div>
            )}

            {/* Custom styles for checkpoint markers */}
            <style>{`
                .checkpoint-marker {
                    cursor: pointer;
                }
                
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .animate-ping {
                    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>

            {/* Checkpoint Detail Modal */}
            <CheckpointModal
                isOpen={showCheckpointModal}
                checkpoint={selectedCheckpoint}
                onClose={handleCloseCheckpointModal}
                onStartTask={handleStartTask}
                onViewOnMap={handleViewOnMap}
            />
        </div>
    );
};

export default MapContainer;
