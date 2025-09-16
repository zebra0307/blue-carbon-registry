import { ProjectData } from './projectService';

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

/**
 * Upload project metadata to IPFS
 * For development, we'll simulate IPFS upload with a hash generation
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

    // In production, you would use Pinata, Infura, or another IPFS service
    // For now, we'll generate a mock CID
    const mockCid = generateMockCID(JSON.stringify(metadata));

    // Store in localStorage for development
    const storageKey = `ipfs-${mockCid}`;
    localStorage.setItem(storageKey, JSON.stringify(metadata));

    console.log('Mock IPFS upload successful:', { cid: mockCid, metadata });

    return {
      success: true,
      cid: mockCid,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchFromIPFS(cid: string): Promise<{ success: boolean; metadata?: IPFSMetadata; error?: string }> {
  try {
    // In production, you would fetch from IPFS gateway
    // For now, we'll retrieve from localStorage
    const storageKey = `ipfs-${cid}`;
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      throw new Error('Metadata not found');
    }

    const metadata = JSON.parse(storedData) as IPFSMetadata;

    return {
      success: true,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
    };
  }
}

/**
 * Upload file to IPFS (images, documents)
 */
export async function uploadFileToIPFS(file: File): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    // Generate mock CID for file
    const fileHash = await hashFile(file);
    const mockCid = `Qm${fileHash.substring(0, 44)}`;

    // In production, you would upload the actual file
    console.log('Mock file upload:', { fileName: file.name, size: file.size, cid: mockCid });

    return {
      success: true,
      cid: mockCid,
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File upload failed',
    };
  }
}

/**
 * Generate a mock CID for development
 */
function generateMockCID(data: string): string {
  // Simple hash function for mock CID generation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and create mock CID
  const positiveHash = Math.abs(hash).toString(16);
  return `QmYwAPJzv5CZsnA${positiveHash.padStart(39, '0')}`;
}

/**
 * Hash file content for mock CID generation
 */
async function hashFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const hash = generateMockCID(content);
      resolve(hash);
    };
    reader.readAsText(file);
  });
}

/**
 * Real IPFS integration functions (for production)
 */

/**
 * Upload to Pinata IPFS service (production)
 */
export async function uploadToPinata(
  metadata: IPFSMetadata
): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error('Pinata API keys not configured');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `Blue Carbon Project ${metadata.projectId}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      cid: result.IpfsHash,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pinata upload failed',
    };
  }
}

/**
 * Get IPFS gateway URL for accessing content
 */
export function getIPFSUrl(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${cid}`;
}