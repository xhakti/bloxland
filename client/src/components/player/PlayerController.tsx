import { useEffect, useRef } from 'react';
import { useAvatar } from '../../hooks/useAvatar';
import { usePlayerMovement } from '../../hooks/usePlayerMovement';

interface PlayerControllerProps {
    mapInstance: mapboxgl.Map | null;
    userLocation: [number, number] | null;
    avatarUrl: string | null;
    isEnabled?: boolean;
}

const PlayerController: React.FC<PlayerControllerProps> = ({
    mapInstance,
    userLocation,
    avatarUrl,
    isEnabled = true
}) => {
    const avatarLayerRef = useRef<any>(null);

    const { createAvatarLayer, removeAvatarLayer } = useAvatar({
        mapInstance,
        onLayerCreated: (layer: any) => {
            avatarLayerRef.current = layer;
        }
    });

    const { handleMovement } = usePlayerMovement({
        avatarLayer: avatarLayerRef.current,
        isEnabled
    });

    useEffect(() => {
        if (avatarUrl && userLocation && mapInstance && isEnabled) {
            createAvatarLayer({
                id: 'user-avatar',
                avatarUrl,
                position: userLocation,
                scale: 5
            });
        }

        return () => {
            if (avatarLayerRef.current) {
                removeAvatarLayer('user-avatar');
            }
        };
    }, [avatarUrl, userLocation, mapInstance, isEnabled, createAvatarLayer, removeAvatarLayer]);

    useEffect(() => {
        if (isEnabled) {
            const cleanup = handleMovement();
            return cleanup;
        }
    }, [isEnabled, handleMovement]);

    return null;
};

export default PlayerController;
