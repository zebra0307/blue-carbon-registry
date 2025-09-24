'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { 
  ArrowLeft, 
  TreePine, 
  MapPin, 
  Calendar, 
  Award, 
  DollarSign, 
  Activity,
  FileText,
  ExternalLink,
  Upload,
  Plus,
  Download,
  Eye,
  Globe,
  Hash,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { uploadFileToIPFS } from '@/utils/ipfs';
import { useProjectFiles, ProjectFile, addProjectFile } from '@/utils/projectFiles';

interface ProjectDetails {
  id: string;
  projectId: string;
  name: string;
  location: string;
  type: string;
  status: 'Active' | 'Verified' | 'Pending' | 'Draft';
  creditsIssued: number;
  creditsAvailable: number;
  price: number;
  vintage: number;
  areaSize: number;
  developer: string;
  description?: string;
  blockchainAddress?: string;
  owner?: string;
  carbonTons?: number;
  ipfsCid?: string;
  createdAt?: string;
  updatedAt?: string;
}

// IPFSFile interface replaced by ProjectFile from shared storage

// Mock function to get project details - will be replaced with blockchain data
const getProjectDetails = async (id: string): Promise<ProjectDetails | null> => {
  // This would fetch from blockchain in real implementation
  const mockProjects: { [key: string]: ProjectDetails } = {
    'subbu0111': {
      id: 'subbu0111',
      projectId: 'subbu0111',
      name: 'Blue Carbon Project subbu0111',
      location: 'Coastal Area, India',
      type: 'Mangrove Restoration',
      status: 'Pending',
      creditsIssued: 0,
      creditsAvailable: 0,
      price: 25.00,
      vintage: 2024,
      areaSize: 100,
      developer: 'Blue Carbon Registry',
      description: 'A coastal mangrove restoration project focused on carbon sequestration and marine ecosystem protection.',
      blockchainAddress: 'BciUCmJsAg4dhBeJ792vU9GkWwzdLDSvhNhXpqai49fk',
      owner: 'CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK',
      carbonTons: 0,
      ipfsCid: 'QmExample1758114741881',
      createdAt: '2024-09-24T10:30:00Z',
      updatedAt: '2024-09-24T10:30:00Z'
    },
    'BCP-0307': {
      id: 'BCP-0307',
      projectId: 'BCP-0307',
      name: 'Blue Carbon Project BCP-0307',
      location: 'Coastal Area, Bangladesh',
      type: 'Seagrass Conservation',
      status: 'Active',
      creditsIssued: 0,
      creditsAvailable: 0,
      price: 30.00,
      vintage: 2024,
      areaSize: 150,
      developer: 'Blue Carbon Registry',
      description: 'Seagrass conservation project aimed at protecting marine carbon sinks and biodiversity.',
      blockchainAddress: 'CHFoUuMrVbwra9kMu5h7dubn2RRKHtf6VHEWcRFJrbkL',
      owner: 'CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK',
      carbonTons: 0,
      ipfsCid: 'QmExample1758054017623',
      createdAt: '2024-09-24T09:15:00Z',
      updatedAt: '2024-09-24T09:15:00Z'
    },
    'akshat_hr': {
      id: 'akshat_hr',
      projectId: 'akshat_hr',
      name: 'Blue Carbon Project akshat_hr',
      location: 'Coastal Area, Myanmar',
      type: 'Wetland Protection',
      status: 'Verified',
      creditsIssued: 0,
      creditsAvailable: 0,
      price: 28.00,
      vintage: 2024,
      areaSize: 200,
      developer: 'Blue Carbon Registry',
      description: 'Wetland protection initiative to preserve critical coastal ecosystems and carbon storage.',
      blockchainAddress: '4Wdjz7XF18HR6CrJvvnTJ5i7aBeXArCdXpbGtgkrVQQv',
      owner: 'CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK',
      carbonTons: 0,
      ipfsCid: 'QmExample1758057021171',
      createdAt: '2024-09-24T08:45:00Z',
      updatedAt: '2024-09-24T08:45:00Z'
    },
    'zebra0307': {
      id: 'zebra0307',
      projectId: 'zebra0307',
      name: 'Blue Carbon Project zebra0307',
      location: 'Coastal Area, Thailand',
      type: 'Coastal Area',
      status: 'Draft',
      creditsIssued: 0,
      creditsAvailable: 0,
      price: 22.00,
      vintage: 2024,
      areaSize: 75,
      developer: 'Blue Carbon Registry',
      description: 'Comprehensive coastal ecosystem restoration project targeting multiple blue carbon habitats.',
      blockchainAddress: 'FLvUSuLSriDZTLdsCFz3fvE59yT4pqDjgMtmtAohjbMd',
      owner: 'CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK',
      carbonTons: 0,
      ipfsCid: 'QmExample1758056602723',
      createdAt: '2024-09-24T11:20:00Z',
      updatedAt: '2024-09-24T11:20:00Z'
    },
    '5o5': {
      id: '5o5',
      projectId: '5o5',
      name: 'Blue Carbon Project 5o5',
      location: 'Coastal Area, Philippines',
      type: 'Coastal Area',
      status: 'Pending',
      creditsIssued: 0,
      creditsAvailable: 0,
      price: 26.00,
      vintage: 2024,
      areaSize: 120,
      developer: 'Blue Carbon Registry',
      description: 'Multi-habitat coastal restoration focusing on mangroves, seagrass, and salt marshes.',
      blockchainAddress: 'BciUCmJsAg4dhBeJ792vU9GkWwzdLDSvhNhXpqai49fk',
      owner: 'APjEMfa6bpqx27rVUWHo9UZSaMdyuMZgcUrdRjXWuMz5',
      carbonTons: 0,
      ipfsCid: 'QmExample1758089839960',
      createdAt: '2024-09-24T12:00:00Z',
      updatedAt: '2024-09-24T12:00:00Z'
    }
  };

  return mockProjects[id] || null;
};

// Note: Project files are now managed through the shared storage system in /utils/projectFiles.ts

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Use the shared project files storage
  const { files: ipfsFiles, loading: filesLoading } = useProjectFiles(projectId);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const projectData = await getProjectDetails(projectId);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadingFiles(Array.from(files));
    }
  };

  const uploadToIPFS = async () => {
    if (!uploadingFiles.length || !project) return;

    setIsUploading(true);

    try {
      const uploadPromises = uploadingFiles.map(async (file) => {
        const result = await uploadFileToIPFS(file);
        if (result.success && result.cid && result.gateway) {
          // Add to shared storage
          return addProjectFile({
            name: file.name,
            type: file.type,
            size: file.size,
            ipfsHash: result.cid,
            ipfsUrl: result.gateway,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Current User',
            projectId: projectId
          });
        }
        throw new Error(result.error || 'Upload failed');
      });

      const newFiles = await Promise.all(uploadPromises);
      setUploadingFiles([]);
      setShowUpload(false);
      
      // Show success message
      alert(`Successfully uploaded ${newFiles.length} file(s) to IPFS and saved to project!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Verified': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateIPFSUrl = (url: string) => {
    // Basic validation for IPFS URL format
    return url.startsWith('https://gateway.pinata.cloud/ipfs/') && url.length > 50;
  };

  const handleIPFSLink = (file: ProjectFile) => {
    if (!validateIPFSUrl(file.ipfsUrl)) {
      alert('Invalid IPFS URL format. Please contact support.');
      return;
    }
    window.open(file.ipfsUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <SolanaWalletProvider>
        <Layout>
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </SolanaWalletProvider>
    );
  }

  if (!project) {
    return (
      <SolanaWalletProvider>
        <Layout>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
            <Link 
              href="/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </div>
        </Layout>
      </SolanaWalletProvider>
    );
  }

  return (
    <SolanaWalletProvider>
      <Layout>
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/projects"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-blue-600">{project.name}</h1>
              <p className="text-gray-600">Project ID: {project.projectId}</p>
            </div>
          </div>

          {/* Project Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Project Overview</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TreePine className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{project.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{project.areaSize} hectares</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Vintage {project.vintage}</span>
                  </div>
                </div>

                {project.description && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Project Metrics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Credits Issued</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{project.creditsIssued.toLocaleString()}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Price per Credit</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${project.price}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TreePine className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Carbon Tons</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{project.carbonTons || 0}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{project.creditsAvailable.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Blockchain Address:</span>
                <span className="text-sm text-gray-600 font-mono">{project.blockchainAddress}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">IPFS CID:</span>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${project.ipfsCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-mono flex items-center space-x-1"
                >
                  <span>{project.ipfsCid}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Owner:</span>
                <span className="text-sm text-gray-600 font-mono">{project.owner}</span>
              </div>
            </div>
          </div>

          {/* IPFS Files Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
                <p className="text-gray-600 text-sm">Files stored on IPFS for this project</p>
              </div>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Files
              </button>
            </div>

            {/* Upload Section */}
            {showUpload && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">Upload New Files</h4>
                
                {/* Document Upload Guidelines */}
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
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

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-detail"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
                    />
                    <label
                      htmlFor="file-upload-detail"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Choose Files
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: PDF, DOC, DOCX, JPG, PNG, TXT, ZIP (Max 10MB each)
                    </p>
                  </div>

                  {uploadingFiles.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h5>
                      <div className="space-y-2">
                        {uploadingFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                            </div>
                            <button
                              onClick={() => setUploadingFiles(files => files.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={uploadToIPFS}
                          disabled={isUploading}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isUploading ? 'Uploading to IPFS...' : 'Upload to IPFS'}
                        </button>
                        <button
                          onClick={() => {
                            setUploadingFiles([]);
                            setShowUpload(false);
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Files List */}
            {ipfsFiles.length > 0 ? (
              <div className="space-y-3">
                {ipfsFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
                          {file.uploadedBy && <span>by {file.uploadedBy}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleIPFSLink(file)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View on IPFS
                      </button>
                      <a
                        href={file.ipfsUrl}
                        download={file.name}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-mono truncate max-w-32" title={file.ipfsHash}>
                          {file.ipfsHash.substring(0, 20)}...
                        </span>
                        <span className="text-xs text-green-600">✓ Real IPFS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload verification documents to get started</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </SolanaWalletProvider>
  );
}