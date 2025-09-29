'use client';

import React, { useState, useRef, useCallback } from 'react';

interface CameraCaptureProps {
  onImageCapture: (imageFile: File) => void;
  aspectRatio?: number; // width/height, default 4:3
  previewSize?: number; // preview size in pixels (square), default 300
  onError?: (error: string) => void;
}

export default function CameraCapture({ 
  onImageCapture, 
  aspectRatio = 4/3,
  previewSize = 300,
  onError 
}: CameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Calculate dimensions
  const videoHeight = previewSize;
  const videoWidth = previewSize * aspectRatio;

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      // Reset any previous state
      setCameraError(null);
      setCapturedImage(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access");
      }
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      // Store stream in ref to stop it later
      mediaStreamRef.current = stream;
      
      // Set video source to the camera stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraActive(true);
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      setCameraError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [onError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Take photo from current video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError('Camera reference not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setCameraError('Could not get canvas context');
      return;
    }

    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame on canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const imageFile = new File(
          [blob], 
          `blue-carbon-photo-${Date.now()}.jpg`, 
          { type: 'image/jpeg' }
        );
        
        // Create a preview URL for display
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        // Call the callback with the captured image file
        onImageCapture(imageFile);
        
        // Stop the camera after capturing
        stopCamera();
      } else {
        setCameraError('Failed to process captured image');
      }
    }, 'image/jpeg', 0.95); // High quality JPEG
    
  }, [onImageCapture, stopCamera]);

  // Retake photo (restart camera)
  const retakePhoto = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage); // Clean up
      setCapturedImage(null);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  return (
    <div className="camera-capture flex flex-col items-center">
      {/* Show camera error if any */}
      {cameraError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm w-full">
          {cameraError}
        </div>
      )}
      
      {/* Camera preview or captured image */}
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100"
           style={{ width: videoWidth, height: videoHeight }}>
        {cameraActive && (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        
        {!cameraActive && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Click Start Camera to take a photo
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for processing the photo */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Camera controls */}
      <div className="mt-4 space-x-2">
        {!cameraActive && !capturedImage && (
          <button
            type="button"
            onClick={startCamera}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Camera
          </button>
        )}
        
        {cameraActive && (
          <button
            type="button"
            onClick={capturePhoto}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Take Photo
          </button>
        )}
        
        {capturedImage && (
          <button
            type="button"
            onClick={retakePhoto}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Retake Photo
          </button>
        )}
      </div>
    </div>
  );
}