import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  TextInput,
  RadioButton,
  Surface,
  Chip,
  HelperText,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { v4 as uuidv4 } from 'uuid';

import { useDatabase } from '../providers/DatabaseProvider';
import { useLocation } from '../providers/LocationProvider';
import { FieldMeasurement, PhotoData, Project, FormData } from '../types';

// Validation schema
const measurementSchema = yup.object().shape({
  projectId: yup.string().required('Project is required'),
  measurementType: yup.string().required('Measurement type is required'),
  notes: yup.string().max(500, 'Notes must be less than 500 characters'),
  // Biomass fields
  treeCount: yup.number().when('measurementType', {
    is: 'biomass',
    then: (schema) => schema.min(0, 'Must be positive').required('Tree count is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  averageHeight: yup.number().when('measurementType', {
    is: 'biomass',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  averageDiameter: yup.number().when('measurementType', {
    is: 'biomass',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  canopyCover: yup.number().when('measurementType', {
    is: 'biomass',
    then: (schema) => schema.min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Soil fields
  soilDepth: yup.number().when('measurementType', {
    is: 'soil',
    then: (schema) => schema.min(0, 'Must be positive').required('Soil depth is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  carbonContent: yup.number().when('measurementType', {
    is: 'soil',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  ph: yup.number().when('measurementType', {
    is: 'soil',
    then: (schema) => schema.min(0, 'Must be positive').max(14, 'pH cannot exceed 14'),
    otherwise: (schema) => schema.notRequired(),
  }),
  salinity: yup.number().when('measurementType', {
    is: 'soil',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Water fields
  waterDepth: yup.number().when('measurementType', {
    is: 'water',
    then: (schema) => schema.min(0, 'Must be positive').required('Water depth is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  temperature: yup.number().when('measurementType', {
    is: 'water',
    then: (schema) => schema.min(-10, 'Temperature too low').max(50, 'Temperature too high'),
    otherwise: (schema) => schema.notRequired(),
  }),
  turbidity: yup.number().when('measurementType', {
    is: 'water',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Species fields
  speciesName: yup.string().when('measurementType', {
    is: 'species',
    then: (schema) => schema.required('Species name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  abundance: yup.number().when('measurementType', {
    is: 'species',
    then: (schema) => schema.min(0, 'Must be positive'),
    otherwise: (schema) => schema.notRequired(),
  }),
  healthStatus: yup.string().when('measurementType', {
    is: 'species',
    then: (schema) => schema.oneOf(['excellent', 'good', 'fair', 'poor'], 'Invalid health status'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const DataCollectionScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const { saveProject, getProjects, saveMeasurement } = useDatabase();
  const { getCurrentLocation, requestLocationPermission } = useLocation();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      projectId: '',
      measurementType: 'biomass',
      notes: '',
      treeCount: undefined,
      averageHeight: undefined,
      averageDiameter: undefined,
      canopyCover: undefined,
      soilDepth: undefined,
      carbonContent: undefined,
      ph: undefined,
      salinity: undefined,
      waterDepth: undefined,
      temperature: undefined,
      turbidity: undefined,
      speciesName: '',
      abundance: undefined,
      healthStatus: 'good',
    },
  });

  const measurementType = watch('measurementType');

  useEffect(() => {
    loadProjects();
    getCurrentLocationData();
  }, []);

  const loadProjects = async () => {
    try {
      const projectData = await getProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const getCurrentLocationData = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services to collect data.');
      return;
    }

    setIsSubmitting(true);

    try {
      const measurement: FieldMeasurement = {
        id: uuidv4(),
        projectId: data.projectId,
        timestamp: Date.now(),
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          altitude: currentLocation.altitude,
          accuracy: currentLocation.accuracy,
        },
        measurementType: data.measurementType,
        data: {
          ...(data.measurementType === 'biomass' && {
            treeCount: parseInt(data.treeCount) || 0,
            averageHeight: parseFloat(data.averageHeight) || 0,
            averageDiameter: parseFloat(data.averageDiameter) || 0,
            canopyCover: parseFloat(data.canopyCover) || 0,
          }),
          ...(data.measurementType === 'soil' && {
            soilDepth: parseFloat(data.soilDepth) || 0,
            carbonContent: parseFloat(data.carbonContent) || 0,
            ph: parseFloat(data.ph) || 0,
            salinity: parseFloat(data.salinity) || 0,
          }),
          ...(data.measurementType === 'water' && {
            waterDepth: parseFloat(data.waterDepth) || 0,
            temperature: parseFloat(data.temperature) || 0,
            turbidity: parseFloat(data.turbidity) || 0,
          }),
          ...(data.measurementType === 'species' && {
            speciesName: data.speciesName,
            abundance: parseInt(data.abundance) || 0,
            healthStatus: data.healthStatus,
          }),
        },
        photos,
        notes: data.notes,
        collectorId: 'current-user', // TODO: Get from user context
        synced: false,
      };

      await saveMeasurement(measurement);

      Alert.alert(
        'Success',
        'Measurement saved successfully!',
        [
          {
            text: 'Add Photos',
            onPress: () => navigation.navigate('Camera', { measurementId: measurement.id }),
          },
          {
            text: 'New Measurement',
            onPress: () => {
              reset();
              setPhotos([]);
              getCurrentLocationData();
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', 'Failed to save measurement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBiomassFields = () => (
    <View>
      <Controller
        control={control}
        name="treeCount"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Tree Count"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseInt(text) : undefined)}
            keyboardType="numeric"
            error={!!errors.treeCount}
            style={styles.input}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.treeCount}>
        {errors.treeCount?.message}
      </HelperText>

      <Controller
        control={control}
        name="averageHeight"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Average Height (m)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="averageDiameter"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Average Diameter (cm)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="canopyCover"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Canopy Cover (%)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
    </View>
  );

  const renderSoilFields = () => (
    <View>
      <Controller
        control={control}
        name="soilDepth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Soil Depth (cm)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            error={!!errors.soilDepth}
            style={styles.input}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.soilDepth}>
        {errors.soilDepth?.message}
      </HelperText>

      <Controller
        control={control}
        name="carbonContent"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Carbon Content (%)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="ph"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="pH Level"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="salinity"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Salinity (ppt)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
    </View>
  );

  const renderWaterFields = () => (
    <View>
      <Controller
        control={control}
        name="waterDepth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Water Depth (m)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            error={!!errors.waterDepth}
            style={styles.input}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.waterDepth}>
        {errors.waterDepth?.message}
      </HelperText>

      <Controller
        control={control}
        name="temperature"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Temperature (°C)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="turbidity"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Turbidity (NTU)"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
    </View>
  );

  const renderSpeciesFields = () => (
    <View>
      <Controller
        control={control}
        name="speciesName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Species Name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.speciesName}
            style={styles.input}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.speciesName}>
        {errors.speciesName?.message}
      </HelperText>

      <Controller
        control={control}
        name="abundance"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Abundance Count"
            value={value?.toString() || ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text ? parseInt(text) : undefined)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Text style={styles.fieldLabel}>Health Status</Text>
      <Controller
        control={control}
        name="healthStatus"
        render={({ field: { onChange, value } }) => (
          <RadioButton.Group onValueChange={onChange} value={typeof value === 'string' ? value : 'good'}>
            <View style={styles.radioGroup}>
              {['excellent', 'good', 'fair', 'poor'].map((status) => (
                <View key={status} style={styles.radioItem}>
                  <RadioButton value={status} />
                  <Text style={styles.radioLabel}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        )}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Field Data Collection</Title>
          
          {/* Location Status */}
          <Surface style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Icon 
                name={currentLocation ? 'location-on' : 'location-off'} 
                size={20} 
                color={currentLocation ? '#10b981' : '#ef4444'} 
              />
              <Text style={styles.locationText}>
                {currentLocation ? 'Location acquired' : 'Getting location...'}
              </Text>
            </View>
            {currentLocation && (
              <Text style={styles.coordinates}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                {currentLocation.accuracy && ` (±${currentLocation.accuracy.toFixed(0)}m)`}
              </Text>
            )}
          </Surface>

          {/* Project Selection */}
          <Text style={styles.fieldLabel}>Project *</Text>
          <Controller
            control={control}
            name="projectId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {projects.map((project) => (
                  <Chip
                    key={project.id}
                    mode={value === project.id ? 'flat' : 'outlined'}
                    selected={value === project.id}
                    onPress={() => onChange(project.id)}
                    style={styles.chip}
                  >
                    {project.name}
                  </Chip>
                ))}
              </View>
            )}
          />
          <HelperText type="error" visible={!!errors.projectId}>
            {errors.projectId?.message}
          </HelperText>

          {/* Measurement Type */}
          <Text style={styles.fieldLabel}>Measurement Type *</Text>
          <Controller
            control={control}
            name="measurementType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {[
                  { id: 'biomass', label: 'Biomass', icon: 'eco' },
                  { id: 'soil', label: 'Soil', icon: 'terrain' },
                  { id: 'water', label: 'Water', icon: 'water' },
                  { id: 'species', label: 'Species', icon: 'pets' },
                ].map((type) => (
                  <Chip
                    key={type.id}
                    mode={value === type.id ? 'flat' : 'outlined'}
                    selected={value === type.id}
                    onPress={() => onChange(type.id)}
                    icon={type.icon}
                    style={styles.chip}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            )}
          />

          {/* Dynamic Fields Based on Measurement Type */}
          <View style={styles.dynamicFields}>
            {measurementType === 'biomass' && renderBiomassFields()}
            {measurementType === 'soil' && renderSoilFields()}
            {measurementType === 'water' && renderWaterFields()}
            {measurementType === 'species' && renderSpeciesFields()}
          </View>

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Notes"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                error={!!errors.notes}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.notes}>
            {errors.notes?.message}
          </HelperText>

          {/* Photos */}
          <View style={styles.photosSection}>
            <Text style={styles.fieldLabel}>Photos ({photos.length})</Text>
            <Button
              mode="outlined"
              icon="camera"
              onPress={() => navigation.navigate('Camera')}
              style={styles.photoButton}
            >
              Add Photos
            </Button>
          </View>

          {/* Submit Buttons */}
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting || !currentLocation}
            >
              Save Measurement
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    margin: 16,
    marginBottom: 32,
  },
  locationCard: {
    padding: 12,
    marginVertical: 16,
    borderRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  coordinates: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  notesInput: {
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  dynamicFields: {
    marginTop: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  photosSection: {
    marginTop: 24,
  },
  photoButton: {
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default DataCollectionScreen;