'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import DocumentUpload to prevent SSR issues
const DocumentUploadComponent = dynamic(
  () => import('./DocumentUpload'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading document upload...</span>
      </div>
    ),
  }
);

interface DocumentUploadWrapperProps {
  projectId: string;
  onUploadComplete?: (ipfsHash: string, documents: any[]) => void;
}

export default function DocumentUploadWrapper({ projectId, onUploadComplete }: DocumentUploadWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading document upload...</span>
      </div>
    );
  }

  return (
    <DocumentUploadComponent 
      projectId={projectId} 
      onUploadComplete={onUploadComplete} 
    />
  );
}