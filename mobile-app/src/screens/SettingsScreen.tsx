import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Divider,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useDatabase } from '../providers/DatabaseProvider';
import { useLocation } from '../providers/LocationProvider';
import { useSync } from '../providers/SyncProvider';

const SettingsScreen = () => {
  const [userSettings, setUserSettings] = useState({
    researcherName: '',
    organization: '',
    autoSync: true,
    highAccuracyGPS: true,
    savePhotosToGallery: true,
    enableNotifications: true,
    uploadOnWiFiOnly: false,
  });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [storageStats, setStorageStats] = useState({
    totalMeasurements: 0,
    totalPhotos: 0,
    databaseSize: '0 KB',
  });

  const { clearAllData, getTotalCounts } = useDatabase();
  const { clearLocationHistory } = useLocation();
  const { clearSyncHistory } = useSync();

  useEffect(() => {
    loadSettings();
    loadStorageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setUserSettings({ ...userSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof userSettings) => {
    try {
      setUserSettings(newSettings);
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const loadStorageStats = async () => {
    try {
      const counts = await getTotalCounts();
      setStorageStats({
        totalMeasurements: counts.measurements,
        totalPhotos: counts.photos,
        databaseSize: '~' + Math.round((counts.measurements * 2 + counts.photos * 0.5)) + ' KB',
      });
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const updateSetting = (key: keyof typeof userSettings, value: any) => {
    const newSettings = { ...userSettings, [key]: value };
    saveSettings(newSettings);
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This feature will export your data to a file for backup purposes. This feature is coming soon.',
      [{ text: 'OK' }]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all measurements, photos, and local data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await clearLocationHistory();
              await clearSyncHistory();
              Alert.alert('Success', 'All data has been cleared.');
              await loadStorageStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            const defaultSettings = {
              researcherName: '',
              organization: '',
              autoSync: true,
              highAccuracyGPS: true,
              savePhotosToGallery: true,
              enableNotifications: true,
              uploadOnWiFiOnly: false,
            };
            saveSettings(defaultSettings);
            Alert.alert('Success', 'Settings have been reset to defaults.');
          },
        },
      ]
    );
  };

  const UserProfile = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>User Profile</Title>
        
        <TextInput
          label="Researcher Name"
          value={userSettings.researcherName}
          onChangeText={(text) => updateSetting('researcherName', text)}
          mode="outlined"
          style={styles.input}
        />
        
        <TextInput
          label="Organization"
          value={userSettings.organization}
          onChangeText={(text) => updateSetting('organization', text)}
          mode="outlined"
          style={styles.input}
        />
      </Card.Content>
    </Card>
  );

  const DataSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Data Collection</Title>
        
        <List.Item
          title="Auto Sync"
          description="Automatically sync data when connected"
          right={() => (
            <Switch
              value={userSettings.autoSync}
              onValueChange={(value) => updateSetting('autoSync', value)}
            />
          )}
        />
        
        <List.Item
          title="High Accuracy GPS"
          description="Use high accuracy mode for location data"
          right={() => (
            <Switch
              value={userSettings.highAccuracyGPS}
              onValueChange={(value) => updateSetting('highAccuracyGPS', value)}
            />
          )}
        />
        
        <List.Item
          title="Save Photos to Gallery"
          description="Save captured photos to device gallery"
          right={() => (
            <Switch
              value={userSettings.savePhotosToGallery}
              onValueChange={(value) => updateSetting('savePhotosToGallery', value)}
            />
          )}
        />
        
        <List.Item
          title="Upload on WiFi Only"
          description="Only sync data when connected to WiFi"
          right={() => (
            <Switch
              value={userSettings.uploadOnWiFiOnly}
              onValueChange={(value) => updateSetting('uploadOnWiFiOnly', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const StorageInfo = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Storage Information</Title>
        
        <View style={styles.storageStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Measurements:</Text>
            <Text style={styles.statValue}>{storageStats.totalMeasurements}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Photos:</Text>
            <Text style={styles.statValue}>{storageStats.totalPhotos}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Database Size:</Text>
            <Text style={styles.statValue}>{storageStats.databaseSize}</Text>
          </View>
        </View>

        <View style={styles.storageActions}>
          <Button
            mode="outlined"
            onPress={handleExportData}
            style={styles.actionButton}
          >
            Export Data
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleClearAllData}
            style={styles.actionButton}
            textColor="#ef4444"
          >
            Clear All Data
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const AppInfo = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>App Information</Title>
        
        <List.Item
          title="Version"
          description={Application.nativeApplicationVersion || '1.0.0'}
          left={(props) => <List.Icon {...props} icon="info" />}
        />
        
        <List.Item
          title="Build"
          description={Application.nativeBuildVersion || '1'}
          left={(props) => <List.Icon {...props} icon="build" />}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Privacy Policy"
          description="View our privacy policy"
          left={(props) => <List.Icon {...props} icon="privacy-tip" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert('Privacy Policy', 'Privacy policy would open here.');
          }}
        />
        
        <List.Item
          title="Terms of Service"
          description="View terms of service"
          left={(props) => <List.Icon {...props} icon="description" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert('Terms of Service', 'Terms of service would open here.');
          }}
        />
        
        <List.Item
          title="Open Source Licenses"
          description="View third-party licenses"
          left={(props) => <List.Icon {...props} icon="code" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert('Open Source', 'Third-party licenses would be listed here.');
          }}
        />
      </Card.Content>
    </Card>
  );

  const SupportHelp = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Support & Help</Title>
        
        <List.Item
          title="Contact Support"
          description="Get help with the app"
          left={(props) => <List.Icon {...props} icon="support" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert(
              'Contact Support',
              'For support, please email: support@bluecarbonregistry.com',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Email',
                  onPress: () => {
                    Linking.openURL('mailto:support@bluecarbonregistry.com?subject=Mobile App Support');
                  },
                },
              ]
            );
          }}
        />
        
        <List.Item
          title="User Guide"
          description="Learn how to use the app"
          left={(props) => <List.Icon {...props} icon="help" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert('User Guide', 'User guide would open here.');
          }}
        />
        
        <List.Item
          title="Report Bug"
          description="Report a problem or bug"
          left={(props) => <List.Icon {...props} icon="bug-report" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert(
              'Report Bug',
              'To report a bug, please email: bugs@bluecarbonregistry.com',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Email',
                  onPress: () => {
                    Linking.openURL('mailto:bugs@bluecarbonregistry.com?subject=Bug Report - Mobile App');
                  },
                },
              ]
            );
          }}
        />
        
        <List.Item
          title="Reset Settings"
          description="Reset all settings to defaults"
          left={(props) => <List.Icon {...props} icon="restore" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleResetSettings}
        />
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Settings</Title>
        <Paragraph style={styles.headerSubtitle}>
          Customize your data collection experience
        </Paragraph>
      </View>

      <UserProfile />
      <DataSettings />
      <StorageInfo />
      <AppInfo />
      <SupportHelp />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Blue Carbon Registry Mobile v{Application.nativeApplicationVersion || '1.0.0'}
        </Text>
        <Text style={styles.footerText}>
          © 2024 Blue Carbon Registry. All rights reserved.
        </Text>
      </View>
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
  card: {
    margin: 16,
    marginBottom: 0,
  },
  input: {
    marginBottom: 16,
  },
  storageStats: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  storageActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;