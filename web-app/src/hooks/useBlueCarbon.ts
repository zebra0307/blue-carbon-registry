'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, Idl } from '@project-serum/anchor';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useState, useCallback, useMemo } from 'react';
import { BlueProjectData, MonitoringDataInput } from '@/types/blueCarbon';

// Define the interfaces for the hook
interface VerifierData {
  name: string;
  credentials: string[];
  specializations: string[];
  contactInfo: string;
  [key: string]: any;
}

interface MarketplaceListingInput {
  projectId: string;
  quantity: number;
  price: number;
  expiryDate: number;
  [key: string]: any;
}

// Import the IDL - you'll need to copy this from target/idl/blue_carbon_registry.json
const IDL = {
  // This should be the actual IDL from your compiled program
  // For now, using a placeholder structure
  version: "0.1.0",
  name: "blue_carbon_registry",
  instructions: [
    // Your program instructions will be here
  ],
  accounts: [
    // Your program accounts will be here
  ]
} as Idl;

  const PROGRAM_ID = new PublicKey('6q7u2DH9vswSbpPYZLyaamAyBXQeXBCPfcgmi1dikuQB');

interface BlueCarbonProgram {
  // Project Management
  registerProject: (projectData: BlueProjectData) => Promise<string>;
  registerBlueCarbon: (projectData: BlueProjectData) => Promise<string>;
  mintVerifiedCredits: (projectId: string, amount: number, verificationCid: string) => Promise<string>;
  
  // Verification System
  registerVerifier: (verifierData: VerifierData) => Promise<string>;
  multiPartyVerify: (projectId: string, verificationData: any) => Promise<string>;
  
  // Monitoring
  submitMonitoringData: (monitoringData: MonitoringDataInput) => Promise<string>;
  
  // Marketplace
  createMarketplaceListing: (listingData: MarketplaceListingInput) => Promise<string>;
  purchaseCredits: (listingId: string, amount: number) => Promise<string>;
  
  // Impact Reporting
  generateImpactReport: (projectId: string, reportData: any) => Promise<string>;
}

export function useBlueCarbon(): BlueCarbonProgram & {
  program: Program | null;
  loading: boolean;
  error: string | null;
} {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Anchor program
  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );

    return new Program(IDL, PROGRAM_ID, provider);
  }, [connection, wallet]);

  // Helper function to derive PDAs
  const getProjectPDA = useCallback((projectId: string) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('project'), Buffer.from(projectId)],
      PROGRAM_ID
    );
  }, []);

  const getRegistryPDA = useCallback(() => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      PROGRAM_ID
    );
  }, []);

  const getVerifierPDA = useCallback((verifierPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('verifier'), verifierPubkey.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  const getMonitoringPDA = useCallback((projectId: string, timestamp: number) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('monitoring'),
        Buffer.from(projectId),
        new BN(timestamp).toArrayLike(Buffer, 'le', 8)
      ],
      PROGRAM_ID
    );
  }, []);

  // Register basic project
  const registerProject = useCallback(async (projectData: BlueProjectData): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [projectPDA] = getProjectPDA(projectData.projectId);
      const [registryPDA] = getRegistryPDA();

      const tx = await program.methods
        .registerProject(
          projectData.projectId,
          projectData.ipfsCid,
          new BN(projectData.carbonTonsEstimated)
        )
        .accounts({
          project: projectPDA,
          registry: registryPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA, getRegistryPDA]);

  // Register blue carbon project with enhanced data
  const registerBlueCarbon = useCallback(async (projectData: BlueProjectData): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');
    if (!projectData.projectId) throw new Error('Project ID is required');
    if (!projectData.ipfsCid) throw new Error('IPFS CID is required');

    setLoading(true);
    setError(null);

    console.log('Starting Blue Carbon project registration...');
    console.log('Project data:', JSON.stringify(projectData, null, 2));
    console.log('Wallet connected:', wallet.publicKey.toString());

    try {
      const [projectPDA] = getProjectPDA(projectData.projectId);
      const [registryPDA] = getRegistryPDA();

      console.log('Using Project PDA:', projectPDA.toString());
      console.log('Using Registry PDA:', registryPDA.toString());

      // Validate ecosystem type
      const validEcosystemTypes = ['Mangrove', 'SaltMarsh', 'Seagrass', 'KelpForest', 'TidalWetland', 'BlueForest', 'MixedBlueCarbon'];
      if (!validEcosystemTypes.includes(projectData.ecosystemType)) {
        throw new Error(`Invalid ecosystem type: ${projectData.ecosystemType}`);
      }

      // Ensure all required fields have values
      if (!projectData.areaHectares || !projectData.biodiversityIndex || !projectData.speciesCountBaseline) {
        throw new Error('Missing required project data fields');
      }

      // Ensure location data is valid
      if (!projectData.location || !projectData.location.latitude || !projectData.location.longitude) {
        throw new Error('Invalid location data');
      }

      // Prepare ecosystem data
      const ecosystemData = {
        ecosystemType: { [projectData.ecosystemType.toLowerCase()]: {} },
        areaHectares: projectData.areaHectares,
        location: {
          latitude: projectData.location.latitude,
          longitude: projectData.location.longitude,
          countryCode: projectData.location.countryCode || '',
          regionName: projectData.location.regionName || '',
          polygonCoordinates: projectData.location.polygonCoordinates || []
        },
        biodiversityIndex: projectData.biodiversityIndex,
        speciesCountBaseline: new BN(projectData.speciesCountBaseline),
        speciesComposition: projectData.speciesComposition || [],
        aboveGroundBiomass: projectData.aboveGroundBiomass || 0,
        belowGroundBiomass: projectData.belowGroundBiomass || 0,
        soilCarbon0To30cm: projectData.soilCarbon0To30cm || 0,
        soilCarbon30To100cm: projectData.soilCarbon30To100cm || 0,
        sequestrationRateAnnual: projectData.sequestrationRateAnnual || 0,
        coBenefits: (projectData.coBenefits || []).map(benefit => ({ [benefit.toLowerCase().replace(/\s+/g, '')]: {} })),
        vcsMethodology: projectData.vcsMethodology || '',
        permanenceGuaranteeYears: new BN(projectData.permanenceGuaranteeYears || 0)
      };

      console.log('Prepared ecosystem data for blockchain:', ecosystemData);
      console.log('Calling program.methods.registerBlueCarbonProject...');

      const tx = await program.methods
        .registerBlueCarbonProject(
          projectData.projectId,
          projectData.ipfsCid,
          ecosystemData,
          new BN(projectData.carbonTonsEstimated)
        )
        .accounts({
          project: projectPDA,
          registry: registryPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log('Transaction successful!', tx);
      return tx;
    } catch (err: any) {
      console.error('Error in registerBlueCarbon:', err);
      
      // Extract more meaningful error message
      let errorMessage = 'Unknown error during project registration';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle common Solana/Anchor errors
        if (errorMessage.includes('Attempt to debit an account but found no record of a prior credit')) {
          errorMessage = 'Not enough SOL in wallet to complete transaction. Please add more funds.';
        } else if (errorMessage.includes('custom program error: 0x1')) {
          errorMessage = 'Project ID already exists. Please choose a different Project ID.';
        } else if (errorMessage.toLowerCase().includes('failed to send transaction')) {
          errorMessage = 'Failed to send blockchain transaction. Please check your wallet connection.';
        } else if (errorMessage.includes('0x0')) {
          errorMessage = 'Smart contract error. The project registration instructions could not be processed.';
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA, getRegistryPDA]);

  // Mint verified credits
  const mintVerifiedCredits = useCallback(async (
    projectId: string,
    amount: number,
    verificationCid: string
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [projectPDA] = getProjectPDA(projectId);
      const [registryPDA] = getRegistryPDA();

      // Get or create associated token account
      const mintAddress = new PublicKey('YourCarbonCreditMintAddress'); // Replace with actual mint
      const tokenAccount = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

      const tx = await program.methods
        .mintVerifiedCredits(
          projectId,
          new BN(amount),
          verificationCid
        )
        .accounts({
          project: projectPDA,
          registry: registryPDA,
          mint: mintAddress,
          tokenAccount: tokenAccount,
          owner: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA, getRegistryPDA]);

  // Register verifier
  const registerVerifier = useCallback(async (verifierData: VerifierData): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [verifierPDA] = getVerifierPDA(wallet.publicKey);
      const [registryPDA] = getRegistryPDA();

      const tx = await program.methods
        .registerVerifier(
          verifierData.name,
          verifierData.credentials,
          verifierData.specializations,
          verifierData.contactInfo
        )
        .accounts({
          verifier: verifierPDA,
          registry: registryPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getVerifierPDA, getRegistryPDA]);

  // Multi-party verification
  const multiPartyVerify = useCallback(async (
    projectId: string,
    verificationData: any
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [projectPDA] = getProjectPDA(projectId);
      const [verifierPDA] = getVerifierPDA(wallet.publicKey);

      const tx = await program.methods
        .multiPartyVerifyProject(
          projectId,
          verificationData.approved,
          verificationData.confidenceScore,
          verificationData.reportCid
        )
        .accounts({
          project: projectPDA,
          verifier: verifierPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA, getVerifierPDA]);

  // Submit monitoring data
  const submitMonitoringData = useCallback(async (
    monitoringData: MonitoringDataInput
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const projectId = monitoringData.projectId;
      const timestamp = monitoringData.timestamp || Math.floor(Date.now() / 1000);
      const [projectPDA] = getProjectPDA(projectId);
      const [monitoringPDA] = getMonitoringPDA(projectId, timestamp);

      const tx = await program.methods
        .submitMonitoringData(
          monitoringData.projectId,
          new BN(monitoringData.timestamp || Math.floor(Date.now() / 1000)),
          monitoringData.carbonStock,
          monitoringData.biodiversityMeasurements,
          (monitoringData.waterQualityIndices || []).map(wq => ({
            parameter: wq.parameter,
            value: wq.value
          })),
          monitoringData.satelliteImageCid,
          monitoringData.fieldObservationsCid,
          {
            temperature: monitoringData.temperature || 0,
            salinity: monitoringData.salinity || 0,
            tidalHeight: monitoringData.tidalHeight || 0,
            sedimentationRate: monitoringData.sedimentationRate || 0
          },
          monitoringData.qaProtocol || '',
          monitoringData.dataValidated || false
        )
        .accounts({
          project: projectPDA,
          monitoringData: monitoringPDA,
          submitter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA, getMonitoringPDA]);

  // Create marketplace listing
  const createMarketplaceListing = useCallback(async (
    listingData: MarketplaceListingInput
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [projectPDA] = getProjectPDA(listingData.projectId);
      const listingPDA = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), projectPDA.toBuffer()],
        PROGRAM_ID
      )[0];

      const tx = await program.methods
        .createMarketplaceListing(
          listingData.projectId,
          new BN(listingData.creditsAvailable),
          listingData.pricePerCredit,
          listingData.vintage,
          listingData.certificationStandard || ''
        )
        .accounts({
          listing: listingPDA,
          project: projectPDA,
          seller: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA]);

  // Purchase credits
  const purchaseCredits = useCallback(async (
    listingId: string,
    amount: number
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const listingPDA = new PublicKey(listingId);
      
      const tx = await program.methods
        .purchaseCredits(new BN(amount))
        .accounts({
          listing: listingPDA,
          buyer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  // Generate impact report
  const generateImpactReport = useCallback(async (
    projectId: string,
    reportData: any
  ): Promise<string> => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized');

    setLoading(true);
    setError(null);

    try {
      const [projectPDA] = getProjectPDA(projectId);
      const reportPDA = PublicKey.findProgramAddressSync(
        [Buffer.from('impact_report'), projectPDA.toBuffer()],
        PROGRAM_ID
      )[0];

      const tx = await program.methods
        .generateImpactReport(
          projectId,
          reportData.reportingPeriodStart,
          reportData.reportingPeriodEnd,
          reportData.totalCarbonSequestered,
          reportData.biodiversityImpact,
          reportData.communityBenefits,
          reportData.economicImpact,
          reportData.reportCid
        )
        .accounts({
          impactReport: reportPDA,
          project: projectPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getProjectPDA]);

  return {
    program,
    loading,
    error,
    registerProject,
    registerBlueCarbon,
    mintVerifiedCredits,
    registerVerifier,
    multiPartyVerify,
    submitMonitoringData,
    createMarketplaceListing,
    purchaseCredits,
    generateImpactReport,
  };
}