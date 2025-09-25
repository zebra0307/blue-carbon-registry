'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, FileText, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { useUserProjects } from '@/hooks/useBlockchainData';

// Use the same Project interface as other pages
interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  areaSize?: number;
}

export default function UploadDocuments() {
  const { connected } = useWallet();
  // Use user's own projects only for document upload
  const { projects, loading, error } = useUserProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedProject || !selectedFiles || !connected) return;

    setUploading(true);
    try {
      // TODO: Implement IPFS upload and blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      alert('Documents uploaded successfully!');
      setSelectedFiles(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">Upload Documents</h1>
        <p className="text-teal-600 text-base sm:text-lg">Upload project verification documents to IPFS</p>
      </div>

      {!connected ? (
        <div className="card-responsive bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-yellow-800 mb-2">Wallet Not Connected</h3>
          <p className="text-sm sm:text-base text-yellow-600">Please connect your wallet to upload documents.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Project Selection */}
          <div className="card-responsive bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">Select Your Project for Document Upload</h2>
            <p className="text-sm sm:text-base text-blue-700 mb-4 sm:mb-6">Choose which of your projects to upload documents for:</p>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm sm:text-base text-blue-600">Loading blockchain projects...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
                Error loading projects: {error}
              </div>
            )}

            {/* Projects List */}
            {!loading && !error && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-900 text-sm sm:text-base line-clamp-2">{project.name}</h3>
                        <div className="flex items-center text-xs sm:text-sm text-blue-600 mt-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{project.location} • {project.type} • {project.areaSize ? `${project.areaSize} hectares` : '100 hectares'}</span>
                        </div>
                      </div>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded self-start sm:self-center">
                        {project.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Projects Found */}
            {!loading && !error && projects.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-blue-600">No projects found in your wallet.</p>
                <p className="text-xs sm:text-sm text-blue-500 mt-2">Please register a project first to upload documents.</p>
                <button 
                  onClick={() => window.location.href = '/register'} 
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Register Project
                </button>
              </div>
            )}
          </div>          {/* File Upload Section */}
          {selectedProject && (
            <div className="card-responsive bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
                Upload Documents for {selectedProject.name}
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    Choose files to upload
                  </p>
                  <p className="text-sm sm:text-base text-gray-500 px-2">
                    Select verification documents, reports, or certificates
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Select Files
                  </label>
                </div>
              </div>

              {selectedFiles && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Selected Files:</h4>
                  <div className="space-y-2">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading to IPFS...
                      </>
                    ) : (
                      'Upload Documents'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}