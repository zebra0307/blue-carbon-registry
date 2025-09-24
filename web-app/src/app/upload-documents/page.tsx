'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, FileText, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  area: string;
  status: string;
}

const mockProjects: Project[] = [
  {
    id: 'subbu0111',
    name: 'Blue Carbon Project subbu0111',
    type: 'Coastal Area',
    area: '100 hectares',
    status: 'Active'
  },
  {
    id: 'akshat_hr',
    name: 'Blue Carbon Project akshat_hr',
    type: 'Coastal Area',
    area: '100 hectares',
    status: 'Active'
  },
  {
    id: 'zebra0307',
    name: 'Blue Carbon Project zebra0307',
    type: 'Coastal Area',
    area: '100 hectares',
    status: 'Active'
  },
  {
    id: 'BCP-0307',
    name: 'Blue Carbon Project BCP-0307',
    type: 'Coastal Area',
    area: '100 hectares',
    status: 'Active'
  },
  {
    id: 'So5',
    name: 'Blue Carbon Project So5',
    type: 'Coastal Area',
    area: '100 hectares',
    status: 'Active'
  }
];

export default function UploadDocuments() {
  const { connected } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    // TODO: Replace with actual blockchain data fetching
    setProjects(mockProjects);
  }, []);

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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Upload Documents</h1>
        <p className="text-teal-600 text-lg">Upload project verification documents to IPFS</p>
      </div>

      {!connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Wallet Not Connected</h3>
          <p className="text-yellow-600">Please connect your wallet to upload documents.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Select Project for Document Upload</h2>
            <p className="text-blue-700 mb-6">Choose which project to upload documents for:</p>
            
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-blue-900">{project.name}</h3>
                      <div className="flex items-center text-sm text-blue-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{project.type} • {project.area}</span>
                      </div>
                    </div>
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {project.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          {selectedProject && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Documents for {selectedProject.name}
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Choose files to upload
                  </p>
                  <p className="text-gray-500">
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
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Selected Files:</h4>
                  <div className="space-y-2">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
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