export interface FieldMeasurement {
  id: string;
  projectId: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  measurementType: 'biomass' | 'soil' | 'water' | 'species';
  data: {
    // Biomass measurements
    treeCount?: number;
    averageHeight?: number;
    averageDiameter?: number;
    canopyCover?: number;
    
    // Soil measurements
    soilDepth?: number;
    carbonContent?: number;
    ph?: number;
    salinity?: number;
    
    // Water measurements
    waterDepth?: number;
    temperature?: number;
    turbidity?: number;
    
    // Species observations
    speciesName?: string;
    abundance?: number;
    healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  photos: PhotoData[];
  notes: string;
  collectorId: string;
  synced: boolean;
  syncedAt?: number;
}

export interface PhotoData {
  id: string;
  uri: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  type: 'field' | 'equipment' | 'species' | 'damage' | 'general';
  description: string;
  fileSize?: number;
  synced: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  ecosystemType: 'mangrove' | 'seagrass' | 'saltmarsh' | 'kelp';
  status: 'planning' | 'active' | 'monitoring' | 'completed';
  createdAt: number;
  measurements: FieldMeasurement[];
  totalArea: number; // in hectares
  estimatedCarbon: number; // in tonnes
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingMeasurements: number;
  pendingPhotos: number;
  syncInProgress: boolean;
  syncError?: string;
}

export interface DatabaseEntry {
  id: string;
  type: 'measurement' | 'project' | 'photo';
  data: any;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface FormData {
  projectId: string;
  measurementType: string;
  notes?: string;
  // Biomass measurements
  treeCount?: number;
  averageHeight?: number;
  averageDiameter?: number;
  canopyCover?: number;
  // Soil measurements
  soilDepth?: number;
  carbonContent?: number;
  ph?: number;
  salinity?: number;
  // Water measurements
  waterDepth?: number;
  temperature?: number;
  turbidity?: number;
  // Species observations
  speciesName?: string;
  abundance?: number;
  healthStatus?: string;
}