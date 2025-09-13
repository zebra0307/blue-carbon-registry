# Blue Carbon Registry - Frontend Components

## Project Overview
This web application provides a comprehensive frontend interface for the Blue Carbon Registry, a Solana-based platform for managing carbon credit tokens from blue carbon ecosystems (mangroves, seagrass, salt marshes).

## Architecture

### Components Created
1. **WalletProvider.tsx** - Solana wallet connection and context management
2. **Header.tsx** - Navigation and wallet connection UI
3. **ProjectCard.tsx** - Display individual project information
4. **ProjectForm.tsx** - Register new carbon offset projects
5. **CreditMintForm.tsx** - Mint new carbon credits for verified projects
6. **CreditTransferForm.tsx** - Transfer credits between wallets
7. **CreditRetireForm.tsx** - Permanently retire credits (offset claims)

### Pages
1. **Dashboard (page.tsx)** - Main dashboard with stats and project overview
2. **Demo Component** - Standalone demo showing UI structure

### Configuration
- **Next.js 14** with TypeScript
- **Tailwind CSS** with custom blue-carbon theme
- **Solana Wallet Adapter** integration
- **TypeScript interfaces** for type safety

## Core Features

### 1. Project Registration
- Project ID, name, description, location
- IPFS integration for metadata storage
- Solana program integration

### 2. Credit Management
- **Mint Credits**: Create new tokens from verified carbon projects
- **Transfer Credits**: Move ownership between wallets
- **Retire Credits**: Permanently remove from circulation

### 3. Dashboard Analytics
- Total projects registered
- Credits issued, transferred, and retired
- Recent project activity
- Real-time stats integration

### 4. Wallet Integration
- Multiple wallet support (Phantom, Solflare, etc.)
- Automatic network configuration
- Transaction signing and confirmation

## Technical Implementation

### Solana Integration
```typescript
// BlueCarbonClient handles blockchain interactions
class BlueCarbonClient {
  async registerProject(data: ProjectFormData): Promise<TransactionResult>
  async mintCredits(data: CreditMintData): Promise<TransactionResult>
  async transferCredits(data: CreditTransferData): Promise<TransactionResult>
  async retireCredits(data: CreditRetireData): Promise<TransactionResult>
}
```

### Component Architecture
- **Form Components**: Handle user input with validation
- **Display Components**: Show project and credit information
- **Provider Components**: Manage state and wallet connections
- **Layout Components**: Structure and navigation

### Styling
- Ocean-blue and carbon-green color scheme
- Responsive design for mobile/desktop
- Accessible form components
- Loading states and error handling

## Next Steps
1. Install dependencies (`npm install` or `yarn install`)
2. Configure Solana network settings
3. Integrate with deployed smart contract
4. Add real-time data fetching
5. Implement IPFS metadata storage
6. Add transaction history view
7. Create admin dashboard for verification

## File Structure
```
web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   └── demo.tsx
│   ├── components/
│   │   ├── WalletProvider.tsx
│   │   ├── Header.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── CreditMintForm.tsx
│   │   ├── CreditTransferForm.tsx
│   │   └── CreditRetireForm.tsx
│   ├── lib/
│   │   └── solana.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## Solana Program Integration
The frontend is designed to integrate with the Anchor-based Solana program that includes:
- `register_project`: Create new carbon offset projects
- `mint_credits`: Issue carbon credits for verified projects
- `transfer_credits`: Move credits between accounts
- `retire_credits`: Permanently remove credits from circulation

Each form component corresponds to these program instructions and handles the required parameters, transaction building, and user feedback.
