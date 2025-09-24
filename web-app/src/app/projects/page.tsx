'use client';

import React from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { TreePine, MapPin, Calendar, Award, DollarSign, Activity, Eye, ArrowRight } from 'lucide-react';
import { useUserProjects, useAllProjects } from '@/hooks/useBlockchainData';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const mockProjects = [
  {
    id: '1',
    name: 'Sundarbans Mangrove Restoration',
    location: 'Bangladesh',
    type: 'Mangrove Restoration',
    status: 'Active',
    creditsIssued: 45000,
    creditsAvailable: 32000,
    price: 25.50,
    vintage: 2024,
    areaSize: 850,
    developer: 'Blue Carbon Solutions Ltd.'
  },
  {
    id: '2',
    name: 'Great Barrier Reef Seagrass Conservation',
    location: 'Australia',
    type: 'Seagrass Conservation',
    status: 'Verified',
    creditsIssued: 28000,
    creditsAvailable: 28000,
    price: 32.75,
    vintage: 2023,
    areaSize: 1200,
    developer: 'Marine Conservation Australia'
  },
  {
    id: '3',
    name: 'Florida Everglades Wetland Protection',
    location: 'USA',
    type: 'Wetland Protection',
    status: 'Pending',
    creditsIssued: 0,
    creditsAvailable: 0,
    price: 28.00,
    vintage: 2024,
    areaSize: 2500,
    developer: 'Everglades Conservation Trust'
  }
];

function MyProjectsContent() {
  const { projects: userProjects, loading: userLoading, error: userError } = useUserProjects();
  const { projects: allProjects, loading: allLoading, error: allError } = useAllProjects();
  const { connected } = useWallet();
  const router = useRouter();

  // Use all projects if user projects are empty or there's an error
  const projects = userProjects.length > 0 ? userProjects : allProjects;
  const loading = userLoading || allLoading;
  const error = userError || allError;

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">Manage and monitor your blue carbon projects from the blockchain</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Wallet Not Connected</h3>
          <p className="text-yellow-600 mb-4">Please connect your Solana wallet to view your projects.</p>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">Loading your blockchain projects...</p>
          <div className="text-xs text-gray-400 mt-2">
            Debug: User projects: {userProjects.length}, All projects: {allProjects.length}
          </div>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h1>
        <p className="text-gray-600">Manage and monitor your blue carbon projects from the blockchain</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading projects: {error}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <div 
              onClick={() => router.push(`/projects/${project.id}`)}
              className="h-32 bg-gradient-to-br from-blue-100 to-green-100 relative"
            >
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' :
                  project.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'Active' && <Activity className="h-3 w-3 mr-1" />}
                  {project.status === 'Verified' && <Award className="h-3 w-3 mr-1" />}
                  {project.status === 'Pending' && <Calendar className="h-3 w-3 mr-1" />}
                  {project.status}
                </span>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push(`/projects/${project.id}`)}
              className="p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center">
                  <TreePine className="h-4 w-4 mr-2" />
                  {project.type}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Project ID: {project.id}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Area Size</p>
                    <p className="font-semibold">{project.areaSize} ha</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Credits Available</p>
                    <p className="font-semibold text-green-600">{project.creditsAvailable.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all group-hover:bg-blue-700" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click to view details and manage files</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Get started by registering your first blue carbon project</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Register Project
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyProjectsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <MyProjectsContent />
      </Layout>
    </SolanaWalletProvider>
  );
}