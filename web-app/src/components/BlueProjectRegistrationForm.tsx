'use client';

import React, { useState, useEffect } from 'react';
import { BlueProjectData, EcosystemType, CoBenefit, GeoLocation, ProjectPhoto } from '@/types/blueCarbon';
import FileUploadComponent from './FileUploadComponent';
import CameraCapture from './CameraCapture';
import { compressImage } from '@/utils/imageUtils';
import useGeolocation from '@/hooks/useGeolocation';

interface BlueProjectFormProps {
  onSubmit: (projectData: BlueProjectData) => Promise<void>;
  loading?: boolean;
}

export default function BlueProjectRegistrationForm({ onSubmit, loading = false }: BlueProjectFormProps) {
  // Initialize geolocation hook
  const geolocation = useGeolocation({ highAccuracy: true });
  
  const [formData, setFormData] = useState<Partial<BlueProjectData>>({
    ecosystemType: EcosystemType.MixedBlueCarbon,
    coBenefits: [],
    speciesComposition: [],
    location: {
      latitude: 0,
      longitude: 0,
      polygonCoordinates: [],
      countryCode: '',
      regionName: ''
    },
    photos: [],
    mediaIpfsCids: []
  });
  
  // Update location when geolocation data changes
  useEffect(() => {
    if (geolocation.latitude !== null && geolocation.longitude !== null) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location!,
          latitude: geolocation.latitude!,
          longitude: geolocation.longitude!
        }
      }));
    }
  }, [geolocation.latitude, geolocation.longitude]);
  
  const [uploadedDocuments, setUploadedDocuments] = useState<{name: string, ipfsHash: string}[]>([]);
  const [projectPhotos, setProjectPhotos] = useState<{
    file: File;
    caption: string;
    type: ProjectPhoto['type'];
    ipfsCid?: string;
    previewUrl?: string;
  }[]>([]);
  const [currentPhotoCaption, setCurrentPhotoCaption] = useState('');
  const [currentPhotoType, setCurrentPhotoType] = useState<ProjectPhoto['type']>('site');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ecosystemTypes = Object.values(EcosystemType);
  const coBenefitOptions = Object.values(CoBenefit);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: keyof GeoLocation, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location!,
        [field]: value
      }
    }));
  };

  const handleSpeciesAdd = (species: string) => {
    if (species && !formData.speciesComposition?.includes(species)) {
      setFormData(prev => ({
        ...prev,
        speciesComposition: [...(prev.speciesComposition || []), species]
      }));
    }
  };

  const handleCoBenefitToggle = (benefit: CoBenefit) => {
    setFormData(prev => {
      const currentBenefits = prev.coBenefits || [];
      const isSelected = currentBenefits.includes(benefit);
      
      return {
        ...prev,
        coBenefits: isSelected 
          ? currentBenefits.filter(b => b !== benefit)
          : [...currentBenefits, benefit]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Enhanced validation for all required fields
    const requiredFields: Array<{key: keyof BlueProjectData; label: string}> = [
      {key: 'projectId', label: 'Project ID'},
      {key: 'carbonTonsEstimated', label: 'Total Carbon Estimate'},
      {key: 'areaHectares', label: 'Area (Hectares)'},
      {key: 'biodiversityIndex', label: 'Biodiversity Index'}
    ];
    
    for (const field of requiredFields) {
      if (!formData[field.key]) {
        setError(`Please provide a value for ${field.label}`);
        return;
      }
    }
    
    if (!formData.location?.latitude || !formData.location?.longitude) {
      setError('Please provide valid location coordinates');
      return;
    }
    
    if (!formData.speciesCountBaseline) {
      setError('Please provide a baseline species count');
      return;
    }
    
    // If we get here, validation passed
    console.log('Form validation passed, proceeding with submission');
    setIsUploading(true);
    
    try {
      console.log('📦 Preparing project metadata for blockchain submission...');
      
      // Import IPFS service dynamically to handle metadata upload
      const { ipfsService } = await import('@/lib/ipfs');
      
      // Check if IPFS service is properly initialized with credentials
      if (!ipfsService) {
        throw new Error('IPFS service not initialized properly. Check your Pinata API credentials.');
      }
      
      // First, upload any project photos that haven't been uploaded yet
      console.log(`📸 Processing ${projectPhotos.length} project photos...`);
      const photoUploadPromises = projectPhotos
        .filter(photo => !photo.ipfsCid) // Only upload photos that don't have a CID yet
        .map(async (photo) => {
          try {
            console.log(`Uploading photo: ${photo.caption}`);
            const cid = await ipfsService.uploadFile({
              file: photo.file,
              name: `${formData.projectId}-photo-${Date.now()}`,
              description: photo.caption
            });
            
            return {
              ...photo,
              ipfsCid: cid
            };
          } catch (error) {
            console.error(`Failed to upload photo: ${photo.caption}`, error);
            throw new Error(`Failed to upload project photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        });
        
      // Wait for all photo uploads to complete
      const uploadedPhotos = await Promise.all(photoUploadPromises);
      
      // Update the project photos with their CIDs
      const allProjectPhotos = [
        ...projectPhotos.filter(photo => photo.ipfsCid), // Already uploaded photos
        ...uploadedPhotos // Newly uploaded photos
      ];
      
      console.log(`✅ Successfully uploaded ${uploadedPhotos.length} project photos`);
      
      // Convert to format for blockchain storage
      const photoDataForBlockchain: ProjectPhoto[] = allProjectPhotos.map(photo => ({
        ipfsCid: photo.ipfsCid!,
        caption: photo.caption,
        takenAt: new Date().toISOString(),
        type: photo.type,
        location: formData.location // Use project location as default for photos
      }));
      
      // Extract just the CIDs for the mediaIpfsCids field
      const mediaCids = photoDataForBlockchain.map(photo => photo.ipfsCid);
      
      // Create complete project metadata including uploaded documents and photos
      const projectMetadata = {
        ...formData,
        documents: uploadedDocuments,
        photos: photoDataForBlockchain,
        mediaIpfsCids: mediaCids,
        submittedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      console.log('☁️ Uploading complete project metadata to IPFS...');
      
      // Upload metadata to IPFS and get the CID
      let ipfsCid;
      try {
        ipfsCid = await ipfsService.uploadJSON(
          projectMetadata, 
          `project-${formData.projectId}-metadata`
        );
        console.log('✅ Project metadata uploaded to IPFS:', ipfsCid);
      } catch (ipfsError) {
        console.error('Failed to upload to IPFS:', ipfsError);
        throw new Error(`IPFS upload failed: ${ipfsError instanceof Error ? ipfsError.message : 'Unknown error'}`);
      }
      
      // Update form data with the generated IPFS CID and photo data
      const finalProjectData = {
        ...formData,
        ipfsCid,
        documents: uploadedDocuments,
        photos: photoDataForBlockchain,
        mediaIpfsCids: mediaCids
      } as BlueProjectData;
      
      // Update the form to show the generated CID
      setFormData(prev => ({ 
        ...prev, 
        ipfsCid,
        photos: photoDataForBlockchain,
        mediaIpfsCids: mediaCids
      }));
      
      console.log('🔗 Submitting to blockchain with data:', JSON.stringify(finalProjectData));
      try {
        await onSubmit(finalProjectData);
        
        // Clean up preview URLs to prevent memory leaks
        projectPhotos.forEach(photo => {
          if (photo.previewUrl) {
            URL.revokeObjectURL(photo.previewUrl);
          }
        });
        
        setSuccess(`✅ Project ${formData.projectId} successfully registered! 
          Metadata stored at IPFS: ${ipfsCid.substring(0, 12)}... 
          with ${photoDataForBlockchain.length} site photos`);
        
        // Reset the photo state
        setProjectPhotos([]);
        
      } catch (blockchainError) {
        console.error('Blockchain submission failed:', blockchainError);
        throw new Error(`Blockchain registration failed: ${blockchainError instanceof Error ? blockchainError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Error during project submission:', error);
      setError(error instanceof Error ? error.message : 'Error uploading project metadata. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Register Blue Carbon Project</h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID *
            </label>
            <input
              type="text"
              value={formData.projectId || ''}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metadata IPFS CID
            </label>
            <input
              type="text"
              value={formData.ipfsCid || ''}
              onChange={(e) => handleInputChange('ipfsCid', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Will be auto-generated when you submit"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be automatically generated when project metadata is uploaded to IPFS
            </p>
          </div>
        </div>

        {/* Ecosystem Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Ecosystem Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ecosystem Type
              </label>
              <select
                value={formData.ecosystemType}
                onChange={(e) => handleInputChange('ecosystemType', e.target.value as EcosystemType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {ecosystemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (Hectares)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.areaHectares || ''}
                onChange={(e) => handleInputChange('areaHectares', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biodiversity Index (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.biodiversityIndex || ''}
                onChange={(e) => handleInputChange('biodiversityIndex', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baseline Species Count
              </label>
              <input
                type="number"
                value={formData.speciesCountBaseline || ''}
                onChange={(e) => handleInputChange('speciesCountBaseline', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Geographic Location</h3>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={() => geolocation.requestLocation()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center"
              disabled={geolocation.loading || !geolocation.available}
            >
              {geolocation.loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting Location...
                </>
              ) : (
                <>📍 Get Current Location</>
              )}
            </button>
            {geolocation.error && (
              <p className="text-red-500 text-sm mt-1">
                Error getting location: {geolocation.error.message}
              </p>
            )}
            {geolocation.latitude && geolocation.longitude && (
              <p className="text-green-600 text-sm mt-1">
                Location found! Coordinates have been filled below.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location?.latitude || ''}
                onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location?.longitude || ''}
                onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Code
              </label>
              <input
                type="text"
                maxLength={3}
                value={formData.location?.countryCode || ''}
                onChange={(e) => handleLocationChange('countryCode', e.target.value.toUpperCase())}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="USA, CAN, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region Name
              </label>
              <input
                type="text"
                value={formData.location?.regionName || ''}
                onChange={(e) => handleLocationChange('regionName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="Florida Keys, Chesapeake Bay, etc."
              />
            </div>
          </div>
        </div>

        {/* Carbon Science */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Carbon Science Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Above Ground Biomass (tons C)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.aboveGroundBiomass || ''}
                onChange={(e) => handleInputChange('aboveGroundBiomass', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Below Ground Biomass (tons C)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.belowGroundBiomass || ''}
                onChange={(e) => handleInputChange('belowGroundBiomass', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Carbon 0-30cm (tons C)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.soilCarbon0To30cm || ''}
                onChange={(e) => handleInputChange('soilCarbon0To30cm', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Carbon 30-100cm (tons C)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.soilCarbon30To100cm || ''}
                onChange={(e) => handleInputChange('soilCarbon30To100cm', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Sequestration Rate (tons C/year)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sequestrationRateAnnual || ''}
                onChange={(e) => handleInputChange('sequestrationRateAnnual', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Carbon Estimate (tons)
              </label>
              <input
                type="number"
                value={formData.carbonTonsEstimated || ''}
                onChange={(e) => handleInputChange('carbonTonsEstimated', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Co-Benefits Selection */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Co-Benefits</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {coBenefitOptions.map(benefit => (
              <label key={benefit} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.coBenefits?.includes(benefit) || false}
                  onChange={() => handleCoBenefitToggle(benefit)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{benefit}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Compliance & Standards */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Standards & Compliance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VCS Methodology
              </label>
              <input
                type="text"
                value={formData.vcsMethodology || ''}
                onChange={(e) => handleInputChange('vcsMethodology', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                placeholder="e.g., VM0033"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permanence Guarantee (Years)
              </label>
              <input
                type="number"
                value={formData.permanenceGuaranteeYears || ''}
                onChange={(e) => handleInputChange('permanenceGuaranteeYears', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Project Photos */}
        <div className="bg-teal-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Project Site Photos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Take or upload photos of the project site, local ecosystem, monitoring equipment, or other 
            relevant visual documentation. Photos will be stored on IPFS and linked to your project record.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium text-teal-700 mb-3">Take a Photo</h4>
              <CameraCapture 
                onImageCapture={async (imageFile) => {
                  try {
                    // Compress the image before storing it
                    const optimizedImage = await compressImage(imageFile);
                    
                    // Create a preview URL
                    const previewUrl = URL.createObjectURL(optimizedImage);
                    
                    setProjectPhotos(prev => [
                      ...prev, 
                      {
                        file: optimizedImage,
                        caption: currentPhotoCaption || `Project site photo ${prev.length + 1}`,
                        type: currentPhotoType,
                        previewUrl
                      }
                    ]);
                    
                    // Reset caption
                    setCurrentPhotoCaption('');
                  } catch (error) {
                    console.error('Error processing captured image:', error);
                    setError('Failed to process the captured photo. Please try again.');
                  }
                }}
                previewSize={240}
                aspectRatio={4/3}
                onError={(errorMessage) => setError(errorMessage)}
              />
              
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Caption
                  </label>
                  <input
                    type="text"
                    value={currentPhotoCaption}
                    onChange={(e) => setCurrentPhotoCaption(e.target.value)}
                    placeholder="Describe what's in this photo"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Type
                  </label>
                  <select
                    value={currentPhotoType}
                    onChange={(e) => setCurrentPhotoType(e.target.value as ProjectPhoto['type'])}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="site">Site Overview</option>
                    <option value="species">Species/Biodiversity</option>
                    <option value="equipment">Monitoring Equipment</option>
                    <option value="monitoring">Monitoring Activity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-teal-700 mb-3">Project Photos ({projectPhotos.length})</h4>
              
              {projectPhotos.length === 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500">
                  <p>No photos added yet. Use the camera to take photos of the project site.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {projectPhotos.map((photo, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      {photo.previewUrl && (
                        <div className="h-32 overflow-hidden">
                          <img 
                            src={photo.previewUrl} 
                            alt={photo.caption}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-700 truncate">{photo.caption}</p>
                        <p className="text-xs text-gray-500">{photo.type}</p>
                        
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Remove photo from list
                              setProjectPhotos(prev => 
                                prev.filter((_, i) => i !== index)
                              );
                              
                              // Revoke preview URL to prevent memory leaks
                              if (photo.previewUrl) {
                                URL.revokeObjectURL(photo.previewUrl);
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Project Documents */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload supporting documents such as project design documents, environmental impact assessments, 
            baseline studies, monitoring plans, and other relevant files.
          </p>
          
          <FileUploadComponent
            onFileUploaded={(ipfsHash, fileName) => {
              setUploadedDocuments(prev => [...prev, { name: fileName, ipfsHash }]);
              console.log(`Document uploaded: ${fileName} -> ${ipfsHash}`);
            }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xlsx"
            maxSize={25}
            multiple={true}
            label="Upload Project Documents"
            description="Supported formats: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX (max 25MB each)"
            className="mb-4"
          />

          {uploadedDocuments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Documents for this project ({uploadedDocuments.length}):
              </h4>
              <div className="space-y-1">
                {uploadedDocuments.map((doc, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {doc.name} ({doc.ipfsHash.substring(0, 12)}...)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {success && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ecosystemType: EcosystemType.MixedBlueCarbon,
                  coBenefits: [],
                  speciesComposition: [],
                  location: {
                    latitude: 0,
                    longitude: 0,
                    polygonCoordinates: [],
                    countryCode: '',
                    regionName: ''
                  }
                });
                setUploadedDocuments([]);
                setSuccess(null);
                setError(null);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
            >
              Register Another Project
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {(loading || isUploading) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {isUploading ? 'Uploading to IPFS...' : 
               loading ? 'Registering on Blockchain...' : 
               'Register Blue Carbon Project'}
            </span>
          </button>
        </div>
      </form>
      
      {/* Debug toggle in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-right">
          <button
            type="button"
            onClick={() => {
              const debugInfo = {
                formData,
                uploadedDocuments,
                validationStatus: {
                  hasProjectId: Boolean(formData.projectId),
                  hasCarbon: Boolean(formData.carbonTonsEstimated),
                  hasArea: Boolean(formData.areaHectares),
                  hasLocation: Boolean(formData.location?.latitude && formData.location?.longitude),
                  hasSpecies: Boolean(formData.speciesCountBaseline)
                }
              };
              console.log('Debug info:', debugInfo);
              alert('Debug info logged to console');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Debug Form
          </button>
        </div>
      )}
    </div>
  );
}