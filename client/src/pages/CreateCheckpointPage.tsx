import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Save, ArrowLeft, Upload, Image } from "lucide-react";
import mapboxgl from "mapbox-gl";
import { useAuthStore } from "../stores/authStore";
import LocationConfirmModal from "../components/ui/LocationConfirmModal";

// Mapbox access token - you'll need to set this
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "your-mapbox-token";

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

const CreateCheckpointPage: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuthStore();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<
    [number, number] | null
  >(null);
  const [checkpointName, setCheckpointName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [tempLocation, setTempLocation] = useState<[number, number] | null>(null);

  // Sponsor-specific fields
  const [sponsorName, setSponsorName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 15,
      attributionControl: false,
      pitch: 70, // 3D vertical view (same as MapContainer)
      bearing: 0, // North-facing
      maxPitch: 85,
      antialias: true,
    });

    // Add navigation controls (same as MapContainer)
    const navigationControl = new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    });
    map.current.addControl(navigationControl, "top-right");

    // Add geolocate control (same as MapContainer)
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
    });
    map.current.addControl(geolocateControl, "top-right");

    // Add fullscreen control
    const fullscreenControl = new mapboxgl.FullscreenControl();
    map.current.addControl(fullscreenControl, "top-right");

    // Add scale control
    const scaleControl = new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric",
    });
    map.current.addControl(scaleControl, "bottom-left");

    // Add click handler for map
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      
      if (userType === 'sponsor') {
        // For sponsors, show confirmation modal first
        setTempLocation([lng, lat]);
        setShowLocationConfirm(true);
      } else {
        // For users, directly set location
        setSelectedLocation([lng, lat]);
        addMarkerToMap([lng, lat]);
      }
    });

    // Listen to geolocate events (same as MapContainer)
    geolocateControl.on("geolocate", (e: any) => {
      const location: [number, number] = [
        e.coords.longitude,
        e.coords.latitude,
      ];
      console.log("Geolocate event in create page:", location);
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          // Fly to user location with 3D overhead view
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 18,
            pitch: 70, // Maintain 3D vertical view
            bearing: 0,
            duration: 2000,
            essential: true
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add marker to map
  const addMarkerToMap = (location: [number, number]) => {
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create pulsing yellow marker
    const el = document.createElement("div");
    el.className = "checkpoint-marker";
    el.innerHTML = `
      <div class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center relative animate-pulse">
        <div class="w-4 h-4 bg-yellow-600 rounded-full"></div>
        <div class="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
      </div>
    `;

    // Add new marker
    marker.current = new mapboxgl.Marker(el)
      .setLngLat(location)
      .addTo(map.current!);
  };

  // Handle location confirmation
  const handleLocationConfirm = () => {
    if (tempLocation) {
      setSelectedLocation(tempLocation);
      addMarkerToMap(tempLocation);
      setTempLocation(null);
    }
    setShowLocationConfirm(false);
  };

  const handleLocationCancel = () => {
    setTempLocation(null);
    setShowLocationConfirm(false);
  };

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCheckpoint = () => {
    if (!selectedLocation || !checkpointName.trim()) {
      alert("Please select a location and enter a checkpoint name");
      return;
    }

    // Additional validation for sponsors
    if (userType === 'sponsor') {
      if (!sponsorName.trim() || !description.trim() || !logoFile) {
        alert("Please fill in all sponsor fields including logo upload");
        return;
      }
    }

    setIsLoading(true);

    // Convert logo to base64 for local storage (temporary solution)
    const logoUrl = logoPreview || undefined;

    const checkpoint: Checkpoint = {
      id: Date.now().toString(),
      latitude: selectedLocation[1],
      longitude: selectedLocation[0],
      name: checkpointName.trim(),
      createdAt: new Date().toISOString(),
      // Add sponsor fields if user is sponsor
      ...(userType === 'sponsor' && {
        sponsorName: sponsorName.trim(),
        description: description.trim(),
        logoUrl: logoUrl,
        reward: 100, // Temporary fixed reward
        task: "Play Stone Paper Scissors", // Temporary fixed task
        participations: 0,
      }),
    };

    // Get existing checkpoints from localStorage
    const existingCheckpoints = JSON.parse(
      localStorage.getItem("checkpoints") || "[]"
    );

    // Add new checkpoint
    const updatedCheckpoints = [...existingCheckpoints, checkpoint];

    // Save to localStorage
    localStorage.setItem("checkpoints", JSON.stringify(updatedCheckpoints));

    setTimeout(() => {
      setIsLoading(false);
      alert("Checkpoint saved successfully!");
      navigate("/game"); // Navigate back to game page
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col space-y-2">

            <div className="flex  r space-x-2">
              <MapPin className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-bold text-xl">
                Create Checkpoint
              </span>
            </div>
            <p className="text-white font-medium">Tap anywhere on the map to create a checkpoint</p>
            </div>
    
          </div>

          <button
            onClick={saveCheckpoint}
            disabled={!selectedLocation || !checkpointName.trim() || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Saving..." : "Save Checkpoint"}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Checkpoint Form */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-50 max-h-[60vh] overflow-y-auto">
          <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Checkpoint Name
                </label>
                <input
                  type="text"
                  value={checkpointName}
                  onChange={(e) => setCheckpointName(e.target.value)}
                  placeholder="Enter checkpoint name..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  maxLength={50}
                />
              </div>

              {/* Sponsor-specific fields */}
              {userType === 'sponsor' && (
                <>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Sponsor Name
                    </label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="Enter your company/brand name..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your checkpoint and what users will experience..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Logo Upload
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">Choose Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {logoPreview && (
                        <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Reward
                      </label>
                      <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
                        <span className="text-yellow-400 font-medium">100 Tokens</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Task
                      </label>
                      <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
                        <span className="text-white text-sm">Stone Paper Scissors</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Location Info */}
              <div className="pt-2 border-t border-white/20">
                <p className="text-gray-400 text-xs">
                  📍 Location: {selectedLocation[1].toFixed(6)}, {selectedLocation[0].toFixed(6)}
                </p>
                {userType === 'sponsor' && (
                  <p className="text-yellow-400 text-xs mt-1">
                    💰 Users will earn 100 tokens for completing your checkpoint
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for marker animation */}
      <style>{`
        .checkpoint-marker {
          cursor: pointer;
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Location Confirmation Modal */}
      <LocationConfirmModal
        isOpen={showLocationConfirm}
        location={tempLocation}
        onConfirm={handleLocationConfirm}
        onCancel={handleLocationCancel}
      />
    </div>
  );
};

export default CreateCheckpointPage;
