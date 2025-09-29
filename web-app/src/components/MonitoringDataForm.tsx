'use client';

import React, { useState } from 'react';
import { MonitoringDataInput } from '@/types/blueCarbon';

interface MonitoringDataFormProps {
  projectId: string;
  onSubmit: (data: MonitoringDataInput) => Promise<void>;
  loading?: boolean;
}

export default function MonitoringDataForm({ projectId, onSubmit, loading = false }: MonitoringDataFormProps) {
  const [formData, setFormData] = useState<MonitoringDataInput>({
    projectId,
    timestamp: Math.floor(Date.now() / 1000),
    carbonStock: 0,
    biodiversityMeasurements: [],
    waterQualityIndices: [],
    satelliteImageCid: '',
    fieldObservationsCid: ''
  });

  const [currentBiodiversity, setCurrentBiodiversity] = useState('');
  const [currentWaterQuality, setCurrentWaterQuality] = useState({ parameter: '', value: 0 });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBiodiversityMeasurement = () => {
    if (currentBiodiversity.trim()) {
      setFormData(prev => ({
        ...prev,
        biodiversityMeasurements: [...(prev.biodiversityMeasurements || []), currentBiodiversity]
      }));
      setCurrentBiodiversity('');
    }
  };

  const addWaterQualityIndex = () => {
    if (currentWaterQuality.parameter && currentWaterQuality.value > 0) {
      setFormData(prev => ({
        ...prev,
        waterQualityIndices: [...(prev.waterQualityIndices || []), currentWaterQuality]
      }));
      setCurrentWaterQuality({ parameter: '', value: 0 });
    }
  };

  const removeBiodiversityMeasurement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      biodiversityMeasurements: (prev.biodiversityMeasurements || []).filter((_, i) => i !== index)
    }));
  };

  const removeWaterQualityIndex = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waterQualityIndices: (prev.waterQualityIndices || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Submit Monitoring Data</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={formData.projectId}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitoring Date
              </label>
              <input
                type="datetime-local"
                value={formData.timestamp ? new Date(formData.timestamp * 1000).toISOString().slice(0, -1) : new Date().toISOString().slice(0, -1)}
                onChange={(e) => handleInputChange('timestamp', Math.floor(new Date(e.target.value).getTime() / 1000))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Carbon Stock Measurements */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Carbon Stock Measurements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Carbon Stock (tons C)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.carbonStock}
                onChange={(e) => handleInputChange('carbonStock', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement Confidence (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.measurementConfidence || ''}
                onChange={(e) => handleInputChange('measurementConfidence', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Biodiversity Measurements */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Biodiversity Measurements</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentBiodiversity}
                onChange={(e) => setCurrentBiodiversity(e.target.value)}
                placeholder="e.g., Species count: 45, Shannon index: 2.3"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={addBiodiversityMeasurement}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
            
            {formData.biodiversityMeasurements && formData.biodiversityMeasurements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Current Measurements:</h4>
                {formData.biodiversityMeasurements.map((measurement, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">{measurement}</span>
                    <button
                      type="button"
                      onClick={() => removeBiodiversityMeasurement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Water Quality Indices */}
        <div className="bg-cyan-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-cyan-800 mb-4">Water Quality Indices</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={currentWaterQuality.parameter}
                onChange={(e) => setCurrentWaterQuality(prev => ({ ...prev, parameter: e.target.value }))}
                placeholder="Parameter (e.g., pH, DO, Turbidity)"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                step="0.01"
                value={currentWaterQuality.value}
                onChange={(e) => setCurrentWaterQuality(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                placeholder="Value"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={addWaterQualityIndex}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
              >
                Add Index
              </button>
            </div>
            
            {formData.waterQualityIndices && formData.waterQualityIndices.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Current Indices:</h4>
                {formData.waterQualityIndices.map((index, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">{index.parameter}: {index.value}</span>
                    <button
                      type="button"
                      onClick={() => removeWaterQualityIndex(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Supporting Documentation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Satellite Image IPFS CID
              </label>
              <input
                type="text"
                value={formData.satelliteImageCid}
                onChange={(e) => handleInputChange('satelliteImageCid', e.target.value)}
                placeholder="QmXXX... (satellite imagery)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Observations IPFS CID
              </label>
              <input
                type="text"
                value={formData.fieldObservationsCid}
                onChange={(e) => handleInputChange('fieldObservationsCid', e.target.value)}
                placeholder="QmXXX... (field data, photos)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Environmental Conditions */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">Environmental Conditions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature || ''}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salinity (ppt)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.salinity || ''}
                onChange={(e) => handleInputChange('salinity', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tidal Height (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tidalHeight || ''}
                onChange={(e) => handleInputChange('tidalHeight', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sediment Rate (cm/year)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sedimentationRate || ''}
                onChange={(e) => handleInputChange('sedimentationRate', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Quality Assurance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QA Protocol Used
              </label>
              <input
                type="text"
                value={formData.qaProtocol || ''}
                onChange={(e) => handleInputChange('qaProtocol', e.target.value)}
                placeholder="e.g., IPCC Wetlands Supplement 2013"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Validation Status
              </label>
              <select
                value={formData.dataValidated ? 'validated' : 'pending'}
                onChange={(e) => handleInputChange('dataValidated', e.target.value === 'validated')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="pending">Pending Validation</option>
                <option value="validated">Validated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Monitoring Data'}
          </button>
        </div>
      </form>
    </div>
  );
}