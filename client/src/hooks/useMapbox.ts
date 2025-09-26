import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface UseMapboxOptions {
  container: React.RefObject<HTMLDivElement>;
  accessToken: string;
  onReady?: (map: mapboxgl.Map) => void;
}

export const useMapbox = ({
  container,
  accessToken,
  onReady,
}: UseMapboxOptions) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!container?.current || isInitialized.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/standard",
      antialias: true,
      center: [0, 0],
      zoom: 3,
      pitch: 60,
      bearing: -20,
      maxPitch: 85,
    });

    mapRef.current = map;
    isInitialized.current = true;

    map.on("load", () => {
      setIsMapReady(true);
      onReady?.(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      isInitialized.current = false;
    };
  }, [container, accessToken, onReady]);

  return {
    mapInstance: mapRef.current,
    isMapReady,
  };
};
