'use client';

import React, { useState, useEffect } from 'react';
import { testIPFSMetadataUpload, testIPFSFileUpload, testImageCompressionAndUpload } from '@/utils/ipfsTestUtils';
import { uploadFileToIPFS } from '@/utils/ipfs';
import { compressImage } from '@/utils/imageUtils';

export default function IPFSTestPage() {
  const [testStatus, setTestStatus] = useState<Record<string, {
    running: boolean;
    success?: boolean;
    message?: string;
    cid?: string;
    error?: string;
  }>>({
    metadata: { running: false },
    file: { running: false },
    image: { running: false },
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    original?: { cid?: string; size?: number };
    compressed?: { cid?: string; size?: number };
  }>({});

  const runMetadataTest = async () => {
    setTestStatus(prev => ({ ...prev, metadata: { running: true } }));
    try {
      await testIPFSMetadataUpload();
      setTestStatus(prev => ({ 
        ...prev, 
        metadata: { 
          running: false, 
          success: true, 
          message: 'Metadata upload test completed. See console for details.' 
        } 
      }));
    } catch (error) {
      setTestStatus(prev => ({ 
        ...prev, 
        metadata: { 
          running: false, 
          success: false, 
          message: 'Test failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const runFileTest = async () => {
    setTestStatus(prev => ({ ...prev, file: { running: true } }));
    try {
      await testIPFSFileUpload();
      setTestStatus(prev => ({ 
        ...prev, 
        file: { 
          running: false, 
          success: true, 
          message: 'File upload test completed. See console for details.' 
        } 
      }));
    } catch (error) {
      setTestStatus(prev => ({ 
        ...prev, 
        file: { 
          running: false, 
          success: false, 
          message: 'Test failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setCompressedFile(null);
      setUploadResults({});
    }
  };

  const compressSelectedImage = async () => {
    if (!selectedFile) return;
    
    try {
      const compressed = await compressImage(selectedFile);
      setCompressedFile(compressed);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  const uploadImage = async (isCompressed: boolean = false) => {
    const fileToUpload = isCompressed ? compressedFile : selectedFile;
    
    if (!fileToUpload) return;
    
    setTestStatus(prev => ({ ...prev, image: { running: true } }));
    
    try {
      const result = await uploadFileToIPFS(fileToUpload);
      
      if (result.success) {
        setUploadResults(prev => ({
          ...prev,
          [isCompressed ? 'compressed' : 'original']: {
            cid: result.cid,
            size: fileToUpload.size
          }
        }));
        
        setTestStatus(prev => ({ 
          ...prev, 
          image: { 
            running: false, 
            success: true, 
            message: `${isCompressed ? 'Compressed' : 'Original'} image uploaded successfully`, 
            cid: result.cid
          } 
        }));
      } else {
        setTestStatus(prev => ({ 
          ...prev, 
          image: { 
            running: false, 
            success: false, 
            message: 'Upload failed', 
            error: result.error
          } 
        }));
      }
    } catch (error) {
      setTestStatus(prev => ({ 
        ...prev, 
        image: { 
          running: false, 
          success: false, 
          message: 'Upload failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">IPFS Integration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Tests</h2>
          
          <div className="space-y-4">
            <div>
              <button 
                onClick={runMetadataTest}
                disabled={testStatus.metadata.running}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {testStatus.metadata.running ? 'Running...' : 'Test Metadata Upload'}
              </button>
              
              {testStatus.metadata.message && (
                <div className={`mt-2 p-2 rounded-md ${testStatus.metadata.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {testStatus.metadata.message}
                  {testStatus.metadata.error && (
                    <p className="text-red-600 text-sm">{testStatus.metadata.error}</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <button 
                onClick={runFileTest}
                disabled={testStatus.file.running}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {testStatus.file.running ? 'Running...' : 'Test File Upload'}
              </button>
              
              {testStatus.file.message && (
                <div className={`mt-2 p-2 rounded-md ${testStatus.file.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {testStatus.file.message}
                  {testStatus.file.error && (
                    <p className="text-red-600 text-sm">{testStatus.file.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Image Compression & Upload Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Image
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            {selectedFile && (
              <div>
                <p className="text-sm text-gray-600">
                  Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
                
                <div className="flex space-x-2 mt-2">
                  <button 
                    onClick={compressSelectedImage}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Compress Image
                  </button>
                  
                  <button 
                    onClick={() => uploadImage(false)}
                    disabled={testStatus.image.running}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {testStatus.image.running ? 'Uploading...' : 'Upload Original'}
                  </button>
                </div>
              </div>
            )}
            
            {compressedFile && (
              <div>
                <p className="text-sm text-gray-600">
                  Compressed file: {compressedFile.name} ({Math.round(compressedFile.size / 1024)} KB)
                </p>
                <p className="text-xs text-green-600">
                  Compression ratio: {Math.round((1 - compressedFile.size / selectedFile!.size) * 100)}%
                </p>
                
                <button 
                  onClick={() => uploadImage(true)}
                  disabled={testStatus.image.running}
                  className="px-3 py-1 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {testStatus.image.running ? 'Uploading...' : 'Upload Compressed'}
                </button>
              </div>
            )}
            
            {testStatus.image.message && (
              <div className={`mt-2 p-2 rounded-md ${testStatus.image.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {testStatus.image.message}
                {testStatus.image.cid && (
                  <p className="text-sm mt-1">
                    CID: {testStatus.image.cid}
                  </p>
                )}
                {testStatus.image.error && (
                  <p className="text-red-600 text-sm">{testStatus.image.error}</p>
                )}
              </div>
            )}
            
            {(uploadResults.original || uploadResults.compressed) && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Upload Results</h3>
                
                {uploadResults.original && (
                  <div className="mb-2">
                    <p className="text-sm">Original: {Math.round(uploadResults.original.size! / 1024)} KB</p>
                    <p className="text-xs text-gray-600">CID: {uploadResults.original.cid}</p>
                  </div>
                )}
                
                {uploadResults.compressed && (
                  <div className="mb-2">
                    <p className="text-sm">Compressed: {Math.round(uploadResults.compressed.size! / 1024)} KB</p>
                    <p className="text-xs text-gray-600">CID: {uploadResults.compressed.cid}</p>
                  </div>
                )}
                
                {uploadResults.original && uploadResults.compressed && (
                  <p className="text-xs text-green-600">
                    Storage savings: {Math.round((1 - uploadResults.compressed.size! / uploadResults.original.size!) * 100)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Console Output</h2>
        <p className="text-sm text-gray-600">
          Check the browser console (F12) for detailed test logs.
        </p>
      </div>
    </div>
  );
}