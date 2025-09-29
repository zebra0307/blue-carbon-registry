/**
 * Utility functions for geolocation features in the Blue Carbon Registry
 */

// Check if geolocation is available in the browser
export function isGeolocationAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

// Options for the geolocation API
interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Default options for geolocation accuracy
const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

/**
 * Get the current position using browser's geolocation API
 * @param options Optional parameters for the geolocation API
 * @returns Promise that resolves to the user's coordinates
 */
export function getCurrentPosition(options: GeolocationOptions = DEFAULT_OPTIONS): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      options
    );
  });
}

/**
 * Watch the user's position with continuous updates
 * @param onUpdate Callback function that receives position updates
 * @param onError Callback function for errors
 * @param options Optional parameters for the geolocation API
 * @returns Function to stop watching position
 */
export function watchPosition(
  onUpdate: (coords: GeolocationCoordinates) => void,
  onError: (error: GeolocationPositionError) => void,
  options: GeolocationOptions = DEFAULT_OPTIONS
): () => void {
  if (!isGeolocationAvailable()) {
    onError({
      code: 2,
      message: 'Geolocation is not supported by this browser',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError);
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate(position.coords);
    },
    onError,
    options
  );

  // Return function to clear the watch
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Calculate distance between two coordinates in kilometers
 * Uses the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

// Helper function to convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check if a location is within a boundary polygon
export function isLocationInPolygon(
  latitude: number, 
  longitude: number, 
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  if (polygon.length < 3) {
    return false; // Not a polygon
  }

  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const vertexI = polygon[i];
    const vertexJ = polygon[j];
    
    const intersect = ((vertexI.lat > latitude) !== (vertexJ.lat > latitude)) &&
      (longitude < (vertexJ.lng - vertexI.lng) * (latitude - vertexI.lat) / (vertexJ.lat - vertexI.lat) + vertexI.lng);
    
    if (intersect) {
      isInside = !isInside;
    }
  }
  
  return isInside;
}