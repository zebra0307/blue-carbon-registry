'use client';

import React, { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Layout } from '@/components/Navigation';
import { Plus, MapPin, TreePine, Calendar, FileText, Save, Upload, Camera, X, File, Image } from 'lucide-react';
import { uploadFilesToIPFS } from '@/utils/ipfs';
import { registerProject } from '@/utils/solana';
import { withRegistryCheck } from '@/utils/registryManager';

function RegisterProjectContent() {
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    areaSize: '',
    estimatedCredits: '',
    vintage: '',
    developer: '',
    description: '',
    certificationStandard: ''
  });

  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFiles = Array.from(event.target.files || []);
    setFiles(prevFiles => [...prevFiles, ...capturedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet to register a project');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload files to IPFS first
      let ipfsCid = '';
      if (files.length > 0) {
        setUploadProgress(25);
        const uploadResult = await uploadFilesToIPFS(files);
        if (uploadResult.success && uploadResult.results && uploadResult.results.length > 0) {
          // Use the first successful upload CID as the main project CID
          const firstSuccessfulUpload = uploadResult.results.find(r => r.cid);
          if (firstSuccessfulUpload && firstSuccessfulUpload.cid) {
            ipfsCid = firstSuccessfulUpload.cid;
          }
        }
        setUploadProgress(50);
      }

      // Prepare project data for blockchain
      const projectData = {
        project_id: formData.name.replace(/\s+/g, '_').toLowerCase(),
        ipfs_cid: ipfsCid,
        carbon_tons_estimated: parseInt(formData.estimatedCredits) || 0,
      };

      setUploadProgress(75);

      // Register project on blockchain with registry check
      const result = await withRegistryCheck(wallet, async () => {
        return await registerProject(
          wallet,
          projectData.project_id,
          projectData.ipfs_cid,
          projectData.carbon_tons_estimated
        );
      });

      setUploadProgress(100);

      if (result.success) {
        alert('Project registered successfully!');
        // Reset form
        setFormData({
          name: '',
          location: '',
          type: '',
          areaSize: '',
          estimatedCredits: '',
          vintage: '',
          developer: '',
          description: '',
          certificationStandard: ''
        });
        setFiles([]);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Plus className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Register Project</h1>
            <p className="text-gray-600">Register a new blue carbon project on the blockchain</p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project location"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <div className="relative">
                <TreePine className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select project type</option>
                  <option value="Mangrove Restoration">Mangrove Restoration</option>
                  <option value="Seagrass Conservation">Seagrass Conservation</option>
                  <option value="Wetland Protection">Wetland Protection</option>
                  <option value="Coastal Protection">Coastal Protection</option>
                  <option value="Salt Marsh Restoration">Salt Marsh Restoration</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="areaSize" className="block text-sm font-medium text-gray-700 mb-2">
                Area Size (hectares) *
              </label>
              <input
                type="number"
                id="areaSize"
                name="areaSize"
                value={formData.areaSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Area in hectares"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="estimatedCredits" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Credits *
              </label>
              <input
                type="number"
                id="estimatedCredits"
                name="estimatedCredits"
                value={formData.estimatedCredits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estimated carbon credits"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="vintage" className="block text-sm font-medium text-gray-700 mb-2">
                Vintage Year *
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="vintage"
                  name="vintage"
                  value={formData.vintage}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                Project Developer *
              </label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Organization name"
                required
              />
            </div>

            <div>
              <label htmlFor="certificationStandard" className="block text-sm font-medium text-gray-700 mb-2">
                Certification Standard *
              </label>
              <select
                id="certificationStandard"
                name="certificationStandard"
                value={formData.certificationStandard}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select standard</option>
                <option value="VCS">Verified Carbon Standard (VCS)</option>
                <option value="Gold Standard">Gold Standard</option>
                <option value="Climate Action Reserve">Climate Action Reserve</option>
                <option value="American Carbon Registry">American Carbon Registry</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the project objectives, methodology, and expected outcomes..."
                required
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Documents & Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload project documents, photos, or capture images</p>
                
                {/* Upload Buttons */}
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={openFileSelector}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <File className="h-4 w-4" />
                    <span>Select Files</span>
                  </button>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </button>
                </div>

                {/* File Inputs (Hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />

                <p className="text-xs text-gray-500">
                  Supported: Images (JPG, PNG), PDFs, Word documents (max 10MB each)
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-blue-500" />
                          ) : (
                            <File className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={uploading || !wallet.connected}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>
                {uploading ? 'Registering...' : !wallet.connected ? 'Connect Wallet' : 'Register Project'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterProjectPage() {
  return (
    <Layout>
      <RegisterProjectContent />
    </Layout>
  );
}