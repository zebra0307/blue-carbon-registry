# Blue Carbon Verification System Design

## 1. VERIFICATION AUTHORITY STRUCTURE

### Multi-Signature Verification System
```rust
pub struct VerificationAuthority {
    pub authority_id: String,
    pub authority_type: AuthorityType,
    pub verification_key: Pubkey,
    pub certification_level: u8,
    pub active: bool,
}

pub enum AuthorityType {
    Scientific,
    CarbonStandard,
    Government,
    ThirdParty,
}
```

### Verification Workflow
1. **Document Submission** → IPFS + On-chain hash
2. **Multi-sig Approval** → 3 of 5 authorities must approve
3. **Field Verification** → GPS coordinates, photos, measurements
4. **Scientific Review** → Carbon calculation validation
5. **Final Approval** → Enable credit minting

## 2. DOCUMENT MANAGEMENT SYSTEM

### On-Chain Data (Small, Critical)
- Project metadata
- Verification status
- Authority signatures
- IPFS content hashes
- Carbon calculations

### Off-Chain Data (Large, Detailed)
- Satellite imagery
- Field photos
- Scientific reports
- Monitoring data
- Legal documents

### IPFS Integration
```typescript
interface ProjectDocuments {
  projectProposal: IPFSHash;
  landRights: IPFSHash;
  baselineStudy: IPFSHash;
  monitoringProtocol: IPFSHash;
  fieldPhotos: IPFSHash[];
  satelliteImagery: IPFSHash[];
  scientificReports: IPFSHash[];
}
```

## 3. VERIFICATION SMART CONTRACT

```rust
#[derive(Accounts)]
pub struct VerifyProject<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    pub authority: Signer<'info>,
    #[account(
        constraint = verification_authority.authority_key == authority.key(),
        constraint = verification_authority.active == true
    )]
    pub verification_authority: Account<'info, VerificationAuthority>,
}

pub fn verify_project(
    ctx: Context<VerifyProject>,
    verification_type: VerificationType,
    carbon_calculation: u64,
    ipfs_evidence_hash: String,
) -> Result<()> {
    // Verification logic
}
```

## 4. CARBON CALCULATION METHODOLOGY

### Blue Carbon Calculation Formula
```
Total Carbon Credits = (Area × Carbon Density × Time Period × Additionality Factor)

Where:
- Area: Hectares of restored/protected ecosystem
- Carbon Density: tCO2/ha/year (species and location specific)
- Time Period: Crediting period (typically 10-30 years)
- Additionality Factor: 0.7-0.9 (conservative estimates)
```

### Example Calculations:
- **Mangroves**: 2-8 tCO2/ha/year
- **Seagrass**: 1-5 tCO2/ha/year  
- **Salt Marshes**: 2-6 tCO2/ha/year