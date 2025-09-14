#!/usr/bin/env node

console.log('🧪 Blue Carbon Registry Mobile App Validation\n');

const fs = require('fs');
const path = require('path');

const projectRoot = '/home/rammsey/blue-carbon-registry/mobile-app';

// Check core files
const coreFiles = [
  'package.json',
  'App.tsx',
  'index.js',
  'tsconfig.json',
];

const coreDirectories = [
  'src',
  'src/providers',
  'src/screens',
  'src/types',
];

const screenFiles = [
  'src/screens/HomeScreen.tsx',
  'src/screens/DataCollectionScreen.tsx',
  'src/screens/CameraScreen.tsx',
  'src/screens/ProjectsScreen.tsx',
  'src/screens/SyncScreen.tsx',
  'src/screens/SettingsScreen.tsx',
];

const providerFiles = [
  'src/providers/DatabaseProvider.tsx',
  'src/providers/LocationProvider.tsx',
  'src/providers/SyncProvider.tsx',
];

console.log('📁 Checking file structure...');
let allValid = true;

[...coreFiles, ...screenFiles, ...providerFiles, 'src/types/index.ts'].forEach(file => {
  const fullPath = path.join(projectRoot, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allValid = false;
});

coreDirectories.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${dir}/`);
  if (!exists) allValid = false;
});

console.log('\n📦 Checking package.json dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    'expo-camera',
    'expo-location',
    'expo-sqlite',
    'react-native-paper',
    'react-hook-form',
    '@solana/web3.js'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`${exists ? '✅' : '❌'} ${dep}`);
    if (!exists) allValid = false;
  });
} catch (error) {
  console.log('❌ Failed to read package.json');
  allValid = false;
}

console.log('\n🎯 TypeScript type definitions...');
try {
  const typesContent = fs.readFileSync(path.join(projectRoot, 'src/types/index.ts'), 'utf8');
  const requiredTypes = [
    'FieldMeasurement',
    'PhotoData', 
    'Project',
    'SyncStatus',
    'DatabaseEntry',
    'LocationData',
    'FormData'
  ];
  
  requiredTypes.forEach(type => {
    const exists = typesContent.includes(`export interface ${type}`);
    console.log(`${exists ? '✅' : '❌'} ${type} interface`);
    if (!exists) allValid = false;
  });
} catch (error) {
  console.log('❌ Failed to read types file');
  allValid = false;
}

console.log('\n🧮 Provider context exports...');
const providers = [
  { file: 'src/providers/DatabaseProvider.tsx', exports: ['DatabaseProvider', 'useDatabase'] },
  { file: 'src/providers/LocationProvider.tsx', exports: ['LocationProvider', 'useLocation'] },
  { file: 'src/providers/SyncProvider.tsx', exports: ['SyncProvider', 'useSync'] }
];

providers.forEach(({ file, exports }) => {
  try {
    const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    exports.forEach(exportName => {
      const exists = content.includes(`export`) && content.includes(exportName);
      console.log(`${exists ? '✅' : '❌'} ${exportName} from ${file}`);
      if (!exists) allValid = false;
    });
  } catch (error) {
    console.log(`❌ Failed to read ${file}`);
    allValid = false;
  }
});

console.log('\n📱 Screen components...');
screenFiles.forEach(screen => {
  try {
    const content = fs.readFileSync(path.join(projectRoot, screen), 'utf8');
    const hasExport = content.includes('export default');
    const hasReact = content.includes('import React');
    console.log(`${hasExport && hasReact ? '✅' : '❌'} ${path.basename(screen)} structure`);
    if (!hasExport || !hasReact) allValid = false;
  } catch (error) {
    console.log(`❌ Failed to read ${screen}`);
    allValid = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 Mobile app structure validation PASSED!');
  console.log('📱 Ready for testing and blockchain integration');
} else {
  console.log('⚠️  Mobile app structure validation FAILED!');
  console.log('🔧 Some components need attention before proceeding');
}
console.log('='.repeat(50));