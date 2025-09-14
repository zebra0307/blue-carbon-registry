#!/usr/bin/env node

// Basic Mobile App Functionality Test
// This script tests the core components without starting the full Expo server

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Blue Carbon Registry Mobile App Structure...\n');

// Test file structure
const requiredFiles = [
  'App.tsx',
  'package.json',
  'tsconfig.json',
  'src/types/index.ts',
  'src/providers/DatabaseProvider.tsx',
  'src/providers/LocationProvider.tsx',
  'src/providers/SyncProvider.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/DataCollectionScreen.tsx',
  'src/screens/CameraScreen.tsx',
  'src/screens/ProjectsScreen.tsx',
  'src/screens/SyncScreen.tsx',
  'src/screens/SettingsScreen.tsx',
];

let allFilesExist = true;

console.log('📁 Checking file structure:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test package.json dependencies
console.log('\n📦 Checking package.json dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'expo',
  'react',
  'react-native',
  'expo-camera',
  'expo-location',
  'expo-sqlite',
  '@react-navigation/native',
  'react-native-paper',
  '@solana/web3.js'
];

let allDepsPresent = true;
requiredDeps.forEach(dep => {
  const exists = packageJson.dependencies[dep];
  console.log(`  ${exists ? '✅' : '❌'} ${dep}${exists ? ` (${exists})` : ''}`);
  if (!exists) allDepsPresent = false;
});

// Test TypeScript interfaces
console.log('\n🔍 Checking TypeScript interfaces:');
const typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
const requiredInterfaces = [
  'FieldMeasurement',
  'PhotoData',
  'Project',
  'SyncStatus',
  'DatabaseEntry',
  'LocationData'
];

let allInterfacesPresent = true;
requiredInterfaces.forEach(interfaceName => {
  const exists = typesContent.includes(`interface ${interfaceName}`) || 
                 typesContent.includes(`export interface ${interfaceName}`);
  console.log(`  ${exists ? '✅' : '❌'} ${interfaceName}`);
  if (!exists) allInterfacesPresent = false;
});

// Test provider context exports
console.log('\n🔗 Checking provider context exports:');
const providerChecks = [
  { file: 'src/providers/DatabaseProvider.tsx', export: 'useDatabase' },
  { file: 'src/providers/LocationProvider.tsx', export: 'useLocation' },
  { file: 'src/providers/SyncProvider.tsx', export: 'useSync' }
];

let allProvidersValid = true;
providerChecks.forEach(({ file, export: exportName }) => {
  const content = fs.readFileSync(file, 'utf8');
  const hasProvider = content.includes(`export const ${file.split('/').pop().replace('.tsx', '')}`);
  const hasHook = content.includes(`export const ${exportName}`);
  const valid = hasProvider && hasHook;
  console.log(`  ${valid ? '✅' : '❌'} ${file} (${exportName})`);
  if (!valid) allProvidersValid = false;
});

// Test screen components
console.log('\n📱 Checking screen components:');
const screens = [
  'HomeScreen',
  'DataCollectionScreen',
  'CameraScreen',
  'ProjectsScreen',
  'SyncScreen',
  'SettingsScreen'
];

let allScreensValid = true;
screens.forEach(screen => {
  const file = `src/screens/${screen}.tsx`;
  const content = fs.readFileSync(file, 'utf8');
  const hasExport = content.includes(`export default ${screen}`) || 
                   content.includes(`const ${screen}`) ||
                   content.includes(`function ${screen}`);
  console.log(`  ${hasExport ? '✅' : '❌'} ${screen}`);
  if (!hasExport) allScreensValid = false;
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`  File Structure: ${allFilesExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Dependencies: ${allDepsPresent ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TypeScript Interfaces: ${allInterfacesPresent ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Provider Contexts: ${allProvidersValid ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Screen Components: ${allScreensValid ? '✅ PASS' : '❌ FAIL'}`);

const overallPass = allFilesExist && allDepsPresent && allInterfacesPresent && 
                   allProvidersValid && allScreensValid;

console.log(`\n🎯 Overall Result: ${overallPass ? '✅ MOBILE APP READY' : '❌ ISSUES FOUND'}`);

if (overallPass) {
  console.log('\n🚀 Mobile app structure is complete and ready for blockchain integration!');
  console.log('📝 Next steps:');
  console.log('  1. Test database operations');
  console.log('  2. Test location services');
  console.log('  3. Integrate with Solana blockchain');
  console.log('  4. Add IPFS photo upload');
} else {
  console.log('\n🔧 Please fix the issues above before proceeding.');
}

console.log('\n✨ Test completed!');