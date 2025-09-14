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
      const database = SQLite.openDatabase('bluecarbon.db');
      
      // Create tables using transaction
      database.transaction((tx) => {
        tx.executeSql(`
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
        
        tx.executeSql(`
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
        
        tx.executeSql(`
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
        
        tx.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_measurements_project ON measurements(project_id);
        `);
        
        tx.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_measurements_synced ON measurements(synced);
        `);
        
        tx.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_photos_synced ON photos(synced);
        `);
      });
      
      setDb(database);
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  const saveMeasurement = async (measurement: FieldMeasurement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction((tx) => {
        tx.executeSql(
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
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getMeasurements = async (projectId?: string): Promise<FieldMeasurement[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = projectId 
        ? 'SELECT * FROM measurements WHERE project_id = ? ORDER BY timestamp DESC'
        : 'SELECT * FROM measurements ORDER BY timestamp DESC';
      const params = projectId ? [projectId] : [];

      db.transaction((tx) => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const measurements: FieldMeasurement[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              measurements.push({
                id: row.id,
                projectId: row.project_id,
                timestamp: row.timestamp,
                location: {
                  latitude: row.latitude,
                  longitude: row.longitude,
                  altitude: row.altitude,
                },
                measurementType: row.measurement_type,
                data: JSON.parse(row.data),
                notes: row.notes,
                photos: [], // TODO: Load associated photos
                collectorId: 'mobile-user', // TODO: Get from user context
                synced: row.synced === 1,
              });
            }
            resolve(measurements);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const savePhoto = async (photo: PhotoData): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction((tx) => {
        tx.executeSql(
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
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getPhotos = async (projectId?: string): Promise<PhotoData[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // For now, we'll get all photos. In the future, we could link photos to projects
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM photos ORDER BY timestamp DESC',
          [],
          (_, { rows }) => {
            const photos: PhotoData[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              photos.push({
                id: row.id,
                uri: row.uri,
                timestamp: row.timestamp,
                location: row.latitude ? {
                  latitude: row.latitude,
                  longitude: row.longitude,
                } : undefined,
                description: row.description,
                type: row.photo_type,
                synced: row.synced === 1,
              });
            }
            resolve(photos);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const saveProject = async (project: Project): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO projects (
            id, name, description, ecosystem_type, location_name, 
            latitude, longitude, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            project.id,
            project.name,
            project.description || null,
            project.ecosystemType,
            `${project.location.latitude}, ${project.location.longitude}`,
            project.location.latitude,
            project.location.longitude,
            project.status || 'active',
            Date.now(),
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getProjects = async (): Promise<Project[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM projects ORDER BY created_at DESC',
          [],
          (_, { rows }) => {
            const projects: Project[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              projects.push({
                id: row.id,
                name: row.name,
                description: row.description,
                ecosystemType: row.ecosystem_type,
                location: {
                  latitude: row.latitude,
                  longitude: row.longitude,
                  radius: 100, // Default radius
                },
                status: row.status,
                createdAt: row.created_at,
                measurements: [], // TODO: Load measurements
                totalArea: 0, // TODO: Calculate from measurements
                estimatedCarbon: 0, // TODO: Calculate from measurements
              });
            }
            resolve(projects);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getUnsyncedData = async (): Promise<DatabaseEntry[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const entries: DatabaseEntry[] = [];

      db.transaction((tx) => {
        // Get unsynced measurements
        tx.executeSql(
          'SELECT * FROM measurements WHERE synced = 0',
          [],
          (_, { rows }) => {
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              entries.push({
                id: row.id,
                type: 'measurement',
                data: JSON.parse(row.data),
                createdAt: row.created_at,
                updatedAt: row.created_at,
                synced: row.synced === 1,
              });
            }
          }
        );

        // Get unsynced photos
        tx.executeSql(
          'SELECT * FROM photos WHERE synced = 0',
          [],
          (_, { rows }) => {
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              entries.push({
                id: row.id,
                type: 'photo',
                data: { uri: row.uri, description: row.description },
                createdAt: row.created_at,
                updatedAt: row.created_at,
                synced: row.synced === 1,
              });
            }
            resolve(entries);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const markAsSynced = async (type: 'measurement' | 'photo', id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const table = type === 'measurement' ? 'measurements' : 'photos';
      
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE ${table} SET synced = 1, synced_at = ? WHERE id = ?`,
          [Date.now(), id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const clearSyncedData = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM measurements WHERE synced = 1 AND synced_at < ?',
          [thirtyDaysAgo]
        );
        
        tx.executeSql(
          'DELETE FROM photos WHERE synced = 1 AND created_at < ?',
          [thirtyDaysAgo],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const clearAllData = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction((tx) => {
        tx.executeSql('DELETE FROM measurements');
        tx.executeSql('DELETE FROM photos');
        tx.executeSql(
          'DELETE FROM projects',
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getTotalCounts = async (): Promise<{ measurements: number; photos: number; projects: number }> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      let counts = { measurements: 0, photos: 0, projects: 0 };

      db.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM measurements',
          [],
          (_, { rows }) => {
            counts.measurements = rows.item(0).count;
          }
        );
        
        tx.executeSql(
          'SELECT COUNT(*) as count FROM photos',
          [],
          (_, { rows }) => {
            counts.photos = rows.item(0).count;
          }
        );
        
        tx.executeSql(
          'SELECT COUNT(*) as count FROM projects',
          [],
          (_, { rows }) => {
            counts.projects = rows.item(0).count;
            resolve(counts);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const value: DatabaseContextType = {
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
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};