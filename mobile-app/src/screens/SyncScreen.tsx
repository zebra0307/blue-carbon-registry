import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  ProgressBar,
  List,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSync } from '../providers/SyncProvider';
import { useDatabase } from '../providers/DatabaseProvider';
import { DatabaseEntry } from '../types';

const SyncScreen = () => {
  const [unsyncedData, setUnsyncedData] = useState<DatabaseEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const { syncStatus, syncData, checkNetworkStatus } = useSync();
  const { getUnsyncedData, clearSyncedData } = useDatabase();

  useEffect(() => {
    loadUnsyncedData();
  }, []);

  useEffect(() => {
    loadUnsyncedData();
  }, [syncStatus.pendingMeasurements, syncStatus.pendingPhotos]);

  const loadUnsyncedData = async () => {
    try {
      const data = await getUnsyncedData();
      setUnsyncedData(data);
    } catch (error) {
      console.error('Error loading unsynced data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkNetworkStatus();
    await loadUnsyncedData();
    setRefreshing(false);
  };

  const handleSync = async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('No Connection', 'Please connect to the internet to sync data.');
      return;
    }

    if (unsyncedData.length === 0) {
      Alert.alert('Up to Date', 'All data is already synced.');
      return;
    }

    try {
      setSyncProgress(0);
      await syncData();
      await loadUnsyncedData();
      Alert.alert('Success', 'All data synced successfully!');
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
    }
  };

  const handleClearSyncedData = async () => {
    Alert.alert(
      'Clear Synced Data',
      'This will remove old synced data from your device to free up space. Unsynced data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSyncedData();
              Alert.alert('Success', 'Synced data cleared successfully.');
              await loadUnsyncedData();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear synced data.');
            }
          },
        },
      ]
    );
  };

  const ConnectionStatus = () => (
    <Surface style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Icon 
          name={syncStatus.isOnline ? 'cloud-done' : 'cloud-off'} 
          size={24} 
          color={syncStatus.isOnline ? '#10b981' : '#ef4444'} 
        />
        <Text style={[
          styles.statusText,
          { color: syncStatus.isOnline ? '#10b981' : '#ef4444' }
        ]}>
          {syncStatus.isOnline ? 'Connected' : 'Offline'}
        </Text>
      </View>
      
      {syncStatus.lastSync && (
        <Text style={styles.lastSyncText}>
          Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
        </Text>
      )}
      
      {syncStatus.syncError && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{syncStatus.syncError}</Text>
        </View>
      )}
    </Surface>
  );

  const SyncStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title>Sync Statistics</Title>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{syncStatus.pendingMeasurements}</Text>
            <Text style={styles.statLabel}>Pending Measurements</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{syncStatus.pendingPhotos}</Text>
            <Text style={styles.statLabel}>Pending Photos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {syncStatus.pendingMeasurements + syncStatus.pendingPhotos}
            </Text>
            <Text style={styles.statLabel}>Total Pending</Text>
          </View>
        </View>

        {syncStatus.syncInProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Syncing...</Text>
            <ProgressBar indeterminate style={styles.progressBar} />
          </View>
        )}

        <View style={styles.syncActions}>
          <Button
            mode="contained"
            onPress={handleSync}
            disabled={!syncStatus.isOnline || syncStatus.syncInProgress || unsyncedData.length === 0}
            loading={syncStatus.syncInProgress}
            style={styles.syncButton}
          >
            {unsyncedData.length === 0 ? 'Up to Date' : `Sync ${unsyncedData.length} Items`}
          </Button>
          
          <Button
            mode="outlined"
            onPress={onRefresh}
            disabled={syncStatus.syncInProgress}
            style={styles.refreshButton}
          >
            Refresh
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const PendingDataList = () => (
    <Card style={styles.dataCard}>
      <Card.Content>
        <Title>Pending Data</Title>
        
        {unsyncedData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="cloud-done" size={48} color="#10b981" />
            <Text style={styles.emptyText}>All data is synced</Text>
          </View>
        ) : (
          <ScrollView style={styles.dataList}>
            {unsyncedData.map((item) => (
              <List.Item
                key={item.id}
                title={item.type === 'measurement' ? 'Field Measurement' : 'Photo'}
                description={`Created: ${new Date(item.createdAt).toLocaleString()}`}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon={item.type === 'measurement' ? 'assessment' : 'photo'} 
                    color="#f59e0b"
                  />
                )}
                right={(props) => (
                  <Icon name="cloud-upload" size={20} color="#f59e0b" />
                )}
                style={styles.dataItem}
              />
            ))}
          </ScrollView>
        )}
      </Card.Content>
    </Card>
  );

  const SyncInstructions = () => (
    <Card style={styles.instructionsCard}>
      <Card.Content>
        <Title>How Syncing Works</Title>
        
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Icon name="cloud-upload" size={20} color="#2563eb" />
            <Text style={styles.instructionText}>
              Data is collected and stored locally on your device
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Icon name="wifi" size={20} color="#2563eb" />
            <Text style={styles.instructionText}>
              When online, tap "Sync" to upload data to the blockchain
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Icon name="cloud-done" size={20} color="#2563eb" />
            <Text style={styles.instructionText}>
              Synced data is safely stored and can be viewed in the web app
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Icon name="delete" size={20} color="#2563eb" />
            <Text style={styles.instructionText}>
              Old synced data can be cleared to free up device storage
            </Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={handleClearSyncedData}
          style={styles.clearButton}
        >
          Clear Old Synced Data
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Data Synchronization</Title>
        <Paragraph style={styles.headerSubtitle}>
          Sync your field data with the blockchain
        </Paragraph>
      </View>

      <ConnectionStatus />
      <SyncStats />
      <PendingDataList />
      <SyncInstructions />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastSyncText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
  },
  syncActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  syncButton: {
    flex: 2,
    marginRight: 8,
  },
  refreshButton: {
    flex: 1,
    marginLeft: 8,
  },
  dataCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dataList: {
    maxHeight: 300,
  },
  dataItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  instructionsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  instructionsList: {
    marginVertical: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  clearButton: {
    marginTop: 16,
  },
});

export default SyncScreen;