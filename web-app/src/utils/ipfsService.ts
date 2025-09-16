// IPFS Document Management Service using Helia
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

// Use a public IPFS gateway or set up your own
const IPFS_API_URL = process.env.NEXT_PUBLIC_IPFS_API_URL || 'https://ipfs.infura.io:5001';
const IPFS_PROJECT_ID = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;

let helia: any = null;
let fs: any = null;

export async function initializeIPFS() {
  if (!helia) {
    helia = await createHelia();
    fs = unixfs(helia);
  }
  return fs;
}

export interface ProjectDocument {
  name: string;
  file: File;
  category: 'proposal' | 'legal' | 'scientific' | 'monitoring' | 'verification';
  description?: string;
}

export interface DocumentMetadata {
  name: string;
  hash: string;
  size: number;
  mimeType: string;
  category: string;
  description?: string;
  uploadedAt: Date;
}

export async function uploadProjectDocuments(
  projectId: string,
  documents: ProjectDocument[]
): Promise<{ success: boolean; ipfsHash?: string; documentMetadata?: DocumentMetadata[]; error?: string }> {
  try {
    const fs = await initializeIPFS();
    const documentMetadata: DocumentMetadata[] = [];
    const uploadedFiles: any[] = [];

    // Upload each document individually
    for (const doc of documents) {
      console.log(`Uploading document: ${doc.name}`);
      
      const fileBuffer = await doc.file.arrayBuffer();
      const result = await fs.addFile({
        path: doc.name,
        content: new Uint8Array(fileBuffer),
      });

      const metadata: DocumentMetadata = {
        name: doc.name,
        hash: result.toString(),
        size: doc.file.size,
        mimeType: doc.file.type,
        category: doc.category,
        description: doc.description,
        uploadedAt: new Date(),
      };

      documentMetadata.push(metadata);
      uploadedFiles.push({
        path: doc.name,
        content: new Uint8Array(fileBuffer),
      });

      console.log(`Document ${doc.name} uploaded to IPFS:`, result.toString());
    }

    // Create a project document bundle
    const projectBundle = {
      projectId,
      version: 1,
      createdAt: new Date().toISOString(),
      documents: documentMetadata,
    };

    // Upload the bundle metadata
    const bundleContent = new TextEncoder().encode(JSON.stringify(projectBundle, null, 2));
    const bundleResult = await fs.addFile({
      path: `project-${projectId}-bundle.json`,
      content: bundleContent,
    });

    console.log('Project document bundle uploaded:', bundleResult.toString());

    return {
      success: true,
      ipfsHash: bundleResult.toString(),
      documentMetadata,
    };
  } catch (error) {
    console.error('Error uploading documents to IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload documents',
    };
  }
}

export async function retrieveProjectDocuments(
  ipfsHash: string
): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
  try {
    const fs = await initializeIPFS();
    
    // Retrieve the document bundle
    const chunks = [];
    for await (const chunk of fs.cat(ipfsHash)) {
      chunks.push(chunk);
    }
    
    const bundleData = Buffer.concat(chunks).toString();
    const bundle = JSON.parse(bundleData);
    
    console.log('Retrieved project bundle:', bundle);
    
    return {
      success: true,
      documents: bundle.documents,
    };
  } catch (error) {
    console.error('Error retrieving documents from IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve documents',
    };
  }
}

export async function downloadDocument(
  ipfsHash: string,
  filename: string
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const fs = await initializeIPFS();
    
    const chunks = [];
    for await (const chunk of fs.cat(ipfsHash)) {
      chunks.push(chunk);
    }
    
    const fileData = Buffer.concat(chunks);
    const blob = new Blob([fileData]);
    
    return {
      success: true,
      blob,
    };
  } catch (error) {
    console.error('Error downloading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download document',
    };
  }
}