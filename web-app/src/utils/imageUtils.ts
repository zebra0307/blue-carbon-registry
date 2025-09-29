/**
 * Image utilities for processing and optimizing photos before IPFS upload
 */

/**
 * Compresses an image file for efficient storage
 * @param file The original image file
 * @param maxWidth Maximum width in pixels
 * @param quality JPEG quality (0-1)
 * @returns Promise with compressed File object
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1600,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Get original file extension or default to jpg
              const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
              const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
              
              // Create a new file with optimized data
              const optimizedFile = new File(
                [blob],
                `${file.name.split('.')[0]}-optimized.${extension}`,
                { type: mimeType }
              );
              
              resolve(optimizedFile);
              
              // Log compression results
              const compressionRatio = ((file.size - blob.size) / file.size * 100).toFixed(1);
              console.log(`Image optimized: ${compressionRatio}% size reduction, ${width}x${height}px`);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
    } catch (error) {
      console.error('Image compression error:', error);
      reject(error);
    }
  });
}

/**
 * Extracts EXIF data from an image if available
 */
export async function extractImageMetadata(file: File): Promise<{
  timestamp?: Date;
  location?: { latitude: number; longitude: number };
  orientation?: number;
  make?: string;
  model?: string;
}> {
  // This is a placeholder - in a real implementation,
  // you would use a library like exif.js to extract this data
  
  return {};
}