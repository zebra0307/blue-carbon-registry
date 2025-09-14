# Blue Carbon Registry

A decentralized carbon credit registry built on So```

## 🏗️ Technology Stack

- **Blockchain**: Solana, Anchor Framework
- **Web Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Mobile Frontend**: React Native, Expo SDK 54
- **Backend**: Node.js, Express
- **Database**: SQLite (Mobile), PostgreSQL (Backend)
- **Storage**: IPFS for metadata
- **Deployment**: Vercel (Web), EAS Build (Mobile)
- **Tokens**: SPL Token standard

## 📱 Live Applications

- **Web Dashboard**: [https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app](https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app)
- **Mobile App**: Available for development testing (Expo Go)

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License.or transparent and verifiable carbon offset management.

## 🌟 Current Status

✅ **Mobile App**: Fully functional with Expo SDK 54  
✅ **Web App**: Deployed on Vercel with Solana integration  
✅ **Smart Contracts**: Deployed on Solana blockchain  
✅ **Live Demo**: [https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app](https://blue-carbon-registryweb-530u9xa2q-satyendras-projects-137a7df3.vercel.app)

## 📁 Project Structure

### `/programs/blue-carbon-registry/` - Smart Contract Layer
- **`src/lib.rs`** - Main Solana program implementation
- **`Cargo.toml`** - Rust dependencies and metadata
- Deployed smart contract for carbon credit management

### `/web-app/` - Next.js Web Frontend
- **`src/app/`** - Next.js 14 app router pages
- **`src/components/`** - Reusable UI components with Solana integration
- **`src/api/`** - Blockchain and off-chain data access
- **Deployment**: Auto-deployed via Vercel on git push

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
