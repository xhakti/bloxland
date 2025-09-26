import { useCallback } from "react";
import mapboxgl from "mapbox-gl";

interface AvatarLayerOptions {
  id: string;
  avatarUrl: string;
  position: [number, number];
  scale?: number;
}

interface UseAvatarOptions {
  mapInstance: mapboxgl.Map | null;
  onLayerCreated?: (layer: any) => void;
}

export const useAvatar = ({
  mapInstance,
  onLayerCreated,
}: UseAvatarOptions) => {
  const createAvatarLayer = useCallback(
    async (options: AvatarLayerOptions) => {
      if (!mapInstance) return null;

      try {
        // For now, we'll create a simple marker instead of a 3D avatar
        const marker = new mapboxgl.Marker()
          .setLngLat(options.position)
          .addTo(mapInstance);

        onLayerCreated?.(marker);
        return marker;
      } catch (error) {
        console.error("Error creating avatar layer:", error);
        return null;
      }
    },
    [mapInstance, onLayerCreated]
  );

  const removeAvatarLayer = useCallback(
    (layerId: string) => {
      if (!mapInstance) return;

      try {
        // Remove marker logic would go here
        console.log("Removing avatar layer:", layerId);
      } catch (error) {
        console.warn("Error removing avatar layer:", error);
      }
    },
    [mapInstance]
  );

  return {
    createAvatarLayer,
    removeAvatarLayer,
  };
};
