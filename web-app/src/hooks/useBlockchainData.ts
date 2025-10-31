import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  getGlobalRegistryData,
  getProjectData,
  getCarbonTokenBalance,
  getAllTokenAccounts,
  getTokenBalance,
  formatPublicKey,
  isWalletConnected,
  getAllUserProjects,
  getAllProjects
} from '@/utils/solana';
import { withRegistryCheck } from '@/utils/registryManager';

// Types for blockchain data
export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  creditsIssued: number;
  creditsAvailable: number;
  price: number;
  progress: number;
  developer: string;
  certificationStandard: string;
  vintage: number;
  areaSize: number;
  carbonSequestered: number;
  description: string;
  owner: string;
  verified: boolean;
}

export interface RegistryStats {
  totalProjects: number;
  totalCredits: number;
  totalInvestment: number;
  carbonSequestered: number;
  ecosystemArea: number;
  communityImpact: number;
}

// Hook to get global registry statistics
export function useRegistryStats() {
  const wallet = useWallet();
  const [stats, setStats] = useState<RegistryStats>({
    totalProjects: 0,
    totalCredits: 0,
    totalInvestment: 0,
    carbonSequestered: 0,
    ecosystemArea: 0,
    communityImpact: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistryData = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getGlobalRegistryData(wallet);
      
      if (result.success && result.data) {
        setStats({
          totalProjects: result.data.totalProjects || 0,
          totalCredits: result.data.totalCreditsIssued || 0,
          totalInvestment: 0, // Not tracked in current registry
          carbonSequestered: 0, // Not tracked in current registry
          ecosystemArea: 0, // Not tracked in current registry
          communityImpact: 0, // Not tracked in current registry
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error loading registry stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load registry stats');
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    loadRegistryData();
  }, [loadRegistryData]);

  return { stats, loading, error, refetch: loadRegistryData };
}

// Hook to get user's projects
export function useUserProjects() {
  const wallet = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProjects = useCallback(async () => {
    console.log('🔄 loadUserProjects called, wallet state:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      isWalletConnected: isWalletConnected(wallet)
    });

    if (!isWalletConnected(wallet) || !wallet.publicKey) {
      console.log('❌ Wallet not connected or no public key:', { 
        connected: wallet.connected, 
        publicKey: wallet.publicKey?.toString() 
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching projects for wallet:', wallet.publicKey.toString());
      
      // Use registry check wrapper to ensure registry exists
      const result = await withRegistryCheck(wallet, async () => {
        return await getAllUserProjects(wallet, wallet.publicKey!);
      });

      const userProjects: Project[] = [];

      console.log('🚀 getAllUserProjects result:', result);

      if (result.success && result.data?.success && result.data.projects) {
        console.log('✅ Found projects:', result.data.projects.length, result.data.projects);
        
        result.data.projects.forEach((data: any) => {
          const project: Project = {
            id: data.projectId,
            name: `Blue Carbon Project ${data.projectId}`,
            location: 'Coastal Area',
            type: 'Mangrove Restoration',
            status: data.verificationStatus ? 'Verified' : 'Active',
            creditsIssued: parseInt(data.creditsIssued) || 0,
            creditsAvailable: parseInt(data.creditsIssued) - parseInt(data.tokensMinted) || 0,
            price: 25.50,
            progress: data.verificationStatus ? 95 : 60,
            developer: wallet.publicKey ? formatPublicKey(wallet.publicKey) : 'Unknown',
            certificationStandard: 'VCS',
            vintage: new Date().getFullYear(),
            areaSize: parseInt(data.carbonTonsEstimated) / 10 || 100,
            carbonSequestered: parseInt(data.carbonTonsEstimated) || 0,
            description: `Blue carbon project in coastal area - IPFS: ${data.ipfsCid}`,
            owner: data.owner,
            verified: data.verificationStatus || false
          };
          userProjects.push(project);
        });
      } else {
        console.log('No projects found or error:', result.error || result.data?.error);
      }

      setProjects(userProjects);
      setError(null);
    } catch (err) {
      console.error('Error loading user projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    console.log('🔥 useUserProjects useEffect triggered:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString()
    });
    loadUserProjects();
  }, [loadUserProjects]);

  return { projects, loading, error, refetch: loadUserProjects };
}

// Hook to get user's carbon token balance
export function useCarbonBalance() {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!isWalletConnected(wallet) || !wallet.publicKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tokenBalance = await getCarbonTokenBalance(wallet, wallet.publicKey);
      setBalance(tokenBalance && tokenBalance.success && tokenBalance.balance ? tokenBalance.balance : 0);
      setError(null);
    } catch (err) {
      console.error('Error loading carbon balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return { balance, loading, error, refetch: loadBalance };
}

// Hook to get all projects from the registry (for marketplace)
export function useAllProjects() {
  const wallet = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllProjects = async () => {
    try {
      setLoading(true);
      console.log('🌐 Fetching all projects from blockchain...');
      
      // Create a mock wallet for connection (no signing needed for reading)
      const mockWallet = {
        publicKey: null,
        connected: false,
        signTransaction: null,
        signAllTransactions: null
      };
      
      // Get all projects from the blockchain
      const response = await getAllProjects(mockWallet);
      const allProjects: Project[] = [];

      if (response.success && response.projects) {
        console.log('Found all projects:', response.projects.length);
        
        response.projects.forEach((data: any) => {
          const project: Project = {
            id: data.projectId,
            name: `Blue Carbon Project ${data.projectId}`,
            location: 'Coastal Area',
            type: 'Mangrove Restoration',
            status: data.verificationStatus ? 'Verified' : 'Active',
            creditsIssued: parseInt(data.creditsIssued) || 0,
            creditsAvailable: parseInt(data.creditsIssued) - parseInt(data.tokensMinted) || 0,
            price: 25.50 + Math.random() * 10,
            progress: data.verificationStatus ? 95 : 60,
            developer: data.owner,
            certificationStandard: 'VCS',
            vintage: 2024,
            areaSize: parseInt(data.carbonTonsEstimated) / 10 || 100,
            carbonSequestered: parseInt(data.carbonTonsEstimated) || 0,
            description: `Blue carbon project in coastal area - IPFS: ${data.ipfsCid}`,
            owner: data.owner,
            verified: data.verificationStatus || false
          };
          allProjects.push(project);
        });
      } else {
        console.log('No projects found or error:', response.error);
      }

      setProjects(allProjects);
      setError(null);
    } catch (err) {
      console.error('Error loading all projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProjects();
  }, [wallet.connected]);

  return { projects, loading, error, refetch: loadAllProjects };
}

// Hook for token economics data
export function useTokenEconomics() {
  const wallet = useWallet();
  const [economics, setEconomics] = useState({
    totalSupply: 0,
    circulatingSupply: 0,
    marketCap: 0,
    volume24h: 0,
    priceChange24h: 0,
    totalValueLocked: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokenEconomics = useCallback(async () => {
    if (!isWalletConnected(wallet)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const registryData = await getGlobalRegistryData(wallet);
      const balance = await getCarbonTokenBalance(wallet);
      
      const totalCredits = registryData && registryData.success && registryData.data 
        ? parseInt(registryData.data.totalCreditsIssued) 
        : 0;
      
      setEconomics({
        totalSupply: totalCredits,
        circulatingSupply: totalCredits,
        marketCap: totalCredits * 25.50,
        volume24h: Math.floor(Math.random() * 100000),
        priceChange24h: (Math.random() - 0.5) * 10,
        totalValueLocked: totalCredits * 25.50
      });
      
      setError(null);
    } catch (err) {
      console.error('Error loading token economics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load token economics');
    } finally {
      setLoading(false);
    }
  }, [wallet.connected]);

  useEffect(() => {
    loadTokenEconomics();
  }, [loadTokenEconomics]);

  return { economics, loading, error, refetch: loadTokenEconomics };
}