# Blue Carbon Registry - Integration TODO

## 🎯 Objective: Connect Frontend UI to Blockchain Instructions

This document outlines the remaining work to achieve full end-to-end functionality.

---

## Priority 1: Admin Dashboard Blockchain Integration

### Task 1.1: Initialize Registry Function
**File**: `web-app/src/app/admin/page.tsx`

**Current State**:
```typescript
const handleInitializeRegistry = async () => {
  console.log('Initializing registry...');
  // TODO: Implement actual blockchain call
};
```

**Required Implementation**:
```typescript
const handleInitializeRegistry = async () => {
  try {
    setLoading(true);
    
    // Get Anchor program instance
    const program = getProgram(connection, wallet);
    
    // Generate registry PDA
    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_registry")],
      program.programId
    );
    
    // Call initialize_registry instruction
    const tx = await program.methods
      .initializeRegistry()
      .accounts({
        registry: registryPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Registry initialized:", tx);
    setIsInitialized(true);
    
  } catch (error) {
    console.error("Failed to initialize:", error);
    alert("Registry initialization failed");
  } finally {
    setLoading(false);
  }
};
```

**Dependencies**:
- Import Anchor program from `@coral-xyz/anchor`
- Create `getProgram()` helper function
- Import IDL from `target/idl/blue_carbon_registry.json`

---

## Priority 2: Verification System Integration

### Task 2.1: Connect Approve/Reject Buttons
**File**: `web-app/src/components/VerificationSystem.tsx`

**Current State**: UI displays form but doesn't call blockchain

**Required Implementation**:
```typescript
const handleApprove = async () => {
  try {
    const program = getProgram(connection, wallet);
    
    // Get PDAs
    const [projectPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("project"), Buffer.from(selectedProject.id)],
      program.programId
    );
    
    const [verificationNodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification_node"), projectPda.toBuffer()],
      program.programId
    );
    
    // Call verify_project instruction
    const tx = await program.methods
      .verifyProject(
        verificationReport.cid,  // IPFS CID
        verificationReport.carbonEstimate,
        true  // approved
      )
      .accounts({
        project: projectPda,
        verificationNode: verificationNodePda,
        validator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Project verified:", tx);
    alert("Project approved successfully!");
    
  } catch (error) {
    console.error("Verification failed:", error);
  }
};
```

**Additional Features**:
- Add reject functionality (approved = false)
- Show transaction confirmation toast
- Refresh project list after verification
- Display verification history

---

## Priority 3: Monitoring Data Integration

### Task 3.1: Submit Monitoring Data
**File**: `web-app/src/components/MonitoringDataForm.tsx`

**Current State**: Form collects data but doesn't submit to blockchain

**Required Implementation**:
```typescript
const handleSubmit = async (formData) => {
  try {
    const program = getProgram(connection, wallet);
    
    // Upload supporting documents to IPFS
    const documentCids = await uploadToIPFS(formData.documents);
    
    // Get project PDA
    const [projectPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("project"), Buffer.from(formData.projectId)],
      program.programId
    );
    
    // Get monitoring data PDA
    const [monitoringDataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("monitoring_data"),
        projectPda.toBuffer(),
        new BN(Date.now()).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    
    // Call submit_monitoring_data instruction
    const tx = await program.methods
      .submitMonitoringData({
        biomassDensity: formData.biomassDensity,
        canopyCover: formData.canopyCover,
        co2Sequestration: formData.co2Sequestration,
        waterQuality: formData.waterQuality,
        documentCids,
        notes: formData.notes,
      })
      .accounts({
        project: projectPda,
        monitoringData: monitoringDataPda,
        submitter: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Monitoring data submitted:", tx);
    alert("Data submitted successfully!");
    resetForm();
    
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
```

---

## Priority 4: Helper Functions & Infrastructure

### Task 4.1: Create Anchor Program Helper
**File**: `web-app/src/lib/anchor.ts` (NEW)

```typescript
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../../target/idl/blue_carbon_registry.json';
import { BlueCarbonRegistry } from '../../target/types/blue_carbon_registry';

export function getProgram(
  connection: Connection,
  wallet: any
): Program<BlueCarbonRegistry> {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  const programId = new PublicKey(idl.metadata.address);
  return new Program(idl as any, programId, provider);
}

export function getRegistryPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("global_registry")],
    programId
  );
}

export function getProjectPda(projectId: string, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("project"), Buffer.from(projectId)],
    programId
  );
}

export function getVerificationNodePda(
  projectPda: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("verification_node"), projectPda.toBuffer()],
    programId
  );
}
```

### Task 4.2: IPFS Upload Helper
**File**: `web-app/src/lib/ipfs.ts` (EXTEND)

```typescript
export async function uploadDocuments(files: File[]): Promise<string[]> {
  const cids: string[] = [];
  
  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Using Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      cids.push(data.IpfsHash);
    } catch (error) {
      console.error('IPFS upload failed:', file.name, error);
    }
  }
  
  return cids;
}

export async function uploadJSON(data: any): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  return result.IpfsHash;
}
```

### Task 4.3: Transaction Error Handling
**File**: `web-app/src/lib/errors.ts` (NEW)

```typescript
export function parseTransactionError(error: any): string {
  if (error.message?.includes('User rejected')) {
    return 'Transaction cancelled by user';
  }
  
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient SOL balance for transaction';
  }
  
  // Parse Anchor program errors
  const anchorError = error.message?.match(/Error Code: (\w+)/);
  if (anchorError) {
    return formatAnchorError(anchorError[1]);
  }
  
  return error.message || 'Transaction failed';
}

function formatAnchorError(code: string): string {
  const errorMap: Record<string, string> = {
    'Unauthorized': 'You do not have permission to perform this action',
    'InvalidAuthority': 'Invalid authority for this operation',
    'RegistryNotInitialized': 'Registry has not been initialized',
    'ProjectNotVerified': 'Project must be verified first',
    'InsufficientCredits': 'Insufficient carbon credits',
    // Add more from errors.rs
  };
  
  return errorMap[code] || `Program error: ${code}`;
}
```

---

## Priority 5: Testing & Validation

### Task 5.1: Write Integration Tests
**File**: `tests/blue-carbon-registry.ts`

**Tests Needed**:
1. ✅ Initialize registry (admin only)
2. ✅ Register project (authenticated user)
3. ✅ Verify project (validator)
4. ✅ Submit monitoring data (project owner)
5. ✅ Mint credits (after verification)
6. ✅ Transfer credits
7. ✅ Retire credits
8. ✅ List on marketplace
9. ✅ Role-based access control enforcement

### Task 5.2: Manual Testing Checklist

**Registry Initialization**:
- [ ] Admin can initialize registry
- [ ] Non-admin cannot initialize
- [ ] Cannot initialize twice
- [ ] Registry PDA created correctly

**Project Registration**:
- [ ] User can register project with valid data
- [ ] IPFS documents uploaded successfully
- [ ] Project PDA created with correct data
- [ ] Event emitted with project details

**Verification**:
- [ ] Validator can approve project
- [ ] Validator can reject project
- [ ] Non-validator cannot verify
- [ ] Multi-validator consensus works
- [ ] Verification node created correctly

**Monitoring**:
- [ ] Can submit monitoring data
- [ ] IPFS documents linked correctly
- [ ] Monitoring history retrievable
- [ ] Data validates correctly

**Credits**:
- [ ] Can mint credits after verification
- [ ] Cannot mint before verification
- [ ] Token account created correctly
- [ ] Can transfer credits
- [ ] Can retire credits (permanent)

---

## Priority 6: UI/UX Improvements

### Task 6.1: Transaction Feedback
**Add to all blockchain calls**:
```typescript
// Loading state
const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

// Toast notifications
import { toast } from 'react-hot-toast';

toast.loading('Submitting transaction...');
// ... transaction
toast.success('Transaction confirmed!');
// or
toast.error('Transaction failed');
```

### Task 6.2: Transaction History
**Create component**: `web-app/src/components/TransactionHistory.tsx`

**Features**:
- Display recent transactions
- Link to Solana Explorer
- Filter by transaction type
- Export to CSV

### Task 6.3: Loading States
**Add to all pages**:
- Skeleton loaders while fetching blockchain data
- Disable buttons during transactions
- Progress indicators for multi-step processes

---

## Priority 7: Configuration & Deployment

### Task 7.1: Environment Variables
**File**: `web-app/.env.local`

```bash
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Program IDs
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

# IPFS
NEXT_PUBLIC_PINATA_JWT=your_jwt_here
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

### Task 7.2: Deploy to Devnet
**Steps**:
```bash
# 1. Build program
anchor build

# 2. Deploy to devnet
solana config set --url devnet
anchor deploy

# 3. Initialize registry (one-time)
# Use admin dashboard after deployment

# 4. Update frontend with program ID
# Copy from Anchor.toml [programs.devnet]

# 5. Deploy frontend to Vercel
vercel deploy
```

---

## Implementation Order

### Week 1: Core Integration
1. ✅ Create helper functions (anchor.ts, errors.ts)
2. ✅ Connect admin dashboard to initialize_registry
3. ✅ Test registry initialization on devnet

### Week 2: Primary Features
4. ✅ Implement verification approval/rejection
5. ✅ Connect monitoring data submission
6. ✅ Implement project registration
7. ✅ Test complete project lifecycle

### Week 3: Credit Operations
8. ✅ Implement credit minting
9. ✅ Implement credit transfers
10. ✅ Implement credit retirement
11. ✅ Add transaction history

### Week 4: Polish & Deploy
12. ✅ Add loading states and error handling
13. ✅ Write integration tests
14. ✅ Fix all ESLint warnings
15. ✅ Deploy to devnet
16. ✅ User acceptance testing

---

## Success Criteria

### Functional Requirements
- [ ] Admin can initialize registry
- [ ] Users can register projects
- [ ] Validators can verify projects
- [ ] Monitoring data can be submitted
- [ ] Credits can be minted, transferred, retired
- [ ] All transactions confirm on-chain
- [ ] Errors handled gracefully

### Non-Functional Requirements
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] All pages load in < 2s
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)
- [ ] SEO optimized

### Documentation
- [ ] README updated with setup instructions
- [ ] API documentation for program
- [ ] User guide for role assignment
- [ ] Deployment guide completed

---

## Notes

**Current Blockers**: None - all infrastructure in place

**Risk Areas**:
- IPFS upload failures (add retry logic)
- Transaction timeouts (increase timeout, better error messages)
- PDA derivation mismatches (unit test all PDA functions)

**Optimization Opportunities**:
- Cache blockchain data with SWR or React Query
- Batch multiple transactions
- Implement transaction compression (Solana v1.16+)
- Add websocket for real-time updates

---

**Last Updated**: $(date)  
**Status**: Ready for implementation  
**Estimated Completion**: 2-4 weeks
