import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { LocationData } from '../types';

interface LocationContextType {
  currentLocation: LocationData | null;
  isLocationEnabled: boolean;
  locationError: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  clearLocationHistory: () => Promise<void>;
  isTracking: boolean;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  isLocationEnabled: false,
  locationError: null,
  requestLocationPermission: async () => false,
  getCurrentLocation: async () => null,
  startLocationTracking: async () => {},
  stopLocationTracking: () => {},
  clearLocationHistory: async () => {},
  isTracking: false,
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    checkLocationPermission();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setIsLocationEnabled(status === 'granted');
      
      if (status === 'granted') {
        setLocationError(null);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationError('Failed to check location permission');
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      setLocationError(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setIsLocationEnabled(true);
        
        // Also request background permissions for continuous tracking
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        console.log('Background location permission:', backgroundStatus.status);
        
        return true;
      } else {
        setIsLocationEnabled(false);
        setLocationError('Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Failed to request location permission');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      if (!isLocationEnabled) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          return null;
        }
      }

      setLocationError(null);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      setLocationError('Failed to get current location');
      return null;
    }
  };

  const startLocationTracking = async () => {
    try {
      if (!isLocationEnabled) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          return;
        }
      }

      if (locationSubscription) {
        locationSubscription.remove();
      }

      setLocationError(null);
      setIsTracking(true);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update when moved 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          setCurrentLocation(locationData);
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setLocationError('Failed to start location tracking');
      setIsTracking(false);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const clearLocationHistory = async (): Promise<void> => {
    // For now, this is a no-op since we don't store location history locally
    // In the future, this could clear cached location data
    console.log('Location history cleared');
  };

  const value: LocationContextType = {
    currentLocation,
    isLocationEnabled,
    locationError,
    requestLocationPermission,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    clearLocationHistory,
    isTracking,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};