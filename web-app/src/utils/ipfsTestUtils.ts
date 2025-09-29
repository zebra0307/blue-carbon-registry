/**
 * IPFS Integration Test Utility
 * This file provides utilities to test the IPFS integration in the Blue Carbon Registry
 * To be run in a development environment for testing and debugging
 */
import { uploadFileToIPFS, uploadToIPFS } from './ipfs';
import { compressImage } from './imageUtils';

// Test data for IPFS uploads
const testProjectData = {
  id: 'test-project-001',
  title: 'Test Blue Carbon Project',
  description: 'This is a test project for IPFS integration',
  location: 'Test Location',
  carbonCredits: 1000,
  verificationStatus: 'pending' as const,
};

/**
 * Test IPFS metadata upload
 */
export async function testIPFSMetadataUpload(): Promise<void> {
  console.log('Testing IPFS metadata upload...');
  
  try {
    const result = await uploadToIPFS(testProjectData);
    
    if (result.success) {
      console.log('✅ IPFS metadata upload successful');
      console.log('CID:', result.cid);
      console.log('View metadata at:', `https://gateway.pinata.cloud/ipfs/${result.cid}`);
    } else {
      console.error('❌ IPFS metadata upload failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during IPFS metadata upload test:', error);
  }
}

/**
 * Create a test file in memory for IPFS upload testing
 */
function createTestFile(text: string = 'Test file content'): File {
  const blob = new Blob([text], { type: 'text/plain' });
  return new File([blob], 'test-file.txt', { type: 'text/plain' });
}

/**
 * Test IPFS file upload
 */
export async function testIPFSFileUpload(): Promise<void> {
  console.log('Testing IPFS file upload...');
  
  try {
    // Create a test file
    const testFile = createTestFile('Blue Carbon Registry IPFS integration test file');
    
    // Upload to IPFS
    const result = await uploadFileToIPFS(testFile);
    
    if (result.success) {
      console.log('✅ IPFS file upload successful');
      console.log('CID:', result.cid);
      console.log('Gateway URL:', result.gateway);
    } else {
      console.error('❌ IPFS file upload failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during IPFS file upload test:', error);
  }
}

/**
 * Test image compression and IPFS upload
 */
export async function testImageCompressionAndUpload(imageFile: File): Promise<any> {
  console.log('Testing image compression and IPFS upload...');
  console.log('Original image size:', Math.round(imageFile.size / 1024), 'KB');
  
  try {
    // Compress the image
    const compressedImage = await compressImage(imageFile);
    console.log('Compressed image size:', Math.round(compressedImage.size / 1024), 'KB');
    console.log('Compression ratio:', Math.round((1 - compressedImage.size / imageFile.size) * 100), '%');
    
    // Upload original image
    console.log('Uploading original image...');
    const originalResult = await uploadFileToIPFS(imageFile);
    
    if (originalResult.success) {
      console.log('✅ Original image upload successful');
      console.log('CID:', originalResult.cid);
      console.log('Gateway URL:', originalResult.gateway);
    } else {
      console.error('❌ Original image upload failed:', originalResult.error);
    }
    
    // Upload compressed image
    console.log('Uploading compressed image...');
    const compressedResult = await uploadFileToIPFS(compressedImage);
    
    if (compressedResult.success) {
      console.log('✅ Compressed image upload successful');
      console.log('CID:', compressedResult.cid);
      console.log('Gateway URL:', compressedResult.gateway);
    } else {
      console.error('❌ Compressed image upload failed:', compressedResult.error);
    }
    
    return {
      original: originalResult,
      compressed: compressedResult
    };
  } catch (error) {
    console.error('❌ Error during image compression and upload test:', error);
  }
}

/**
 * Test full project data upload with images
 */
export async function testFullProjectUpload(projectData: any, images: File[]): Promise<any> {
  console.log('Testing full project upload with images...');
  
  try {
    // First upload all images
    const imageCIDs = [];
    
    for (const image of images) {
      console.log(`Processing image: ${image.name}`);
      
      // Compress the image
      const compressedImage = await compressImage(image);
      console.log(`Compressed ${image.name} from ${Math.round(image.size / 1024)}KB to ${Math.round(compressedImage.size / 1024)}KB`);
      
      // Upload to IPFS
      const result = await uploadFileToIPFS(compressedImage);
      
      if (result.success && result.cid) {
        console.log(`✅ Uploaded image ${image.name} to IPFS: ${result.cid}`);
        imageCIDs.push(result.cid);
      } else {
        console.error(`❌ Failed to upload image ${image.name}:`, result.error);
      }
    }
    
    // Add image CIDs to project data
    const enhancedProjectData = {
      ...projectData,
      images: imageCIDs
    };
    
    // Upload project metadata
    console.log('Uploading project metadata...');
    const metadataResult = await uploadToIPFS(enhancedProjectData);
    
    if (metadataResult.success) {
      console.log('✅ Project metadata upload successful');
      console.log('Project CID:', metadataResult.cid);
      console.log('View project at:', `https://gateway.pinata.cloud/ipfs/${metadataResult.cid}`);
    } else {
      console.error('❌ Project metadata upload failed:', metadataResult.error);
    }
    
    return {
      success: metadataResult.success,
      projectCID: metadataResult.cid,
      imageCIDs
    };
  } catch (error) {
    console.error('❌ Error during full project upload test:', error);
  }
}