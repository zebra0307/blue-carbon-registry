import { useState, useEffect } from 'react';
import { getCurrentPosition, isGeolocationAvailable } from '@/utils/geolocation';

interface UseGeolocationProps {
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | Error | null;
  loading: boolean;
  available: boolean;
}

/**
 * Hook to access and monitor device geolocation
 * @param options Configuration options for geolocation
 * @returns Location state and functions to request/refresh location
 */
export default function useGeolocation({
  highAccuracy = true,
  timeout = 10000,
  maximumAge = 0,
  watchPosition = false
}: UseGeolocationProps = {}) {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: false,
    available: isGeolocationAvailable()
  });

  const updatePosition = (coords: GeolocationCoordinates, timestamp: number = Date.now()) => {
    setState(prevState => ({
      ...prevState,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp,
      error: null,
      loading: false
    }));
  };

  const handleError = (error: GeolocationPositionError | Error) => {
    setState(prevState => ({
      ...prevState,
      error,
      loading: false
    }));
  };

  const requestLocation = async () => {
    if (!state.available) {
      handleError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    setState(prevState => ({ ...prevState, loading: true }));

    try {
      const coords = await getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      });
      
      updatePosition(coords);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown geolocation error'));
    }
  };

  useEffect(() => {
    if (watchPosition && state.available) {
      setState(prevState => ({ ...prevState, loading: true }));

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updatePosition(position.coords, position.timestamp);
        },
        (error) => {
          handleError(error);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [watchPosition, state.available, highAccuracy, timeout, maximumAge]);

  return {
    ...state,
    requestLocation
  };
}