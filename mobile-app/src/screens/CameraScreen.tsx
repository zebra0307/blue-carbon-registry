import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Button, Surface, TextInput, Modal, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { v4 as uuidv4 } from 'uuid';

import { useLocation } from '../providers/LocationProvider';
import { useDatabase } from '../providers/DatabaseProvider';
import { PhotoData } from '../types';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoType, setPhotoType] = useState<PhotoData['type']>('field');
  const [isSaving, setIsSaving] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const { getCurrentLocation } = useLocation();
  const { savePhoto: savePhotoToDatabase } = useDatabase();
  const [permission, requestPermission] = useCameraPermissions();

  const measurementId = route?.params?.measurementId;

  useEffect(() => {
    requestPermissions();
  }, []);

    const requestPermissions = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (result.granted) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } else {
        setHasPermission(true);
      }
      
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'Media library access is required to save photos.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: true,
      });

      setCapturedPhoto(photo.uri);
      setIsPreviewVisible(true);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const savePhotoToGallery = async (uri: string): Promise<string> => {
    try {
      // Create app directory in media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('BlueCarbon');
      
      if (album == null) {
        await MediaLibrary.createAlbumAsync('BlueCarbon', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return asset.uri;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      // If gallery save fails, keep the original URI
      return uri;
    }
  };

  const savePhoto = async () => {
    if (!capturedPhoto) return;

    setIsSaving(true);

    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(capturedPhoto);
      
      // Save to gallery
      const savedUri = await savePhotoToGallery(capturedPhoto);

      // Create photo data
      const photoData: PhotoData = {
        id: uuidv4(),
        uri: savedUri,
        timestamp: Date.now(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : undefined,
        type: photoType,
        description: photoDescription,
        fileSize: fileInfo.exists ? fileInfo.size : undefined,
        synced: false,
      };

      // Save to database
      await savePhotoToDatabase(photoData);

      Alert.alert(
        'Photo Saved',
        'Photo has been saved successfully!',
        [
          {
            text: 'Take Another',
            onPress: () => {
              setIsPreviewVisible(false);
              setCapturedPhoto(null);
              setPhotoDescription('');
              setPhotoType('field');
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsPreviewVisible(false);
    setPhotoDescription('');
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === 'off'
        ? 'on'
        : flashMode === 'on'
        ? 'auto'
        : 'off'
    );
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return 'flash-on';
      case 'auto':
        return 'flash-auto';
      default:
        return 'flash-off';
    }
  };  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Camera access denied</Text>
        <Button onPress={requestPermissions} mode="contained">
          Request Permissions
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
      >
        {/* Header Controls */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Field Camera</Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Icon name={getFlashIcon()} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
            <Icon name="flip-camera-ios" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.controlButton}>
            {/* Placeholder for symmetry */}
          </View>
        </View>

        {/* Grid Lines */}
        <View style={styles.gridContainer}>
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineVertical} />
          <View style={styles.gridLineVertical} />
        </View>
      </CameraView>

      {/* Photo Preview Modal */}
      <Portal>
        <Modal
          visible={isPreviewVisible}
          onDismiss={() => setIsPreviewVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.previewContainer}>
            {capturedPhoto && (
              <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
            )}
            
            <Surface style={styles.previewControls}>
              <Text style={styles.previewTitle}>Photo Details</Text>
              
              {/* Photo Type Selection */}
              <Text style={styles.fieldLabel}>Photo Type</Text>
              <View style={styles.typeButtons}>
                {[
                  { id: 'field', label: 'Field', icon: 'landscape' },
                  { id: 'equipment', label: 'Equipment', icon: 'build' },
                  { id: 'species', label: 'Species', icon: 'pets' },
                  { id: 'damage', label: 'Damage', icon: 'warning' },
                  { id: 'general', label: 'General', icon: 'photo' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      photoType === type.id && styles.typeButtonSelected,
                    ]}
                    onPress={() => setPhotoType(type.id as PhotoData['type'])}
                  >
                    <Icon 
                      name={type.icon} 
                      size={16} 
                      color={photoType === type.id ? 'white' : '#6b7280'} 
                    />
                    <Text style={[
                      styles.typeButtonText,
                      photoType === type.id && styles.typeButtonTextSelected,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description Input */}
              <TextInput
                label="Photo Description"
                value={photoDescription}
                onChangeText={setPhotoDescription}
                multiline
                numberOfLines={3}
                style={styles.descriptionInput}
              />

              <View style={styles.previewButtons}>
                <Button mode="outlined" onPress={retakePhoto} style={styles.previewButton}>
                  Retake
                </Button>
                <Button 
                  mode="contained" 
                  onPress={savePhoto} 
                  style={styles.previewButton}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Save Photo
                </Button>
              </View>
            </Surface>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  camera: {
    flex: 1,
    width: width,
    height: height,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: '33.33%',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    left: '33.33%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.9,
    height: width * 0.9 * (4/3), // 4:3 aspect ratio
    borderRadius: 12,
    marginBottom: 20,
  },
  previewControls: {
    width: width * 0.9,
    padding: 20,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  descriptionInput: {
    marginBottom: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default CameraScreen;