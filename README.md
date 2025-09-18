# 🌊 Blue Carbon Registry

> A decentralized carbon credit registry built on Solana blockchain for transparent and verifiable carbon offset management.

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🌐 Live Demo
**🚀 Web Application Available Locally** - Run `npm run dev` in the `web-app` directory

## � Project Overview

Blue Carbon Registry is a comprehensive blockchain-based platform that enables transparent tracking, verification, and trading of carbon credits. Built on Solana for high performance and low transaction costs, the platform includes both web and mobile applications for complete ecosystem management.

### 🎯 Key Features

- 🌱 **Project Registration** - Register carbon offset projects on-chain with immutable records
- 🪙 **Credit Minting** - Issue verified carbon credits as SPL tokens  
- 🔄 **Credit Trading** - Seamless transfer and trading of credits between accounts
- 🔥 **Credit Retirement** - Permanently retire credits for verified offset claims
- 📊 **IPFS Integration** - Decentralized metadata and document storage
- 📱 **Cross-platform Apps** - Professional web dashboard and mobile data collection
- 📸 **Field Data Collection** - Mobile camera integration for on-site verification
- 💾 **Offline Capabilities** - SQLite database with sync for remote field work
- 🌐 **Wallet Integration** - Support for all major Solana wallets

## 🏗️ Architecture

### 📁 Project Structure

```
blue-carbon-registry/
├── programs/blue-carbon-registry/    # Solana smart contracts
├── web-app/                         # Next.js dashboard
├── mobile-app/                      # React Native field app  
├── backend-bridge/                  # Node.js API services
├── shared/                         # Common utilities
└── data/                          # Field reports & imagery
```

### 🔧 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Blockchain** | Solana, Anchor Framework | Latest |
| **Web Frontend** | Next.js, TypeScript, Tailwind CSS | 14.2.32 |
| **Mobile Frontend** | React Native, Expo SDK | 54.0+ |
| **Backend** | Node.js, Express | 18+ |
| **Database** | SQLite (Mobile), PostgreSQL (Backend) | Latest |
| **Storage** | IPFS | Latest |
| **Development** | Local Development Environment | Latest |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI
- Expo CLI (for mobile)

### 🌐 Web Application
```bash
# Navigate to web app
cd web-app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 📱 Mobile Application
```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on devices
npx expo run:ios     # iOS
npx expo run:android # Android
```

### ⛓️ Smart Contract Development
```bash
# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 📱 Application Features

### Web Dashboard
- 🎛️ **Project Management** - Create and manage carbon credit projects
- 📊 **Analytics Dashboard** - Real-time statistics and visualizations  
- 🔗 **Wallet Integration** - Connect with Phantom, Solflare, and other Solana wallets
- 📈 **Trading Interface** - Buy, sell, and retire carbon credits
- 📋 **Verification Tools** - Review and approve field reports

### Mobile App
- 📸 **Camera Integration** - Capture geo-tagged field photos
- 📍 **GPS Tracking** - Automatic location logging for verification
- 💾 **Offline Storage** - SQLite database for remote field work
- 🔄 **Data Synchronization** - Sync with backend when connectivity available
- 📊 **Data Collection Forms** - Structured field report creation

## 🌍 Use Cases

- **🏢 Carbon Credit Issuers** - Register and manage offset projects
- **🏭 Enterprises** - Purchase and retire credits for sustainability goals  
- **🔬 Verifiers** - Conduct field verification and data collection
- **💼 Traders** - Buy and sell verified carbon credits
- **📊 Researchers** - Access transparent carbon offset data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🌊 Building the future of transparent carbon markets 🌊**

[Local Development Setup](#-quick-start) • [Documentation](docs/) • [Report Bug](issues/) • [Request Feature](issues/)

</div>or transparent and verifiable carbon offset management.

## 🌟 Current Status

✅ **Mobile App**: Structured with Expo SDK 54  
✅ **Web App**: Production-ready with Solana integration  
✅ **Smart Contracts**: Deployed on Solana devnet  
✅ **Development Environment**: Fully configured for local development

## 📁 Project Structure

### `/programs/blue-carbon-registry/` - Smart Contract Layer
- **`src/lib.rs`** - Main Solana program implementation
- **`Cargo.toml`** - Rust dependencies and metadata
- Deployed smart contract for carbon credit management

### `/web-app/` - Next.js Web Frontend
- **`src/app/`** - Next.js 14 app router pages
- **`src/components/`** - Reusable UI components with Solana integration
- **`src/api/`** - Blockchain and off-chain data access
- **Development**: Local development environment with hot reload

### `/mobile-app/` - React Native Mobile App
- **`src/components/`** - Mobile UI components
- **`src/screens/`** - Mobile application screens (Camera, Data Collection, etc.)
- **`src/providers/`** - Database, Location, and Sync providers
- **`src/types/`** - TypeScript type definitions
- **SDK**: Expo SDK 54 with SQLite async API

### `/backend-bridge/` - Node.js Services
- **`src/services/`** - IPFS upload, data aggregation services
- **`src/routes/`** - API endpoints for client applications

### `/shared/` - Common Libraries
- **`constants/`** - Shared constants across platforms
- **`utils/`** - Utility functions for mobile and web

### `/data/` - Data Storage
- **`field-reports/`** - Field measurement data
- **`drone-imagery/`** - Aerial survey imagery and data

## Features

- 🌱 **Project Registration** - Register carbon offset projects on-chain
- 🪙 **Credit Minting** - Issue carbon credits as SPL tokens
- 🔄 **Credit Trading** - Transfer credits between accounts
- 🔥 **Credit Retirement** - Permanently retire credits for offset claims
- 📊 **IPFS Integration** - Decentralized metadata storage
- 📱 **Multi-platform** - Web and mobile applications

## Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd blue-carbon-registry

# Install dependencies
yarn install

# Build the blockchain program
anchor build

# Run tests
anchor test
\`\`\`

## Technology Stack

- **Blockchain**: Solana, Anchor Framework
- **Frontend**: Next.js (Web), React Native (Mobile)
- **Backend**: Node.js, Express
- **Storage**: IPFS for metadata
- **Tokens**: SPL Token standard

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
