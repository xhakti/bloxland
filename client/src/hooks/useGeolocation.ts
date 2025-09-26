import { useState, useEffect } from 'react';

interface UseGeolocationOptions {
    onLocationChange?: (location: [number, number] | null) => void;
}

export const useGeolocation = ({ onLocationChange }: UseGeolocationOptions = {}) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            return;
        }

        const success = (position: GeolocationPosition) => {
            const location: [number, number] = [
                position.coords.longitude,
                position.coords.latitude
            ];
            setUserLocation(location);
            onLocationChange?.(location);
        };

        const error = () => {
            setError('Unable to get location');
        };

        navigator.geolocation.getCurrentPosition(success, error);

        const watchId = navigator.geolocation.watchPosition(success, error);

        return () => navigator.geolocation.clearWatch(watchId);
    }, [onLocationChange]);

    return { userLocation, error };
};
