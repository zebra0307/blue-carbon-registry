'use client';

import { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { uploadProjectDocuments, retrieveProjectDocuments, downloadDocument, DocumentMetadata, ProjectDocument } from '@/utils/ipfsService';

interface DocumentUploadProps {
  projectId: string;
  onUploadComplete?: (ipfsHash: string, documents: DocumentMetadata[]) => void;
}

export default function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
  const { connected, publicKey } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<ProjectDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentMetadata[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const projectDocuments: ProjectDocument[] = selectedFiles.map(file => ({
      name: file.name,
      file,
      category: 'proposal', // Default category
      description: `Uploaded document: ${file.name}`,
    }));
    
    setFiles(projectDocuments);
    setError(null);
    setSuccess(null);
  };

  const handleCategoryChange = (index: number, category: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, category: category as any } : file
    ));
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, description } : file
    ));
  };

  const handleUpload = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadProjectDocuments(projectId, files);
      
      if (result.success && result.ipfsHash && result.documentMetadata) {
        setSuccess(`Documents uploaded successfully! IPFS Hash: ${result.ipfsHash}`);
        setUploadedDocuments(result.documentMetadata);
        setFiles([]); // Clear file selection
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(result.ipfsHash, result.documentMetadata);
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (hash: string, filename: string) => {
    try {
      const result = await downloadDocument(hash, filename);
      
      if (result.success && result.blob) {
        // Create download link
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Download failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Management</h2>
      <p className="text-gray-600 mb-6">Project: <span className="font-medium">{projectId}</span></p>

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload project documents
              </span>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <span className="mt-2 block text-sm text-gray-500">
                PNG, JPG, PDF, DOC up to 10MB each
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h3>
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.file.size)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={file.category}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="proposal">Project Proposal</option>
                      <option value="legal">Legal Documents</option>
                      <option value="scientific">Scientific Reports</option>
                      <option value="monitoring">Monitoring Data</option>
                      <option value="verification">Verification Reports</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={file.description || ''}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleUpload}
            disabled={uploading || !connected}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading to IPFS...' : `Upload ${files.length} Document${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.category} • {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(doc.hash, doc.name)}
                        className="ml-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">IPFS Document Storage</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Documents are stored on IPFS (InterPlanetary File System) providing:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Permanent, tamper-proof storage</li>
                <li>Distributed availability across the network</li>
                <li>Content-addressed retrieval</li>
                <li>Reduced storage costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}