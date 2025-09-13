# Blue Carbon Registry

A decentralized carbon credit registry built on Solana blockchain for transparent and verifiable carbon offset management.

## Project Structure

### `/blockchain/` - Smart Contract Layer
- **`/programs/`** - Solana programs (smart contracts)
- **`/tests/`** - Integration tests for blockchain functionality
- **`/scripts/`** - Deployment and interaction scripts

### `/web-app/` - Web Frontend
- **`/src/components/`** - Reusable UI components
- **`/src/pages/`** - Web application pages
- **`/src/api/`** - Blockchain and off-chain data access

### `/mobile-app/` - Mobile Frontend
- **`/src/components/`** - Mobile UI components
- **`/src/screens/`** - Mobile application screens
- **`/src/api/`** - Mobile blockchain integration

### `/backend-bridge/` - Off-chain Services
- **`/src/services/`** - IPFS upload, data aggregation
- **`/src/routes/`** - API endpoints for client data

### `/shared/` - Common Code
- **`/constants/`** - Global constants (contract addresses, etc.)
- **`/utils/`** - Utility functions shared across platforms

### `/data/` - Raw Data Storage
- **`/field-reports/`** - Field measurement data
- **`/drone-imagery/`** - Aerial survey data

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
