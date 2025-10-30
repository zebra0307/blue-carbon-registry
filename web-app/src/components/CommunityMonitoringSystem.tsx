'use client';

import React, { useState } from 'react';
import { Camera, MapPin, Upload, Users } from 'lucide-react';

export default function CommunityMonitoringSystem() {
  const [observations, setObservations] = useState([
    {
      id: 1,
      user: 'Community Member #1',
      date: '2025-10-28',
      location: 'Mangrove Site A',
      observation: 'New mangrove saplings showing healthy growth',
      photos: 3,
    },
    {
      id: 2,
      user: 'Local Validator',
      date: '2025-10-25',
      location: 'Seagrass Zone B',
      observation: 'Seagrass density increased by approximately 15%',
      photos: 5,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Community Monitoring</h2>
        </div>
        <p className="text-blue-100">
          Collaborate with local communities to track environmental progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {observations.map((obs) => (
          <div
            key={obs.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {obs.user}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{obs.date}</p>
              </div>
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <Camera className="w-4 h-4" />
                <span className="text-sm">{obs.photos}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{obs.location}</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300">{obs.observation}</p>

            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition-colors duration-200">
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Submit New Observation
        </h3>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors duration-200">
          <Upload className="w-5 h-5" />
          <span>Add Observation</span>
        </button>
      </div>
    </div>
  );
}
