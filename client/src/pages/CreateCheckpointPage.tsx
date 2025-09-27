import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Save, ArrowLeft } from "lucide-react";
import mapboxgl from "mapbox-gl";

// Mapbox access token - you'll need to set this
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "your-mapbox-token";

interface Checkpoint {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  createdAt: string;
}

const CreateCheckpointPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<
    [number, number] | null
  >(null);
  const [checkpointName, setCheckpointName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 10,
      attributionControl: false,
      pitch: 0, // Start with flat view for checkpoint creation
      bearing: 0,
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
      setSelectedLocation([lng, lat]);

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
        .setLngLat([lng, lat])
        .addTo(map.current!);
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
          map.current?.setCenter([longitude, latitude]);
          map.current?.setZoom(14);
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

  const saveCheckpoint = () => {
    if (!selectedLocation || !checkpointName.trim()) {
      alert("Please select a location and enter a checkpoint name");
      return;
    }

    setIsLoading(true);

    const checkpoint: Checkpoint = {
      id: Date.now().toString(),
      latitude: selectedLocation[1],
      longitude: selectedLocation[0],
      name: checkpointName.trim(),
      createdAt: new Date().toISOString(),
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

      {/* Checkpoint Name Input */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4">
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
            <p className="text-gray-400 text-xs mt-1">
              Location: {selectedLocation[1].toFixed(6)},{" "}
              {selectedLocation[0].toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Custom styles for marker animation */}
      <style jsx>{`
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
    </div>
  );
};

export default CreateCheckpointPage;
