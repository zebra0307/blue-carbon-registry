# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-09-14

### Added
- ✅ Complete mobile app upgrade to Expo SDK 54
- ✅ Web app deployment on Vercel with live URL
- 📱 Mobile camera functionality with CameraView component
- 💾 SQLite async API integration for offline data storage
- 🌐 Comprehensive Solana wallet integration
- 📊 Functional dashboard with project management

### Changed
- 🔄 Updated DatabaseProvider to use SQLite async API (`openDatabaseAsync`, `runAsync`, `getAllAsync`)
- 📸 Migrated CameraScreen from deprecated Camera to CameraView component
- 🏗️ Reconstructed web app components with proper TypeScript exports
- 📦 Updated all package dependencies for Expo SDK 54 compatibility
- 🎨 Enhanced UI components with Tailwind CSS styling

### Fixed
- 🐛 Resolved "The default export is not a React Component" build errors
- 🔧 Fixed TypeScript compilation issues in web app
- 📱 Fixed React Navigation compatibility with Expo SDK 54
- 🔐 Resolved security vulnerabilities in package dependencies
- 🏭 Fixed missing component exports causing build failures

### Technical Details
- **Mobile**: React Native with Expo SDK 54, SQLite async API
- **Web**: Next.js 14.2.32, TypeScript, Tailwind CSS
- **Deployment**: Vercel with automatic GitHub integration
- **Blockchain**: Solana smart contracts with Anchor framework

### Deployment
- **Web App**: [https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app](https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app)
- **Mobile App**: Available for development testing via Expo Go

## [1.1.0] - Previous Version

### Added
- Initial Solana smart contract implementation
- Basic web and mobile app structure
- IPFS integration for metadata storage

## [1.0.0] - Initial Release

### Added
- Basic project structure
- Smart contract scaffolding
- Initial documentation