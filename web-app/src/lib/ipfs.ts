/**
 * IPFS Service using Pinata
 * Handles file uploads and metadata storage for the Blue Carbon Registry
 */

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface FileUpload {
  file: File;
  name?: string;
  description?: string;
}

export class IPFSService {
  private readonly pinataJWT: string;
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly gateway: string;

  constructor() {
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
    this.gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

    if (!this.pinataJWT && !this.pinataApiKey) {
      console.warn('IPFS service initialized without Pinata credentials');
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   */
  async uploadFile({ file, name, description }: FileUpload): Promise<string> {
    try {
      // Check if credentials are available
      if (!this.pinataJWT && !this.pinataApiKey) {
        throw new Error('Pinata API credentials are not configured');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Add metadata with file type detection
      const fileType = file.type || this.detectMimeType(file.name);
      const isImage = fileType.startsWith('image/');
      
      const metadata = {
        name: name || file.name,
        keyvalues: {
          description: description || 'Blue Carbon Registry file',
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          fileSize: file.size.toString(),
          fileType: fileType,
          contentCategory: isImage ? 'image' : 'document',
          application: 'blue-carbon-registry'
        }
      };
      
      formData.append('pinataMetadata', JSON.stringify(metadata));

      // Add options - use different settings for images vs documents
      const options = {
        cidVersion: 1,
        wrapWithDirectory: false,
        // For large files like images, we want to use different pinning strategies
        pinataOptions: isImage ? {
          customPinPolicy: {
            regions: [
              {
                id: 'FRA1',
                desiredReplicationCount: 1
              },
              {
                id: 'NYC1',
                desiredReplicationCount: 1
              }
            ]
          }
        } : {}
      };
      
      formData.append('pinataOptions', JSON.stringify(options));

      console.log(`Uploading file to IPFS: ${file.name} (${file.size} bytes, ${fileType})`);
      
      const headers: Record<string, string> = {};
      
      // Use JWT if available, otherwise use API key/secret
      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else if (this.pinataApiKey && this.pinataSecretKey) {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
        
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const result: PinataResponse = await response.json();
      console.log(`✅ File uploaded to IPFS: ${result.IpfsHash} (${result.PinSize} bytes)`);
      return result.IpfsHash;
    } catch (error) {
      console.error('❌ Error uploading file to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Detect MIME type from file extension
   */
  private detectMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

/**
 * Upload JSON metadata to IPFS via Pinata
 */
async uploadJSON(data: any, name?: string): Promise<string> {
  try {
    // Check if credentials are available
    if (!this.pinataJWT && !this.pinataApiKey) {
      throw new Error('Pinata API credentials are not configured. Please set NEXT_PUBLIC_PINATA_JWT or PINATA_API_KEY environment variables');
    }

    // Clone data to avoid modifying the original object
    const safeData = JSON.parse(JSON.stringify(data));
    
    // Add metadata
    const metadata = {
      name: name || 'Blue Carbon Registry Metadata',
      keyvalues: {
        type: 'metadata',
        uploadedAt: new Date().toISOString(),
        application: 'blue-carbon-registry',
      }
    };

    const body = {
      pinataContent: safeData,
      pinataMetadata: metadata,
      pinataOptions: {
        cidVersion: 1,
      }
    };

    console.log('Uploading JSON to IPFS via Pinata...');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Use JWT if available, otherwise use API key/secret
    if (this.pinataJWT) {
      headers['Authorization'] = `Bearer ${this.pinataJWT}`;
    } else if (this.pinataApiKey && this.pinataSecretKey) {
      headers['pinata_api_key'] = this.pinataApiKey;
      headers['pinata_secret_api_key'] = this.pinataSecretKey;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        errorText = await response.text();
      }
      
      throw new Error(`Pinata API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const result: PinataResponse = await response.json();
    console.log('✅ JSON successfully uploaded to IPFS:', result.IpfsHash);
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Error uploading JSON to IPFS:', error);
    
    // Enhance error message with more details
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error uploading to IPFS';
      
    throw new Error(`IPFS upload failed: ${errorMessage}`);
  }
}  /**
   * Get the public gateway URL for an IPFS hash
   */
  getGatewayUrl(ipfsHash: string): string {
    return `${this.gateway}${ipfsHash}`;
  }

  /**
   * Fetch content from IPFS
   */
  async fetchFromIPFS(ipfsHash: string): Promise<any> {
    try {
      const url = this.getGatewayUrl(ipfsHash);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
      }

      // Try to parse as JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload project metadata with all associated documents
   */
  async uploadProjectMetadata(projectData: {
    projectId: string;
    name: string;
    description: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    area: number;
    carbonTonsEstimated: number;
    documents?: File[];
  }): Promise<string> {
    try {
      console.log('Uploading project metadata to IPFS...');

      // Upload documents first if any
      const documentHashes: string[] = [];
      if (projectData.documents && projectData.documents.length > 0) {
        for (const doc of projectData.documents) {
          const hash = await this.uploadFile({
            file: doc,
            name: `${projectData.projectId}-${doc.name}`,
            description: `Project document for ${projectData.name}`
          });
          documentHashes.push(hash);
        }
      }

      // Create complete metadata
      const metadata = {
        projectId: projectData.projectId,
        name: projectData.name,
        description: projectData.description,
        location: projectData.location,
        area: projectData.area,
        carbonTonsEstimated: projectData.carbonTonsEstimated,
        documents: documentHashes,
        createdAt: new Date().toISOString(),
        version: '1.0',
        standard: 'Blue Carbon Registry v1',
      };

      // Upload metadata
      const metadataHash = await this.uploadJSON(
        metadata, 
        `${projectData.projectId}-metadata`
      );

      console.log('Project metadata uploaded successfully:', metadataHash);
      return metadataHash;
    } catch (error) {
      console.error('Error uploading project metadata:', error);
      throw error;
    }
  }

  /**
   * Upload verification report
   */
  async uploadVerificationReport(reportData: {
    projectId: string;
    verifierName: string;
    methodology: string;
    carbonTonsVerified: number;
    verificationDate: Date;
    reportFile?: File;
  }): Promise<string> {
    try {
      console.log('Uploading verification report to IPFS...');

      // Upload report file if provided
      let reportFileHash: string | undefined;
      if (reportData.reportFile) {
        reportFileHash = await this.uploadFile({
          file: reportData.reportFile,
          name: `${reportData.projectId}-verification-report`,
          description: `Verification report for project ${reportData.projectId}`
        });
      }

      // Create verification metadata
      const verificationMetadata = {
        projectId: reportData.projectId,
        verifierName: reportData.verifierName,
        methodology: reportData.methodology,
        carbonTonsVerified: reportData.carbonTonsVerified,
        verificationDate: reportData.verificationDate.toISOString(),
        reportFile: reportFileHash,
        createdAt: new Date().toISOString(),
        standard: 'Blue Carbon Registry Verification v1',
      };

      const metadataHash = await this.uploadJSON(
        verificationMetadata,
        `${reportData.projectId}-verification-metadata`
      );

      console.log('Verification report uploaded successfully:', metadataHash);
      return metadataHash;
    } catch (error) {
      console.error('Error uploading verification report:', error);
      throw error;
    }
  }
}

// Singleton instance
export const ipfsService = new IPFSService();

// Helper functions for easy use
export const uploadToIPFS = async (data: any, name?: string): Promise<string> => {
  return await ipfsService.uploadJSON(data, name);
};

export const uploadFileToIPFS = async (file: File, name?: string, description?: string): Promise<string> => {
  return await ipfsService.uploadFile({ file, name, description });
};

export const getIPFSUrl = (hash: string): string => {
  return ipfsService.getGatewayUrl(hash);
};

export default ipfsService;