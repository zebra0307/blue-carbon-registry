import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph, Button, Surface, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDatabase } from '../providers/DatabaseProvider';
import { useSync } from '../providers/SyncProvider';
import { useLocation } from '../providers/LocationProvider';
import { Project, FieldMeasurement } from '../types';

const HomeScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<FieldMeasurement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMeasurements: 0,
    pendingSync: 0,
    lastMeasurement: null as Date | null,
  });

  const { getProjects, getMeasurements } = useDatabase();
  const { syncStatus, syncData } = useSync();
  const { currentLocation, requestLocationPermission } = useLocation();

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  const loadData = async () => {
    try {
      const projectData = await getProjects();
      const measurementData = await getMeasurements();
      
      setProjects(projectData);
      setRecentMeasurements(measurementData.slice(0, 5)); // Last 5 measurements
      
      setStats({
        totalProjects: projectData.length,
        totalMeasurements: measurementData.length,
        pendingSync: syncStatus.pendingMeasurements + syncStatus.pendingPhotos,
        lastMeasurement: measurementData.length > 0 
          ? new Date(measurementData[0].timestamp) 
          : null,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSync = async () => {
    await syncData();
    await loadData();
  };

  const StatsCard = ({ title, value, icon, color = '#2563eb' }: any) => (
    <Surface style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsIcon}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </Surface>
  );

  const ConnectionStatus = () => (
    <Surface style={styles.connectionCard}>
      <View style={styles.connectionHeader}>
        <Icon 
          name={syncStatus.isOnline ? 'cloud-done' : 'cloud-off'} 
          size={20} 
          color={syncStatus.isOnline ? '#10b981' : '#ef4444'} 
        />
        <Text style={[
          styles.connectionText,
          { color: syncStatus.isOnline ? '#10b981' : '#ef4444' }
        ]}>
          {syncStatus.isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      
      {syncStatus.pendingMeasurements + syncStatus.pendingPhotos > 0 && (
        <View style={styles.pendingData}>
          <Text style={styles.pendingText}>
            {syncStatus.pendingMeasurements + syncStatus.pendingPhotos} items pending sync
          </Text>
          <Button 
            mode="contained" 
            compact 
            onPress={handleSync}
            disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
            loading={syncStatus.syncInProgress}
          >
            Sync Now
          </Button>
        </View>
      )}
      
      {syncStatus.syncInProgress && (
        <ProgressBar indeterminate style={styles.syncProgress} />
      )}
    </Surface>
  );

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Collect')}
        >
          <Icon name="add-circle" size={32} color="#2563eb" />
          <Text style={styles.quickActionText}>Collect Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Projects')}
        >
          <Icon name="folder" size={32} color="#059669" />
          <Text style={styles.quickActionText}>View Projects</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Sync')}
        >
          <Icon name="cloud-sync" size={32} color="#dc2626" />
          <Text style={styles.quickActionText}>Sync Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RecentActivity = () => (
    <View style={styles.recentActivity}>
      <Text style={styles.sectionTitle}>Recent Measurements</Text>
      {recentMeasurements.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No measurements yet</Text>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Collect')}
              style={styles.emptyButton}
            >
              Start Collecting Data
            </Button>
          </Card.Content>
        </Card>
      ) : (
        recentMeasurements.map((measurement) => (
          <Card key={measurement.id} style={styles.measurementCard}>
            <Card.Content>
              <View style={styles.measurementHeader}>
                <Text style={styles.measurementType}>
                  {measurement.measurementType.toUpperCase()}
                </Text>
                <Text style={styles.measurementDate}>
                  {new Date(measurement.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.measurementNotes} numberOfLines={2}>
                {measurement.notes || 'No notes'}
              </Text>
              <View style={styles.measurementFooter}>
                <Text style={styles.measurementLocation}>
                  {measurement.location.latitude.toFixed(6)}, {measurement.location.longitude.toFixed(6)}
                </Text>
                <Icon 
                  name={measurement.synced ? 'cloud-done' : 'cloud-upload'} 
                  size={16} 
                  color={measurement.synced ? '#10b981' : '#f59e0b'} 
                />
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.welcomeTitle}>Welcome to Blue Carbon Registry</Title>
        <Paragraph style={styles.welcomeSubtitle}>
          Collect and monitor marine ecosystem data
        </Paragraph>
      </View>

      <ConnectionStatus />

      <View style={styles.statsContainer}>
        <StatsCard 
          title="Projects" 
          value={stats.totalProjects} 
          icon="folder" 
          color="#2563eb" 
        />
        <StatsCard 
          title="Measurements" 
          value={stats.totalMeasurements} 
          icon="assessment" 
          color="#059669" 
        />
        <StatsCard 
          title="Pending Sync" 
          value={stats.pendingSync} 
          icon="cloud-upload" 
          color="#f59e0b" 
        />
      </View>

      <QuickActions />
      <RecentActivity />
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  connectionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  pendingData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  syncProgress: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statsContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: 12,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  quickActionsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  recentActivity: {
    margin: 16,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyButton: {
    alignSelf: 'center',
  },
  measurementCard: {
    marginTop: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  measurementDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  measurementNotes: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  measurementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementLocation: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
});

export default HomeScreen;