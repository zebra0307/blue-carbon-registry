import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import DataCollectionScreen from './src/screens/DataCollectionScreen';
import CameraScreen from './src/screens/CameraScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import SyncScreen from './src/screens/SyncScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import providers
import { DatabaseProvider } from './src/providers/DatabaseProvider';
import { LocationProvider } from './src/providers/LocationProvider';
import { SyncProvider } from './src/providers/SyncProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for data collection flow
function DataCollectionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DataCollection" component={DataCollectionScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>
  );
}

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Collect':
              iconName = 'add-circle';
              break;
            case 'Projects':
              iconName = 'folder';
              break;
            case 'Sync':
              iconName = 'sync';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Blue Carbon Registry' }}
      />
      <Tab.Screen 
        name="Collect" 
        component={DataCollectionStack}
        options={{ title: 'Collect Data' }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen 
        name="Sync" 
        component={SyncScreen}
        options={{ title: 'Sync Data' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <DatabaseProvider>
        <LocationProvider>
          <SyncProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <MainTabs />
            </NavigationContainer>
          </SyncProvider>
        </LocationProvider>
      </DatabaseProvider>
    </PaperProvider>
  );
}