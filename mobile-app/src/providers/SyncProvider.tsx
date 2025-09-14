import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import * as Network from 'expo-network';
import { useDatabase } from './DatabaseProvider';
import { SyncStatus, FieldMeasurement, PhotoData, DatabaseEntry } from '../types';

// Solana configuration
const SOLANA_NETWORK = 'devnet'; // Can be 'mainnet-beta', 'testnet', or 'devnet'
const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');

// Program ID for the Blue Carbon Registry smart contract
const PROGRAM_ID = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');

interface SyncContextType {
  syncStatus: SyncStatus;
  syncData: () => Promise<void>;
  syncMeasurement: (measurement: FieldMeasurement) => Promise<string | null>;
  syncPhoto: (photo: PhotoData) => Promise<string | null>;
  checkNetworkStatus: () => Promise<boolean>;
  clearSyncHistory: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUnsyncedData, markAsSynced } = useDatabase();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    pendingMeasurements: 0,
    pendingPhotos: 0,
    syncInProgress: false,
  });

  useEffect(() => {
    checkNetworkStatus();
    loadPendingCounts();
  }, []);

  const checkNetworkStatus = async (): Promise<boolean> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const isOnline = networkState.isConnected && networkState.isInternetReachable;
      
      setSyncStatus(prev => ({ ...prev, isOnline: !!isOnline }));
      return !!isOnline;
    } catch (error) {
      console.error('Network check error:', error);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      return false;
    }
  };

  const loadPendingCounts = async () => {
    try {
      const unsyncedData = await getUnsyncedData();
      const pendingMeasurements = unsyncedData.filter(item => item.type === 'measurement').length;
      const pendingPhotos = unsyncedData.filter(item => item.type === 'photo').length;
      
      setSyncStatus(prev => ({
        ...prev,
        pendingMeasurements,
        pendingPhotos,
      }));
    } catch (error) {
      console.error('Error loading pending counts:', error);
    }
  };

  const uploadToIPFS = async (data: any): Promise<string> => {
    // Mock IPFS upload - in production, use a service like Pinata, IPFS HTTP API, or Web3.Storage
    try {
      // This is a placeholder for IPFS upload
      // In production, you would upload to IPFS and return the CID
      const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Mock IPFS upload successful:', mockCid);
      return mockCid;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload data to IPFS');
    }
  };

  const syncMeasurement = async (measurement: FieldMeasurement): Promise<string | null> => {
    try {
      // Step 1: Upload measurement data to IPFS
      const measurementData = {
        id: measurement.id,
        projectId: measurement.projectId,
        timestamp: measurement.timestamp,
        location: measurement.location,
        measurementType: measurement.measurementType,
        data: measurement.data,
        notes: measurement.notes,
        collectorId: measurement.collectorId,
      };

      const ipfsCid = await uploadToIPFS(measurementData);

      // Step 2: Register project on Solana if it doesn't exist (simplified for demo)
      // In production, you would check if project exists first
      try {
        await registerProjectOnSolana(measurement.projectId, ipfsCid);
      } catch (error) {
        console.log('Project may already exist or registration failed:', error);
      }

      // Step 3: Mark as synced in local database
      await markAsSynced('measurement', measurement.id);

      console.log('Measurement synced successfully:', measurement.id);
      return ipfsCid;
    } catch (error) {
      console.error('Sync measurement error:', error);
      throw error;
    }
  };

  const syncPhoto = async (photo: PhotoData): Promise<string | null> => {
    try {
      // Step 1: Upload photo metadata to IPFS
      const photoData = {
        id: photo.id,
        timestamp: photo.timestamp,
        location: photo.location,
        type: photo.type,
        description: photo.description,
        fileSize: photo.fileSize,
        // Note: In production, you'd upload the actual photo file separately
        uri: photo.uri, // This would be replaced with IPFS hash of the image
      };

      const ipfsCid = await uploadToIPFS(photoData);

      // Step 2: Mark as synced in local database
      await markAsSynced('photo', photo.id);

      console.log('Photo synced successfully:', photo.id);
      return ipfsCid;
    } catch (error) {
      console.error('Sync photo error:', error);
      throw error;
    }
  };

  const registerProjectOnSolana = async (projectId: string, ipfsCid: string) => {
    try {
      // In production, you would:
      // 1. Create and sign a transaction using the user's wallet
      // 2. Call the registerProject instruction on the smart contract
      // 3. Wait for confirmation
      
      // This is a placeholder for the actual Solana integration
      console.log('Registering project on Solana:', { projectId, ipfsCid });
      
      // Mock the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Project registered on Solana successfully');
    } catch (error) {
      console.error('Solana registration error:', error);
      throw error;
    }
  };

  const syncData = async (): Promise<void> => {
    if (!syncStatus.isOnline) {
      throw new Error('No internet connection');
    }

    if (syncStatus.syncInProgress) {
      return;
    }

    setSyncStatus(prev => ({ 
      ...prev, 
      syncInProgress: true,
      syncError: undefined,
    }));

    try {
      const unsyncedData = await getUnsyncedData();
      
      // Sync measurements
      const measurements = unsyncedData.filter(item => item.type === 'measurement');
      for (const item of measurements) {
        await syncMeasurement(item.data as FieldMeasurement);
      }

      // Sync photos
      const photos = unsyncedData.filter(item => item.type === 'photo');
      for (const item of photos) {
        await syncPhoto(item.data as PhotoData);
      }

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        lastSync: Date.now(),
        pendingMeasurements: 0,
        pendingPhotos: 0,
        syncInProgress: false,
      }));

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        syncError: error instanceof Error ? error.message : 'Sync failed',
      }));
      throw error;
    }
  };

  const clearSyncHistory = async (): Promise<void> => {
    try {
      // Clear local sync history
      setSyncStatus(prev => ({
        ...prev,
        lastSync: null,
        syncError: undefined,
      }));
      
      await loadPendingCounts();
      console.log('Sync history cleared');
    } catch (error) {
      console.error('Error clearing sync history:', error);
      throw error;
    }
  };

  const value: SyncContextType = {
    syncStatus,
    syncData,
    syncMeasurement,
    syncPhoto,
    checkNetworkStatus,
    clearSyncHistory,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};