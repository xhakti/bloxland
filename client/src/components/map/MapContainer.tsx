import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AvatarLayer } from '../player/AvatarLayer';
import LoadingSpinner from '../ui/LoadingSpinner';
import CheckpointModal from '../ui/CheckpointModal';
import LocationIcon from '../../assets/location.svg';

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
    const avatarLayerRef = useRef<AvatarLayer | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [is3D, setIs3D] = useState(true);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const isMapInitialized = useRef(false);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const checkpointMarkersRef = useRef<mapboxgl.Marker[]>([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
    const [showCheckpointModal, setShowCheckpointModal] = useState(false);
    // Track when map style fully loaded so lighting presets can be applied
    const [mapReady, setMapReady] = useState(false);
    // Cinematic & follow state
    const hasRunCinematicRef = useRef<boolean>(false);
    const isRunningCinematicRef = useRef<boolean>(false);
    const userInteractedRef = useRef<boolean>(false);
    const followAnimationFrameRef = useRef<number | null>(null);
    const lastFollowTargetRef = useRef<[number, number] | null>(null);
    const cancelCinematicRef = useRef<(() => void) | null>(null);
    const lastMovementLocationRef = useRef<[number, number] | null>(null);
    const walkingStopTimeoutRef = useRef<number | null>(null);

    // Removed map style selection; using a single base style now.

    // Custom recenter function
    const handleRecenter = useCallback(() => {
        // Re-enable follow mode on recenter
        setIsFollowingUser(true);
        if (!mapRef.current || !userLocation) {
            console.warn('Cannot recenter: map or user location not available');

            // Try to get current location if we don't have it
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const location: [number, number] = [longitude, latitude];
                        setUserLocation(location);
                        onUserLocationChange?.(location);

                        // Update avatar position if it exists
                        if (avatarLayerRef.current) {
                            avatarLayerRef.current.updatePosition(location);
                        }

                        // Fly to the location
                        mapRef.current?.flyTo({
                            center: location,
                            zoom: 19,
                            pitch: is3D ? 70 : 0,
                            bearing: 0,
                            duration: 2000,
                            curve: 1.42,
                            speed: 1.0,
                            essential: true
                        });
                    },
                    (error) => {
                        console.error('Failed to get current location for recenter:', error);
                        alert('Unable to get your current location. Please ensure location permissions are enabled.');
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            }
            return;
        }

        console.log('Recentering to current location:', userLocation);

        mapRef.current.flyTo({
            center: userLocation,
            zoom: 19,
            pitch: is3D ? 70 : 0,
            bearing: 0,
            duration: 2000,
            curve: 1.42,
            speed: 1.0,
            essential: true
        });
    }, [userLocation, onUserLocationChange, is3D]);

    // Toggle 3D/2D view
    const toggle3D = useCallback(() => {
        if (!mapRef.current) return;

        const newIs3D = !is3D;
        setIs3D(newIs3D);

        mapRef.current.easeTo({
            pitch: newIs3D ? 70 : 0,
            duration: 1000
        });

        console.log(`Switched to ${newIs3D ? '3D' : '2D'} view`);
    }, [is3D]);

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

        const el = document.createElement('div');
        el.className = 'checkpoint-marker cursor-pointer';

        if (checkpoint.sponsorName) {
            el.innerHTML = `
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
          ${checkpoint.logoUrl
                    ? `<img src="${checkpoint.logoUrl}" alt="${checkpoint.sponsorName}" class="w-8 h-8 rounded-full object-cover">`
                    : `<span class="text-white font-bold text-xs">S</span>`
                }
        </div>
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          ${checkpoint.name}<br>
          ${checkpoint.sponsorName}<br>
          ${checkpoint.reward || 100} tokens
        </div>
      `;
        } else {
            el.innerHTML = `
        <div class="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
          <span class="text-white font-bold">✓</span>
        </div>
        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          ${checkpoint.name}
        </div>
      `;
        }

        el.addEventListener('click', () => {
            setSelectedCheckpoint(checkpoint);
            setShowCheckpointModal(true);
        });

        const marker = new mapboxgl.Marker(el)
            .setLngLat([checkpoint.longitude, checkpoint.latitude])
            .addTo(mapRef.current);

        return marker;
    }, []);

    // Add all checkpoint markers to map
    const addCheckpointMarkers = useCallback(() => {
        if (!mapRef.current || !showCheckpoints) return;

        checkpointMarkersRef.current.forEach(marker => marker.remove());
        checkpointMarkersRef.current = [];

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

    // Removed changeMapStyle logic.

    // Preload avatar and animations
    const preloadAvatarAndFly = useCallback(async (map: mapboxgl.Map, location: [number, number]) => {
        try {
            console.log('Preloading avatar at location:', location);
            setLoadingStatus('Loading avatar...');

            const avatarLayer = new AvatarLayer({
                id: 'user-avatar',
                avatarUrl: avatarUrl,
                position: location,
                scale: 1,
            });

            avatarLayerRef.current = avatarLayer;
            map.addLayer(avatarLayer);

            setLoadingStatus('Loading animations...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('Avatar preloaded successfully, starting view animation');
            setLoadingStatus('Ready!');
            await new Promise(resolve => setTimeout(resolve, 500));

            setIsLoading(false);

            // Decide whether to run cinematic
            const cinematicAlready = sessionStorage.getItem('bloxland_cinematic_done') === 'true';
            if (!cinematicAlready) {
                runCinematicIntro(map, location);
            } else {
                map.flyTo({
                    center: location,
                    zoom: 19,
                    pitch: 70,
                    bearing: 0,
                    duration: 2500,
                    curve: 1.42,
                    speed: 0.8,
                    essential: true
                });
            }

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

    // Cinematic intro sequence
    const runCinematicIntro = (map: mapboxgl.Map, target: [number, number]) => {
        if (isRunningCinematicRef.current) return;
        isRunningCinematicRef.current = true;
        hasRunCinematicRef.current = true;
        sessionStorage.setItem('bloxland_cinematic_done', 'true');

        const steps: Array<{ center: [number, number]; zoom: number; pitch: number; bearing: number; duration: number; easing?: (t: number) => number; }> = [
            { center: [target[0], target[1]], zoom: 9, pitch: 0, bearing: 0, duration: 1000 },
            { center: [target[0], target[1]], zoom: 12, pitch: 30, bearing: 45, duration: 1800 },
            { center: [target[0], target[1]], zoom: 15.5, pitch: 55, bearing: 90, duration: 2200 },
            { center: target, zoom: 19, pitch: 70, bearing: 0, duration: 2600 }
        ];

        let cancelled = false;
        cancelCinematicRef.current = () => { cancelled = true; };

        const runStep = (index: number) => {
            if (cancelled || !mapRef.current) {
                isRunningCinematicRef.current = false;
                return;
            }
            if (index >= steps.length) {
                isRunningCinematicRef.current = false;
                return;
            }
            const s = steps[index];
            mapRef.current!.easeTo({
                center: s.center,
                zoom: s.zoom,
                pitch: s.pitch,
                bearing: s.bearing,
                duration: s.duration,
                easing: (t) => t * (2 - t) // easeOutQuad
            });
            setTimeout(() => runStep(index + 1), s.duration - 50);
        };

        runStep(0);
    };

    // Interaction guard to cancel cinematic and disable follow until recenter
    useEffect(() => {
        const cancelOnInteract = () => {
            if (userInteractedRef.current) return;
            userInteractedRef.current = true;
            if (isRunningCinematicRef.current && cancelCinematicRef.current) {
                cancelCinematicRef.current();
                isRunningCinematicRef.current = false;
            }
            // Temporarily disable follow; user can re-enable via recenter
            setIsFollowingUser(false);
        };
        const events: Array<keyof mapboxgl.MapEvents> = ['dragstart', 'zoomstart', 'rotatestart', 'pitchstart', 'mousedown', 'touchstart', 'wheel'];
        events.forEach(ev => mapRef.current?.on(ev as any, cancelOnInteract));
        return () => { events.forEach(ev => mapRef.current?.off(ev as any, cancelOnInteract)); };
    }, []);

    // Smooth follow effect (runs after initial cinematic) using requestAnimationFrame interpolation
    useEffect(() => {
        if (!mapRef.current || !userLocation) return;
        if (!isFollowingUser) return;
        if (isRunningCinematicRef.current) return;

        const map = mapRef.current;
        const currentCenter = map.getCenter();
        const targetLngLat = userLocation;
        const distance = Math.hypot(currentCenter.lng - targetLngLat[0], currentCenter.lat - targetLngLat[1]);
        // Ignore tiny jitter
        if (distance < 0.00005) return;

        const start = performance.now();
        const duration = 1200; // ms
        const startLng = currentCenter.lng;
        const startLat = currentCenter.lat;
        const endLng = targetLngLat[0];
        const endLat = targetLngLat[1];

        if (followAnimationFrameRef.current) cancelAnimationFrame(followAnimationFrameRef.current);

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (ts: number) => {
            const t = Math.min(1, (ts - start) / duration);
            const k = easeOutCubic(t);
            const lng = startLng + (endLng - startLng) * k;
            const lat = startLat + (endLat - startLat) * k;
            map.jumpTo({ center: [lng, lat] });
            if (t < 1 && isFollowingUser && !isRunningCinematicRef.current) {
                followAnimationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        followAnimationFrameRef.current = requestAnimationFrame(animate);
        lastFollowTargetRef.current = userLocation;

        return () => {
            if (followAnimationFrameRef.current) cancelAnimationFrame(followAnimationFrameRef.current);
        };
    }, [userLocation, isFollowingUser]);

    // Load checkpoints when component mounts
    useEffect(() => {
        loadCheckpoints();
    }, [loadCheckpoints]);

    // Add checkpoint markers when ready
    useEffect(() => {
        if (mapRef.current && !isLoading) {
            addCheckpointMarkers();
        }
    }, [checkpoints, isLoading, addCheckpointMarkers]);

    // Listen for lighting preset change events dispatched from UI (e.g., sidebar)
    // Uses Mapbox Standard style built-in light presets (dawn, day, dusk, night)
    // We map user friendly names: noon -> day, evening -> dusk.
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;

        const map = mapRef.current;
        // Start with night as default (user requested) until user picks or auto selected
        const currentPresetRef = { value: 'night' } as { value: string };

        // Fallback manual implementation (kept from previous version) in case setConfigProperty fails
        const fallbackApply = (name: string) => {
            try {
                if (!map.isStyleLoaded()) return;
                const setLight = (opts: any) => { try { (map as any).setLight(opts); } catch (e) { /* ignore light error */ } };
                const setFog = (opts: any) => { try { (map as any).setFog(opts); } catch (e) { /* ignore fog error */ } };
                const ensureSky = () => { try { if (!map.getLayer('bloxland-sky')) { map.addLayer({ id: 'bloxland-sky', type: 'sky', paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun-intensity': 12 } }); } } catch (e) { /* ignore sky error */ } };
                ensureSky();
                switch (name) {
                    case 'dusk': // sunset equivalent
                        setLight({ anchor: 'viewport', position: [1.2, 80, 20], color: '#ffb37a', intensity: 0.55 });
                        setFog({ range: [0.5, 14], color: '#f7c9a4', 'horizon-blend': 0.32, 'high-color': '#ff9966', 'space-color': '#2a1020', 'star-intensity': 0 });
                        break;
                    case 'night':
                        setLight({ anchor: 'viewport', position: [1.4, 130, -15], color: '#99ccff', intensity: 0.28 });
                        setFog({ range: [0.5, 11], color: '#07101b', 'horizon-blend': 0.18, 'high-color': '#143354', 'space-color': '#000008', 'star-intensity': 0.65 });
                        break;
                    case 'day':
                    case 'dawn':
                    default:
                        setLight({ anchor: 'viewport', position: [1.15, 210, 30], color: '#ffffff', intensity: 0.85 });
                        setFog({ range: [0.5, 26], color: '#e3f6ff', 'horizon-blend': 0.22, 'high-color': '#8ac4ff', 'space-color': '#8ac4ff', 'star-intensity': 0 });
                        break;
                }
                console.log('[Lighting][Fallback] Applied manual preset:', name);
            } catch (err) {
                console.warn('[Lighting] Fallback apply failed', err);
            }
        };

        const applyBuiltIn = (preset: string, attempt = 0) => {
            if (!map.isStyleLoaded()) {
                if (attempt < 10) return setTimeout(() => applyBuiltIn(preset, attempt + 1), 150);
                console.warn('[Lighting] Style never became ready for preset:', preset);
                return;
            }
            // Map user friendly alias to Mapbox preset
            const mapping: Record<string, string> = {
                dawn: 'dawn',
                day: 'day',
                noon: 'day',
                dusk: 'dusk',
                evening: 'dusk',
                night: 'night'
            };
            const target = mapping[preset] || 'day';
            try {
                // Standard style config property
                (map as any).setConfigProperty?.('basemap', 'lightPreset', target);
                console.log('[Lighting] Applied built-in preset:', preset, '->', target);
            } catch (err) {
                console.warn('[Lighting] Built-in preset apply failed, using fallback. Err:', err);
                fallbackApply(target);
            }
        };

        const chooseAutoPreset = () => {
            if (currentPresetRef.value !== 'auto') return;
            const hour = new Date().getHours();
            let preset: string;
            if (hour >= 21 || hour < 5) preset = 'night';
            else if (hour >= 18 && hour < 21) preset = 'evening'; // dusk
            else if (hour >= 6 && hour < 9) preset = 'dawn';
            else preset = 'noon'; // maps to day
            applyBuiltIn(preset);
        };

        // Apply default night immediately
        applyBuiltIn('night');
        // If user switches to auto later, auto will take over. We don't auto-switch on load to keep night default.
        const autoInterval = window.setInterval(chooseAutoPreset, 5 * 60 * 1000);

        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ preset: string }>;
            const preset = custom.detail?.preset;
            if (!preset) return;
            currentPresetRef.value = preset === 'auto' ? 'auto' : preset;
            if (preset === 'auto') chooseAutoPreset(); else applyBuiltIn(preset);
        };
        window.addEventListener('lightPresetChange', handler as EventListener);

        const styleListener = () => {
            if (currentPresetRef.value === 'auto') chooseAutoPreset(); else applyBuiltIn(currentPresetRef.value);
        };
        map.on('styledata', styleListener);

        return () => {
            window.removeEventListener('lightPresetChange', handler as EventListener);
            window.clearInterval(autoInterval);
            map.off('styledata', styleListener);
        };
    }, [mapReady]);

    // Listen for localStorage changes
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

    // Main map initialization
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
            // Create map WITHOUT any default controls
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/standard',
                center: [0, 0],
                zoom: 3,
                pitch: 70,
                bearing: 0,
                maxPitch: 85,
                antialias: true,
                // Don't add any default controls
                attributionControl: false
            });

            mapRef.current = map;
            isMapInitialized.current = true;

            // Add ONLY the scale control at bottom-left (minimal and useful)
            const scaleControl = new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'metric'
            });
            map.addControl(scaleControl, 'bottom-left');

            // Watch for user location changes through geolocation API
            const watchLocation = () => {
                if (navigator.geolocation) {
                    const watchId = navigator.geolocation.watchPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const location: [number, number] = [longitude, latitude];

                            // Reduced threshold for more frequent updates (~11m at equator -> changed to ~2m):
                            const lngDelta = Math.abs((userLocation?.[0] ?? longitude) - longitude);
                            const latDelta = Math.abs((userLocation?.[1] ?? latitude) - latitude);
                            const THRESHOLD = 0.00002; // ~2m
                            if (!userLocation || lngDelta > THRESHOLD || latDelta > THRESHOLD) {
                                console.log('Location updated to:', location);
                                setUserLocation(location);
                                onUserLocationChange?.(location);
                                setIsFollowingUser(true);

                                // Movement-based walking animation control
                                if (avatarLayerRef.current) {
                                    const prev = lastMovementLocationRef.current;
                                    if (prev) {
                                        const moveLngDelta = Math.abs(prev[0] - location[0]);
                                        const moveLatDelta = Math.abs(prev[1] - location[1]);
                                        const MOVEMENT_TRIGGER = 0.00001; // ~1m
                                        if (moveLngDelta > MOVEMENT_TRIGGER || moveLatDelta > MOVEMENT_TRIGGER) {
                                            avatarLayerRef.current.startWalking?.();
                                            if (walkingStopTimeoutRef.current) {
                                                window.clearTimeout(walkingStopTimeoutRef.current);
                                            }
                                            walkingStopTimeoutRef.current = window.setTimeout(() => {
                                                avatarLayerRef.current?.stopWalking?.();
                                            }, 3000); // stop walking after 3s of no further movement
                                        }
                                    } else {
                                        // First position sets baseline
                                        avatarLayerRef.current.startWalking?.();
                                        walkingStopTimeoutRef.current = window.setTimeout(() => {
                                            avatarLayerRef.current?.stopWalking?.();
                                        }, 3000);
                                    }
                                    lastMovementLocationRef.current = location;
                                }

                                // Update avatar position if it exists
                                if (avatarLayerRef.current) {
                                    avatarLayerRef.current.updatePosition(location);
                                }
                            }
                        },
                        (error) => {
                            console.warn('Location watch error:', error);
                            setIsFollowingUser(false);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 8000,
                            maximumAge: 5000 // lower cache for fresher updates
                        }
                    );

                    // Cleanup function will clear the watch
                    return () => navigator.geolocation.clearWatch(watchId);
                }
            };

            map.on('load', () => {
                console.log('Map loaded, getting initial location...');
                setLoadingStatus('Getting location...');
                setMapReady(true); // enable lighting effect

                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const location: [number, number] = [longitude, latitude];
                            console.log('Initial location obtained:', location);
                            setUserLocation(location);
                            onUserLocationChange?.(location);

                            preloadAvatarAndFly(map, location);

                            // Start watching for location changes
                            watchLocation();
                        },
                        (error) => {
                            console.warn('Geolocation error:', error);
                            const fallbackLocation: [number, number] = [28.556308, 77.044288];
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
            console.log('Cleaning up map...');
            if (walkingStopTimeoutRef.current) {
                window.clearTimeout(walkingStopTimeoutRef.current);
            }

            if (avatarLayerRef.current && mapRef.current) {
                try {
                    mapRef.current.removeLayer(avatarLayerRef.current.id);
                } catch (error) {
                    console.warn('Error during cleanup:', error);
                }
            }

            checkpointMarkersRef.current.forEach(marker => marker.remove());
            checkpointMarkersRef.current = [];

            if (mapRef.current) {
                mapRef.current.remove();
            }

            mapRef.current = null;
            avatarLayerRef.current = null;
            isMapInitialized.current = false;
        };
        // userLocation intentionally excluded to avoid re-initializing map and breaking fly-in animation
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarUrl, onUserLocationChange, preloadAvatarAndFly]);

    return (
        <div className="relative w-full h-full">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map style dropdown removed */}

            {/* Custom Control Buttons - Top Right */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {/* Recenter Button */}
                <button
                    onClick={handleRecenter}
                    disabled={isLoading}
                    className="bg-white/95 hover:bg-white border border-black/10 rounded-lg p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Recenter to current location"
                    aria-label="Recenter map to current location"
                >
                    <img src={LocationIcon} alt="Recenter" className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* 3D/2D Toggle Button */}
                <button
                    onClick={toggle3D}
                    disabled={isLoading}
                    className="bg-white/95 hover:bg-white border border-black/10 rounded-lg p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                    title={`Switch to ${is3D ? '2D' : '3D'} view`}
                    aria-label={`Switch to ${is3D ? '2D' : '3D'} view`}
                >
                    {is3D ? (
                        // 2D Icon (when currently in 3D, clicking switches to 2D)
                        <p className='text-gray-700 group-hover:text-blue-600 transition-colors'>2D</p>
                    ) : (
                        // 3D Icon (when currently in 2D, clicking switches to 3D)
                        <p className='text-gray-700 group-hover:text-blue-600 transition-colors'>3D</p>
                    )}
                </button>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white/95 rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl border border-black/10">
                        <LoadingSpinner />
                        <div className="text-gray-700 font-medium text-lg">
                            {loadingStatus}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
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
