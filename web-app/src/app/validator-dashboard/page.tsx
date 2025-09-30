'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Layout } from '@/components/Navigation';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  MapPin, 
  TreePine,
  Award,
  AlertTriangle,
  Download,
  ExternalLink
} from 'lucide-react';
import { getAllProjects, verifyProject } from '@/utils/solana';
import { getFileFromIPFS } from '@/utils/ipfs';

interface Project {
  id: string;
  projectId: string;
  name: string;
  owner: string;
  location: string;
  type: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  carbonTonsEstimated: number;
  ipfsCid: string;
  creditsIssued: number;
  submissionDate: Date;
  developer: string;
}

function ValidatorDashboardContent() {
  const wallet = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  // Load all projects for validation
  useEffect(() => {
    const loadProjects = async () => {
      if (!wallet.connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAllProjects(wallet);
        
        if (response.success && response.projects) {
          const formattedProjects: Project[] = response.projects.map((project: any) => ({
            id: project.account.toString(),
            projectId: project.projectId,
            name: `Blue Carbon Project ${project.projectId}`,
            owner: project.owner,
            location: 'Coastal Area',
            type: 'Blue Carbon',
            status: project.verificationStatus ? 'verified' : 'pending',
            carbonTonsEstimated: project.carbonTonsEstimated,
            ipfsCid: project.ipfsCid,
            creditsIssued: project.creditsIssued,
            submissionDate: new Date(),
            developer: project.owner
          }));
          
          setProjects(formattedProjects);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error loading projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [wallet.connected]);

  const handleVerifyProject = async (project: Project, carbonTons: number, approve: boolean) => {
    if (!wallet.connected) {
      alert('Please connect your wallet to verify projects');
      return;
    }

    try {
      setVerifying(project.id);
      
      if (approve) {
        const projectOwnerPubkey = new PublicKey(project.owner);
        const result = await verifyProject(wallet, projectOwnerPubkey, project.projectId, carbonTons);
        if (result.success) {
          alert('Project verified successfully!');
          // Reload projects
          window.location.reload();
        } else {
          throw new Error(result.error || 'Verification failed');
        }
      } else {
        // For rejection, we would need a different function
        alert('Project rejection functionality to be implemented');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      alert(`Verification failed: ${error.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const viewIPFSContent = async (ipfsCid: string) => {
    try {
      const result = await getFileFromIPFS(ipfsCid);
      if (result.success && result.data) {
        console.log('IPFS Content:', result.data);
        alert(`IPFS Content loaded - check browser console for details`);
      } else {
        throw new Error(result.error || 'Failed to retrieve IPFS content');
      }
    } catch (error) {
      console.error('Error retrieving IPFS content:', error);
      alert('Failed to load IPFS content');
    }
  };

  if (!wallet.connected) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Validator Dashboard</h1>
          <p className="text-gray-600">Review and verify blue carbon projects</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Wallet Not Connected</h3>
          <p className="text-yellow-600 mb-4">Please connect your Solana wallet to access validator features.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Validator Dashboard</h1>
          <p className="text-gray-600">Loading projects for validation...</p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pendingProjects = projects.filter(p => p.status === 'pending');
  const verifiedProjects = projects.filter(p => p.status === 'verified');
  const rejectedProjects = projects.filter(p => p.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Validator Dashboard</h1>
        <p className="text-gray-600">Review and verify blue carbon projects on the blockchain</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingProjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Verified</p>
                <p className="text-2xl font-bold text-green-900">{verifiedProjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{rejectedProjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Total</p>
                <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Projects */}
      {pendingProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Verification</h2>
          <div className="space-y-4">
            {pendingProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <TreePine className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                      <div>
                        Carbon Estimate: {project.carbonTonsEstimated} tons
                      </div>
                      <div>
                        Developer: {project.developer.slice(0, 8)}...
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Project ID: {project.projectId}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewIPFSContent(project.ipfsCid)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Projects</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No projects found on the blockchain</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carbon Tons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPFS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.projectId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'verified' 
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.carbonTonsEstimated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.ipfsCid ? (
                        <button
                          onClick={() => viewIPFSContent(project.ipfsCid)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      ) : (
                        'No data'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {project.status === 'pending' && (
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Verify Project: {selectedProject.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Project ID: {selectedProject.projectId}</p>
                <p className="text-sm text-gray-600">Developer: {selectedProject.developer}</p>
                <p className="text-sm text-gray-600">Estimated Carbon: {selectedProject.carbonTonsEstimated} tons</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verified Carbon Tons
                </label>
                <input
                  type="number"
                  id="verifiedCarbon"
                  defaultValue={selectedProject.carbonTonsEstimated}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const input = document.getElementById('verifiedCarbon') as HTMLInputElement;
                    const carbonTons = parseInt(input.value);
                    handleVerifyProject(selectedProject, carbonTons, true);
                    setSelectedProject(null);
                  }}
                  disabled={verifying === selectedProject.id}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {verifying === selectedProject.id ? 'Verifying...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => {
                    handleVerifyProject(selectedProject, 0, false);
                    setSelectedProject(null);
                  }}
                  disabled={verifying === selectedProject.id}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ValidatorDashboard() {
  return (
    <Layout>
      <ValidatorDashboardContent />
    </Layout>
  );
}