'use client';

import React, { useState } from 'react';
import { Camera, MapPin, Thermometer, Droplets, Wind } from 'lucide-react';
import CameraCapture from './CameraCapture';
import useGeolocation from '@/hooks/useGeolocation';

export default function MobileFieldDataCollection() {
  const { latitude, longitude, accuracy, error: geoError, requestLocation } = useGeolocation();
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    windSpeed: '',
    soilMoisture: '',
    observations: '',
  });

  const handlePhotoCapture = (imageFile: File) => {
    console.log('Photo captured:', imageFile);
    setShowCamera(false);
  };

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Field data submitted:', { ...formData, location: { latitude, longitude } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Location Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Location
              </span>
            </div>
            <button
              onClick={requestLocation}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Update Location
            </button>
          </div>
          {latitude && longitude && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
              <br />
              {accuracy && `Accuracy: ±${accuracy.toFixed(0)}m`}
            </p>
          )}
          {geoError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {geoError.message || 'Geolocation error'}
            </p>
          )}
        </div>

        {/* Camera Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowCamera(!showCamera)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Camera className="w-5 h-5" />
            <span>{showCamera ? 'Close Camera' : 'Take Photo'}</span>
          </button>

          {showCamera && (
            <div className="mt-4">
              <CameraCapture
                onImageCapture={handlePhotoCapture}
                onError={handleCameraError}
              />
            </div>
          )}
        </div>

        {/* Data Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Thermometer className="w-4 h-4" />
              <span>Temperature (°C)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="25.5"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Droplets className="w-4 h-4" />
              <span>Humidity (%)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.humidity}
              onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="65.0"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wind className="w-4 h-4" />
              <span>Wind Speed (km/h)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.windSpeed}
              onChange={(e) => setFormData({ ...formData, windSpeed: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="12.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Observations
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Record your field observations..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 
                     font-medium transition-colors duration-200"
          >
            Submit Field Data
          </button>
        </form>
      </div>
    </div>
  );
}
