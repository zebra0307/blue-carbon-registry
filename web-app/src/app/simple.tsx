'use client';

import React from 'react';
import { TreePine } from 'lucide-react';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <TreePine className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blue Carbon Registry</h1>
          <p className="text-gray-600 mb-6">Simple Interface</p>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Projects</h3>
              <p className="text-2xl font-bold text-green-900">12</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Credits</h3>
              <p className="text-2xl font-bold text-blue-900">1,250</p>
            </div>
            
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}