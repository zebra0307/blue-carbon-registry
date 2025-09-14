import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { FieldMeasurement, PhotoData, Project, DatabaseEntry } from '../types';

interface DatabaseContextType {
  saveMeasurement: (measurement: FieldMeasurement) => Promise<void>;
  getMeasurements: (projectId?: string) => Promise<FieldMeasurement[]>;
  savePhoto: (photo: PhotoData) => Promise<void>;
  getPhotos: (projectId?: string) => Promise<PhotoData[]>;
  saveProject: (project: Project) => Promise<void>;
  getProjects: () => Promise<Project[]>;
  getUnsyncedData: () => Promise<DatabaseEntry[]>;
  markAsSynced: (type: 'measurement' | 'photo', id: string) => Promise<void>;
  clearSyncedData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  getTotalCounts: () => Promise<{ measurements: number; photos: number; projects: number }>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const initializeDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('bluecarbon.db');
      
      // Create tables using new async API
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS measurements (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          altitude REAL,
          measurement_type TEXT NOT NULL,
          data TEXT NOT NULL,
          notes TEXT,
          synced INTEGER DEFAULT 0,
          synced_at INTEGER,
          created_at INTEGER NOT NULL
        );
      `);
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY,
          uri TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          latitude REAL,
          longitude REAL,
          description TEXT,
          photo_type TEXT NOT NULL,
          synced INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
      `);
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          ecosystem_type TEXT NOT NULL,
          location_name TEXT,
          latitude REAL,
          longitude REAL,
          status TEXT DEFAULT 'active',
          created_at INTEGER NOT NULL
        );
      `);
      
      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_measurements_project ON measurements(project_id);
      `);
      
      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_measurements_synced ON measurements(synced);
      `);
      
      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_photos_synced ON photos(synced);
      `);
      
      setDb(database);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  const saveMeasurement = async (measurement: FieldMeasurement): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      await db.runAsync(
        `INSERT INTO measurements (
          id, project_id, timestamp, latitude, longitude, altitude,
          measurement_type, data, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          measurement.id,
          measurement.projectId,
          measurement.timestamp,
          measurement.location.latitude,
          measurement.location.longitude,
          measurement.location.altitude || null,
          measurement.measurementType,
          JSON.stringify(measurement.data),
          measurement.notes || null,
          Date.now(),
        ]
      );
      console.log('Measurement saved successfully');
    } catch (error) {
      console.error('Error saving measurement:', error);
      throw error;
    }
  };

  const getMeasurements = async (projectId?: string): Promise<FieldMeasurement[]> => {
    if (!db) {
      return [];
    }

    try {
      const query = projectId 
        ? 'SELECT * FROM measurements WHERE project_id = ? ORDER BY timestamp DESC'
        : 'SELECT * FROM measurements ORDER BY timestamp DESC';
      
      const params = projectId ? [projectId] : [];
      const result = await db.getAllAsync(query, params);
      
      return result.map((row: any) => ({
        id: row.id,
        projectId: row.project_id,
        timestamp: row.timestamp,
        location: {
          latitude: row.latitude,
          longitude: row.longitude,
          altitude: row.altitude,
        },
        measurementType: row.measurement_type as 'biomass' | 'soil' | 'water' | 'species',
        data: JSON.parse(row.data || '{}'),
        photos: [], // Photos will be loaded separately
        notes: row.notes || '',
        collectorId: 'local', // Default collector ID for local data
        synced: row.synced === 1,
        syncedAt: row.synced_at,
      }));
    } catch (error) {
      console.error('Error getting measurements:', error);
      return [];
    }
  };

  const savePhoto = async (photo: PhotoData): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      await db.runAsync(
        `INSERT INTO photos (
          id, uri, timestamp, latitude, longitude, description, photo_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          photo.id,
          photo.uri,
          photo.timestamp,
          photo.location?.latitude || null,
          photo.location?.longitude || null,
          photo.description || null,
          photo.type,
          Date.now(),
        ]
      );
      console.log('Photo saved successfully');
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  };

  const getPhotos = async (projectId?: string): Promise<PhotoData[]> => {
    if (!db) {
      return [];
    }

    try {
      // Note: Photos don't have direct project_id, this could be enhanced
      const result = await db.getAllAsync('SELECT * FROM photos ORDER BY timestamp DESC');
      
      return result.map((row: any) => ({
        id: row.id,
        uri: row.uri,
        timestamp: row.timestamp,
        location: row.latitude && row.longitude ? {
          latitude: row.latitude,
          longitude: row.longitude,
        } : undefined,
        description: row.description,
        type: row.photo_type,
        synced: row.synced === 1,
      }));
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  };

  const saveProject = async (project: Project): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      await db.runAsync(
        `INSERT INTO projects (
          id, name, description, ecosystem_type, location_name, 
          latitude, longitude, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.id,
          project.name,
          project.description || null,
          project.ecosystemType,
          project.name, // Use name as location_name fallback
          project.location?.latitude || null,
          project.location?.longitude || null,
          project.status || 'active',
          Date.now(),
        ]
      );
      console.log('Project saved successfully');
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const getProjects = async (): Promise<Project[]> => {
    if (!db) {
      return [];
    }

    try {
      const result = await db.getAllAsync('SELECT * FROM projects ORDER BY created_at DESC');
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        ecosystemType: row.ecosystem_type as 'mangrove' | 'seagrass' | 'saltmarsh' | 'kelp',
        location: row.latitude && row.longitude ? {
          latitude: row.latitude,
          longitude: row.longitude,
          radius: 100, // Default radius
        } : { latitude: 0, longitude: 0, radius: 100 },
        status: row.status as 'planning' | 'active' | 'monitoring' | 'completed',
        createdAt: row.created_at,
        measurements: [], // Will be loaded separately
        totalArea: 0, // Default value
        estimatedCarbon: 0, // Default value
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  };

  const getUnsyncedData = async (): Promise<DatabaseEntry[]> => {
    if (!db) {
      return [];
    }

    try {
      const unsyncedData: DatabaseEntry[] = [];
      
      // Get unsynced measurements
      const measurements = await db.getAllAsync('SELECT * FROM measurements WHERE synced = 0');
      measurements.forEach((row: any) => {
        unsyncedData.push({
          id: row.id,
          type: 'measurement',
          data: {
            id: row.id,
            projectId: row.project_id,
            timestamp: row.timestamp,
            location: {
              latitude: row.latitude,
              longitude: row.longitude,
              altitude: row.altitude,
            },
            measurementType: row.measurement_type,
            data: JSON.parse(row.data || '{}'),
            notes: row.notes,
            synced: false,
          },
          createdAt: row.created_at,
          updatedAt: row.created_at,
          synced: false,
        });
      });
      
      // Get unsynced photos
      const photos = await db.getAllAsync('SELECT * FROM photos WHERE synced = 0');
      photos.forEach((row: any) => {
        unsyncedData.push({
          id: row.id,
          type: 'photo',
          data: {
            id: row.id,
            uri: row.uri,
            timestamp: row.timestamp,
            location: row.latitude && row.longitude ? {
              latitude: row.latitude,
              longitude: row.longitude,
            } : undefined,
            description: row.description,
            type: row.photo_type,
            synced: false,
          },
          createdAt: row.created_at,
          updatedAt: row.created_at,
          synced: false,
        });
      });
      
      return unsyncedData;
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      return [];
    }
  };

  const markAsSynced = async (type: 'measurement' | 'photo', id: string): Promise<void> => {
    if (!db) {
      return;
    }

    try {
      const table = type === 'measurement' ? 'measurements' : 'photos';
      await db.runAsync(
        `UPDATE ${table} SET synced = 1, synced_at = ? WHERE id = ?`,
        [Date.now(), id]
      );
      console.log(`${type} marked as synced:`, id);
    } catch (error) {
      console.error(`Error marking ${type} as synced:`, error);
    }
  };

  const clearSyncedData = async (): Promise<void> => {
    if (!db) {
      return;
    }

    try {
      await db.runAsync('DELETE FROM measurements WHERE synced = 1');
      await db.runAsync('DELETE FROM photos WHERE synced = 1');
      console.log('Synced data cleared');
    } catch (error) {
      console.error('Error clearing synced data:', error);
    }
  };

  const clearAllData = async (): Promise<void> => {
    if (!db) {
      return;
    }

    try {
      await db.runAsync('DELETE FROM measurements');
      await db.runAsync('DELETE FROM photos');
      await db.runAsync('DELETE FROM projects');
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  const getTotalCounts = async (): Promise<{ measurements: number; photos: number; projects: number }> => {
    if (!db) {
      return { measurements: 0, photos: 0, projects: 0 };
    }

    try {
      const measurementCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM measurements');
      const photoCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM photos');
      const projectCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM projects');
      
      return {
        measurements: (measurementCount as any)?.count || 0,
        photos: (photoCount as any)?.count || 0,
        projects: (projectCount as any)?.count || 0,
      };
    } catch (error) {
      console.error('Error getting total counts:', error);
      return { measurements: 0, photos: 0, projects: 0 };
    }
  };

  const contextValue: DatabaseContextType = {
    saveMeasurement,
    getMeasurements,
    savePhoto,
    getPhotos,
    saveProject,
    getProjects,
    getUnsyncedData,
    markAsSynced,
    clearSyncedData,
    clearAllData,
    getTotalCounts,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};
