'use client';

import React, { useState, useEffect } from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { ChevronRight, FileText, Upload, AlertCircle, CheckCircle, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { uploadFileToIPFS } from '@/utils/ipfs';
import { addMultipleProjectFiles } from '@/utils/projectFiles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  type: string;
  area: string;
  projectId: string;
}

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
  uploadProgress?: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Blue Carbon Project subbu0111',
    type: 'Coastal Area',
    area: '100 hectares',
    projectId: 'subbu0111'
  },
  {
    id: '2',
    name: 'Blue Carbon Project akshat_hr',
    type: 'Coastal Area',
    area: '100 hectares',
    projectId: 'akshat_hr'
  },
  {
    id: '3',
    name: 'Blue Carbon Project zebra0307',
    type: 'Coastal Area',
    area: '100 hectares',
    projectId: 'zebra0307'
  },
  {
    id: '4',
    name: 'Blue Carbon Project BCP-0307',
    type: 'Coastal Area',
    area: '100 hectares',
    projectId: 'BCP-0307'
  },
  {
    id: '5',
    name: 'Blue Carbon Project 5o5',
    type: 'Coastal Area',
    area: '100 hectares',
    projectId: '5o5'
  }
];

export default function UploadDocuments() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [projectId: string]: UploadedFile[] }>({});
  const [isUploading, setIsUploading] = useState<{ [projectId: string]: boolean }>({});
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const files = event.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        file,
        status: 'pending' as const
      }));
      
      setUploadedFiles(prev => ({
        ...prev,
        [projectId]: newFiles
      }));
    }
  };

  const toggleProject = (project: Project) => {
    setSelectedProject(selectedProject?.id === project.id ? null : project);
  };

  const uploadToIPFS = async (projectId: string) => {
    const files = uploadedFiles[projectId];
    if (!files || files.length === 0) return;

    setIsUploading(prev => ({ ...prev, [projectId]: true }));

    // Update all files to uploading status
    setUploadedFiles(prev => ({
      ...prev,
      [projectId]: prev[projectId].map(fileData => ({
        ...fileData,
        status: 'uploading' as const
      }))
    }));

    const successfulUploads = [];

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      try {
        const result = await uploadFileToIPFS(fileData.file);
        
        setUploadedFiles(prev => ({
          ...prev,
          [projectId]: prev[projectId].map((f, index) => 
            index === i 
              ? {
                  ...f,
                  status: result.success ? 'success' : 'error',
                  ipfsHash: result.cid,
                  ipfsUrl: result.gateway,
                  error: result.error
                }
              : f
          )
        }));

        // If upload was successful, prepare for shared storage
        if (result.success && result.cid && result.gateway) {
          successfulUploads.push({
            name: fileData.file.name,
            type: fileData.file.type,
            size: fileData.file.size,
            ipfsHash: result.cid,
            ipfsUrl: result.gateway,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Current User',
            projectId: projectId
          });
        }
      } catch (error) {
        setUploadedFiles(prev => ({
          ...prev,
          [projectId]: prev[projectId].map((f, index) => 
            index === i 
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        }));
      }
    }

    // Save all successful uploads to shared storage
    if (successfulUploads.length > 0) {
      try {
        addMultipleProjectFiles(successfulUploads);
        console.log(`Successfully saved ${successfulUploads.length} files to project ${projectId}`);
      } catch (error) {
        console.error('Error saving files to shared storage:', error);
      }
    }

    setIsUploading(prev => ({ ...prev, [projectId]: false }));
  };

  const renderUploadSection = (project: Project) => (
    <div className="mt-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Documents for {project.name}
          </h3>
        </div>
        <p className="text-gray-600">
          Project ID: {project.projectId}
        </p>
      </div>

      {/* Document Upload Guidelines */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Document Upload Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure all documents are related to the selected project</li>
              <li>• Files will be stored securely on IPFS for verification</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Upload Project Documents
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, project.id)}
              className="hidden"
              id={`file-upload-${project.id}`}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor={`file-upload-${project.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose Files
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles[project.id]?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Files ({uploadedFiles[project.id].length})</h4>
          <div className="space-y-2">
            {uploadedFiles[project.id].map((fileData, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  {fileData.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {fileData.status === 'uploading' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                  {fileData.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  {fileData.status === 'pending' && <FileText className="h-5 w-5 text-gray-600" />}
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{fileData.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {fileData.status === 'success' && fileData.ipfsUrl && (
                      <div className="mt-1">
                        <a 
                          href={fileData.ipfsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>View on IPFS</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    
                    {fileData.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileData.status === 'success' && (
                    <span className="text-xs text-green-600 font-medium">Uploaded</span>
                  )}
                  {fileData.status === 'uploading' && (
                    <span className="text-xs text-blue-600 font-medium">Uploading...</span>
                  )}
                  {fileData.status === 'error' && (
                    <span className="text-xs text-red-600 font-medium">Failed</span>
                  )}
                  
                  <button
                    onClick={() => {
                      setUploadedFiles(prev => ({
                        ...prev,
                        [project.id]: prev[project.id]?.filter((_, i) => i !== index) || []
                      }));
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={fileData.status === 'uploading'}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => uploadToIPFS(project.id)}
              disabled={isUploading[project.id] || uploadedFiles[project.id]?.every(f => f.status === 'success')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading[project.id] ? 'Uploading to IPFS...' : 'Upload to IPFS'}
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setUploadedFiles(prev => ({
                  ...prev,
                  [project.id]: []
                }));
              }}
              disabled={isUploading[project.id]}
            >
              Clear All
            </button>
          </div>

          {/* Success Message with Project Link */}
          {uploadedFiles[project.id]?.every(f => f.status === 'success') && uploadedFiles[project.id]?.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    All files uploaded successfully to IPFS!
                  </span>
                </div>
                <Link 
                  href={`/projects/${project.projectId}`}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Project Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <SolanaWalletProvider>
      <Layout>
        <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Upload Documents</h1>
          <p className="text-blue-600">Upload project verification documents to IPFS</p>
        </div>

        {/* Projects List with Inline Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Project Document Upload</h2>
            <p className="text-blue-700 mb-4">Click on any project to upload documents:</p>
            
            <div className="space-y-3">
              {mockProjects.map((project) => (
                <div key={project.id}>
                  <div
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25'
                    }`}
                    onClick={() => toggleProject(project)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.type} • {project.area}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.projectId}
                      </span>
                      <ChevronRight 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          selectedProject?.id === project.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>
                  
                  {/* Upload Section - appears directly under clicked project */}
                  {selectedProject?.id === project.id && renderUploadSection(project)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">IPFS Decentralized Storage</h4>
              <p className="mt-1 text-sm text-blue-800">
                Your documents are stored on IPFS (InterPlanetary File System) for permanent, 
                decentralized access. Files uploaded here will be globally available and verifiable.
              </p>
            </div>
          </div>
        </div>
        </div>
      </Layout>
    </SolanaWalletProvider>
  );
}