'use client';

import { useState, useRef, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  uploadFileToIPFS, 
  uploadFilesToIPFS, 
  uploadProjectDocuments, 
  validateProjectFile, 
  getFileFromIPFS
} from '@/utils/ipfs';
import { UploadHistoryManager, UploadProject, UploadedFile } from '@/utils/uploadHistory';
import IPFSDebugPanel from './IPFSDebugPanel';
import SuccessNotification from './SuccessNotification';
import SuccessModal from './SuccessModal';

interface DocumentUploadProps {
  projectId: string;
  onUploadComplete?: (ipfsHash: string, documents: any[]) => void;
}

interface ProjectDocument {
  name: string;
  file: File;
  category: 'proposal' | 'baselineStudy' | 'monitoringPlan' | 'landRights' | 'photos' | 'reports';
  description?: string;
  uploadProgress?: number;
  cid?: string;
  error?: string;
}

export default function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
  const { connected, publicKey } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper function for file size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const [files, setFiles] = useState<ProjectDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [successNotification, setSuccessNotification] = useState<{message: string, cid?: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState<{projectCid: string, documents: any[]} | null>(null);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList: FileList) => {
    console.log('Files selected:', fileList.length);
    const selectedFiles = Array.from(fileList);
    const projectDocuments: ProjectDocument[] = [];
    
    selectedFiles.forEach(file => {
      console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
      const validation = validateProjectFile(file);
      console.log('Validation result:', validation);
      
      if (validation.valid) {
        projectDocuments.push({
          name: file.name,
          file,
          category: file.type.startsWith('image/') ? 'photos' : 'reports', // Smart default based on file type
          description: `Uploaded document: ${file.name}`,
          uploadProgress: 0
        });
      } else {
        console.error('File validation failed:', validation.error);
        setError(validation.error || 'Invalid file');
      }
    });
    
    console.log('Valid documents to add:', projectDocuments.length);
    setFiles(prev => {
      const newFiles = [...prev, ...projectDocuments];
      console.log('Total files after adding:', newFiles.length);
      return newFiles;
    });
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    setOverallProgress(0);

    try {
      // Organize files by category
      const documents: {
        proposal?: File;
        baselineStudy?: File;
        monitoringPlan?: File;
        landRights?: File;
        photos?: File[];
        reports?: File[];
      } = {};

      files.forEach(fileDoc => {
        switch (fileDoc.category) {
          case 'proposal':
            documents.proposal = fileDoc.file;
            break;
          case 'baselineStudy':
            documents.baselineStudy = fileDoc.file;
            break;
          case 'monitoringPlan':
            documents.monitoringPlan = fileDoc.file;
            break;
          case 'landRights':
            documents.landRights = fileDoc.file;
            break;
          case 'photos':
            if (!documents.photos) documents.photos = [];
            documents.photos.push(fileDoc.file);
            break;
          case 'reports':
            if (!documents.reports) documents.reports = [];
            documents.reports.push(fileDoc.file);
            break;
        }
      });

      // Upload individual files with progress tracking
      let completed = 0;
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const fileDoc = files[i];
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, uploadProgress: 0 } : f
        ));

        const result = await uploadFileToIPFS(fileDoc.file);
        
        if (result.success && result.cid) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, uploadProgress: 100, cid: result.cid } : f
          ));
        } else {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, error: result.error || 'Upload failed' } : f
          ));
        }

        completed++;
        setOverallProgress((completed / total) * 100);
      }

      // Upload project documents bundle
      const allFiles: File[] = [];
      if (documents.proposal) allFiles.push(documents.proposal);
      if (documents.baselineStudy) allFiles.push(documents.baselineStudy);
      if (documents.monitoringPlan) allFiles.push(documents.monitoringPlan);
      if (documents.landRights) allFiles.push(documents.landRights);
      if (documents.photos) allFiles.push(...documents.photos);
      if (documents.reports) allFiles.push(...documents.reports);

      console.log('🎯 Documents organized by category:', documents);
      console.log('🎯 All files array created:', allFiles.length, 'files');
      console.log('🎯 Original files array:', files.length, 'files');
      console.log('🎯 All files details:', allFiles.map(f => ({ name: f.name, size: f.size })));

      const bundleResult = await uploadProjectDocuments(projectId, allFiles);
      
        console.log('Bundle result:', bundleResult);
        console.log('Bundle result documents:', bundleResult.documents);
        console.log('Bundle result documents length:', bundleResult.documents?.length);
        
        if (bundleResult.success && bundleResult.projectCid) {
          // Create uploaded docs from the actual uploaded documents with their individual CIDs
          const uploadedDocs = bundleResult.documents?.map(doc => ({
            name: doc.name,
            category: 'document', // We could improve this by mapping to original categories
            description: `Uploaded document: ${doc.name}`,
            cid: doc.cid, // Individual file CID
            size: doc.size,
            uploadedAt: new Date().toISOString(),
            ipfsUrl: doc.gateway // Direct URL to file
          })) || [];

          console.log('Uploaded docs created:', uploadedDocs);
          console.log('Total files uploaded:', uploadedDocs.length);
          console.log('Original files selected:', files.length);        setSuccess(`${uploadedDocs.length} documents uploaded successfully! Project CID: ${bundleResult.projectCid}`);
        setUploadedDocuments(uploadedDocs);
        
        // Set modal data and show success modal
        setModalData({
          projectCid: bundleResult.projectCid,
          documents: uploadedDocs
        });
        setShowSuccessModal(true);

        // Also set notification for non-modal display
        setSuccessNotification({
          message: `${uploadedDocs.length} documents uploaded to IPFS successfully!`,
          cid: bundleResult.projectCid
        });

        // Save to upload history
        const uploadProject: UploadProject = {
          id: UploadHistoryManager.generateId(),
          projectCID: bundleResult.projectCid,
          uploadDate: new Date().toISOString(),
          files: uploadedDocs.map(doc => ({
            id: UploadHistoryManager.generateId(),
            filename: doc.name,
            size: doc.size || 0,
            ipfsHash: doc.cid, // Use individual file CID
            uploadDate: new Date().toISOString(),
            projectCID: bundleResult.projectCid,
            fileType: 'application/octet-stream', // Default since we don't have contentType
            ipfsUrl: doc.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${doc.cid}` // Use proper file URL
          } as UploadedFile)),
          totalFiles: uploadedDocs.length,
          totalSize: uploadedDocs.reduce((total, doc) => total + (doc.size || 0), 0)
        };
        
        UploadHistoryManager.saveUploadProject(uploadProject);
        
        setFiles([]); // Clear file selection
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(bundleResult.projectCid, uploadedDocs);
        }
      } else {
        setError(bundleResult.error || 'Bundle upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setOverallProgress(0);
    }
  };

  const handleDownload = async (cid: string, filename: string) => {
    try {
      const result = await getFileFromIPFS(cid);
      
      if (result.success && result.data) {
        // Create download link
        const url = URL.createObjectURL(result.data);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
          <p className="text-sm text-gray-600">Project: <span className="font-medium">{projectId}</span></p>
        </div>
      </div>

      {/* Compact IPFS Status */}
      <div className="mb-4 p-2 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <p className="text-xs text-blue-700">
            IPFS Status: {process.env.NEXT_PUBLIC_PINATA_JWT ? 'Connected to Pinata' : 'Mock mode'}
          </p>
          <button
            onClick={() => console.log('IPFS Test')}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Test
          </button>
        </div>
      </div>

      {/* Compact Upload Button */}
      <div className="mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Upload Project Documents</span>
        </button>
        
        <input
          ref={fileInputRef}
          name="file-upload"
          type="file"
          className="sr-only"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx,.csv"
        />
        
        <p className="mt-2 text-xs text-gray-500 text-center">
          PDF, DOC, images, Excel, CSV - up to 50MB each
        </p>
      </div>

      {/* Compact Drag & Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg className="mx-auto h-6 w-6 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-xs text-gray-600">
            {dragActive 
              ? 'Release to add files' 
              : 'Or drag and drop files here'
            }
          </p>
        </div>
      </div>

      {/* Compact Progress Bar */}
      {uploading && overallProgress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Uploading</span>
            <span className="text-xs text-gray-500">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Compact Selected Files */}
      {files.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files ({files.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.cid && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Uploaded
                      </span>
                    )}
                    {file.error && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        ✗ Failed
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Compact Progress */}
                {uploading && file.uploadProgress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${file.uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
                
                {/* Compact Category and Description */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <select
                    value={file.category}
                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                    disabled={uploading}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="proposal">Proposal</option>
                    <option value="baselineStudy">Baseline</option>
                    <option value="monitoringPlan">Monitoring</option>
                    <option value="landRights">Land Rights</option>
                    <option value="photos">Photos</option>
                    <option value="reports">Reports</option>
                  </select>
                  
                  <input
                    type="text"
                    value={file.description || ''}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    disabled={uploading}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Description..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Submit Button */}
      {files.length > 0 && (
        <div className="mb-4">
          <div className="bg-gray-50 rounded p-2 mb-3">
            <p className="text-xs text-gray-700">
              <span className="font-medium">{files.length}</span> file{files.length > 1 ? 's' : ''} ready for upload
            </p>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading || !connected || files.some(f => f.error)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-sm">Submitting...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Submit Documents</span>
              </>
            )}
          </button>
          
          {!connected && (
            <p className="mt-2 text-xs text-red-600 text-center">
              Connect wallet to submit documents
            </p>
          )}
        </div>
      )}

      {/* Compact Status Messages */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded p-2">
          <p className="text-xs text-green-800">{success}</p>
        </div>
      )}

      {/* Compact Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents</h4>
          <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
            <div className="space-y-2">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-gray-500">{formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  {doc.cid && (
                    <button
                      onClick={() => handleDownload(doc.cid, doc.name)}
                      className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      View
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successNotification && (
        <SuccessNotification
          message={successNotification.message}
          cid={successNotification.cid}
          onClose={() => setSuccessNotification(null)}
        />
      )}

      {/* Success Modal with Document Details */}
      {showSuccessModal && modalData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          projectCid={modalData.projectCid}
          documents={modalData.documents}
        />
      )}
    </div>
  );
}