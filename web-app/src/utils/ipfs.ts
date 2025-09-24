import { ProjectData } from './projectService';

// IPFS Configuration
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
const IPFS_API_URL = process.env.NEXT_PUBLIC_IPFS_API_URL || 'https://ipfs.infura.io:5001';
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// Dynamic import for IPFS client (client-side only)
let ipfsClient: any = null;

const initializeIPFSClient = async () => {
  if (typeof window === 'undefined') {
    // Skip initialization on server side
    return null;
  }
  
  if (ipfsClient) {
    return ipfsClient;
  }

  try {
    const { create } = await import('ipfs-http-client');
    ipfsClient = create({
      url: IPFS_API_URL,
      timeout: 10000
    });
    return ipfsClient;
  } catch (error) {
    console.warn('IPFS client initialization failed, falling back to Pinata:', error);
    return null;
  }
};

export interface IPFSMetadata {
  projectId: string;
  title: string;
  description: string;
  location: string;
  carbonCredits: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  images?: string[];
  documents?: string[];
  timestamp: number;
  version: string;
}

// ========== DOCUMENT UPLOAD FUNCTIONS ==========

/**
 * Upload project metadata to IPFS with real or mock implementation
 */
export async function uploadToIPFS(projectData: ProjectData): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const metadata: IPFSMetadata = {
      projectId: projectData.id,
      title: projectData.title,
      description: projectData.description,
      location: projectData.location,
      carbonCredits: projectData.carbonCredits,
      verificationStatus: projectData.verificationStatus,
      timestamp: Date.now(),
      version: '1.0.0',
    };

    // Try Pinata IPFS upload first (using JWT or API keys)
    if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
      console.log('🚀 Using Pinata for IPFS upload...');
      return await uploadToPinata(metadata);
    }

    // Fallback to IPFS client
    const client = await initializeIPFSClient();
    if (client) {
      console.log('🔄 Using IPFS client for upload...');
      return await uploadToIPFSClient(metadata, client);
    }

    // Final fallback to mock implementation for development
    console.log('⚠️  Using mock IPFS for development...');
    return uploadToMockIPFS(metadata);
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a single file to IPFS
 */
export async function uploadFileToIPFS(file: File): Promise<{
  success: boolean;
  cid?: string;
  error?: string;
  gateway?: string;
}> {
  try {
    // Client-side only check
    if (typeof window === 'undefined') {
      throw new Error('File upload only available on client side');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB for free tier)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Try Pinata first if available (using JWT or API keys)
    if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
      console.log('🚀 Uploading file to Pinata IPFS...');
      return await uploadFileToPinata(file);
    }

    // Try IPFS client
    const client = await initializeIPFSClient();
    if (client) {
      console.log('🔄 Uploading file via IPFS client...');
      return await uploadFileToIPFSClient(file, client);
    }

    // Fallback to mock implementation
    console.log('⚠️  Using mock IPFS for file upload...');
    return uploadFileToMockIPFS(file);
  } catch (error: any) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message || 'File upload failed',
    };
  }
}

// ========== PRIVATE UPLOAD FUNCTIONS ==========

/**
 * Upload metadata to IPFS client
 */
async function uploadToIPFSClient(metadata: IPFSMetadata, client: any): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const result = await client.add(JSON.stringify(metadata));
    return {
      success: true,
      cid: result.cid.toString(),
    };
  } catch (error: any) {
    console.error('IPFS client upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload file to IPFS client
 */
async function uploadFileToIPFSClient(file: File, client: any): Promise<{
  success: boolean;
  cid?: string;
  error?: string;
  gateway?: string;
}> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const result = await client.add({
      path: file.name,
      content: new Uint8Array(fileBuffer)
    });

    const gateway = `${IPFS_GATEWAY}${result.cid.toString()}`;

    return {
      success: true,
      cid: result.cid.toString(),
      gateway
    };
  } catch (error: any) {
    console.error('IPFS client upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload to Pinata IPFS service
 */
async function uploadToPinata(metadata: IPFSMetadata): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    // Prepare headers - use JWT if available, otherwise use API key/secret
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    } else {
      throw new Error('No Pinata credentials found');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `blue-carbon-project-${metadata.projectId}`,
          keyvalues: {
            project: metadata.title,
            location: metadata.location,
            type: 'project-metadata'
          }
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully uploaded to IPFS via Pinata:', result.IpfsHash);
    
    return {
      success: true,
      cid: result.IpfsHash,
    };
  } catch (error: any) {
    console.error('❌ Pinata upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload file to Pinata
 */
async function uploadFileToPinata(file: File): Promise<{
  success: boolean;
  cid?: string;
  error?: string;
  gateway?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
      keyvalues: {
        originalName: file.name,
        fileSize: file.size.toString(),
        fileType: file.type,
        uploadedBy: 'blue-carbon-registry',
        timestamp: new Date().toISOString()
      }
    }));

    // Prepare headers - use JWT if available, otherwise use API key/secret
    const headers: Record<string, string> = {};
    
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    } else {
      throw new Error('No Pinata credentials found');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata file upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const gateway = `${IPFS_GATEWAY}${result.IpfsHash}`;
    
    console.log('✅ Successfully uploaded file to IPFS via Pinata:', {
      fileName: file.name,
      cid: result.IpfsHash,
      gateway
    });

    return {
      success: true,
      cid: result.IpfsHash,
      gateway,
    };
  } catch (error: any) {
    console.error('❌ Pinata file upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mock IPFS implementation for development
 */
function uploadToMockIPFS(metadata: IPFSMetadata): Promise<{ success: boolean; cid?: string; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      console.log('Mock IPFS upload:', { metadata, cid: mockCid });
      resolve({
        success: true,
        cid: mockCid,
      });
    }, 1000);
  });
}

/**
 * Mock file upload for development
 */
function uploadFileToMockIPFS(file: File): Promise<{
  success: boolean;
  cid?: string;
  error?: string;
  gateway?: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const gateway = `${IPFS_GATEWAY}${mockCid}`;
      
      console.log('Mock IPFS file upload:', { 
        fileName: file.name, 
        fileSize: file.size,
        cid: mockCid,
        gateway 
      });
      
      resolve({
        success: true,
        cid: mockCid,
        gateway,
      });
    }, 1500);
  });
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get file from IPFS
 */
export async function getFileFromIPFS(cid: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('File retrieval only available on client side');
    }

    const url = `${IPFS_GATEWAY}${cid}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('IPFS file retrieval error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Validate file for upload
 */
export function validateProjectFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'application/pdf',
    'text/plain',
    'application/json',
    // Microsoft Office documents
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    // Additional common types
    'application/octet-stream', // Generic binary
    'text/csv',
  ];

  // Also check file extensions as backup
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.xls', '.xlsx', '.csv'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  
  if (!isValidType) {
    return {
      valid: false,
      error: `File type not supported. Please upload: ${allowedExtensions.join(', ')}`,
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB (increased from 10MB)
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 50MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== BATCH UPLOAD FUNCTIONS ==========

/**
 * Upload multiple files to IPFS
 */
export async function uploadFilesToIPFS(files: File[]): Promise<{
  success: boolean;
  results?: Array<{ file: File; cid?: string; error?: string; gateway?: string }>;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Batch upload only available on client side');
    }

    console.log('🚀 uploadFilesToIPFS: Starting upload for', files.length, 'files');
    console.log('🚀 Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    const results = [];
    
    for (const file of files) {
      console.log('🔍 Processing file:', file.name);
      const validation = validateProjectFile(file);
      if (!validation.valid) {
        console.log('❌ File validation failed for', file.name, ':', validation.error);
        results.push({
          file,
          error: validation.error,
        });
        continue;
      }

      console.log('✅ File validation passed for', file.name);
      
      try {
        const result = await uploadFileToIPFS(file);
        console.log('📤 Upload result for', file.name, ':', result);
        results.push({
          file,
          cid: result.cid,
          error: result.error,
          gateway: result.gateway,
        });
      } catch (error: any) {
        console.log('❌ Upload error for', file.name, ':', error.message);
        results.push({
          file,
          error: error.message,
        });
      }
    }

    console.log('🏁 uploadFilesToIPFS: Completed with', results.length, 'results');
    console.log('🏁 Results summary:', results.map(r => ({ 
      name: r.file.name, 
      success: !!r.cid && !r.error,
      cid: r.cid,
      error: r.error 
    })));

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error('Batch upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload project documents with metadata
 */
export async function uploadProjectDocuments(
  projectId: string,
  files: File[],
  metadata?: any
): Promise<{
  success: boolean;
  projectCid?: string;
  documents?: Array<{ name: string; cid: string; gateway: string; type: string; size: number }>;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Project upload only available on client side');
    }

    console.log('📋 uploadProjectDocuments: Starting for', files.length, 'files');

    // Upload all files
    const fileResults = await uploadFilesToIPFS(files);
    
    if (!fileResults.success || !fileResults.results) {
      throw new Error('Failed to upload files');
    }

    console.log('📋 uploadProjectDocuments: File upload results:', fileResults.results.length, 'results');

    // Process successful uploads
    const documents = fileResults.results
      .filter(result => result.cid && !result.error)
      .map(result => ({
        name: result.file.name,
        cid: result.cid!,
        gateway: result.gateway!,
        type: result.file.type,
        size: result.file.size,
      }));

    console.log('📋 uploadProjectDocuments: Filtered to', documents.length, 'successful documents');
    console.log('📋 Documents:', documents.map(d => ({ name: d.name, cid: d.cid })));

    // Create project metadata
    const projectMetadata = {
      projectId,
      documents,
      metadata,
      timestamp: Date.now(),
      version: '1.0.0',
    };

    // Upload project metadata
    const metadataResult = await uploadToPinata(projectMetadata as any);
    
    if (!metadataResult.success) {
      throw new Error('Failed to upload project metadata');
    }

    console.log('📋 uploadProjectDocuments: Returning', documents.length, 'documents');

    return {
      success: true,
      projectCid: metadataResult.cid,
      documents,
    };
  } catch (error: any) {
    console.error('Project upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}