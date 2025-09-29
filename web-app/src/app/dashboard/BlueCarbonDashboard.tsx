'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useBlueCarbon } from '@/hooks/useBlueCarbon';
import * as useBlockchainData from '@/hooks/useBlockchainData';
import BlueProjectRegistrationForm from '@/components/BlueProjectRegistrationForm';
import MonitoringDataForm from '@/components/MonitoringDataForm';
import ProjectDashboard from '@/components/ProjectDashboard';
import DebugPanel from '@/components/DebugPanel';
import { BlueProjectData, MonitoringDataInput, EnhancedProject } from '@/types/blueCarbon';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { logger } from '@/utils/logger';

type ViewMode = 'overview' | 'register' | 'monitoring' | 'marketplace' | 'verification';

export default function BlueCarbonDashboard() {
  const { connected, publicKey } = useWallet();
  const blueCarbon = useBlueCarbon();
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(process.env.NODE_ENV === 'development');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  // Add notification
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Mock data for demonstration
  const mockProjects = useMemo(() => [
    {
      id: 'project-001',
      name: 'Everglades Blue Carbon Restoration',
      owner: 'Florida Conservation Foundation',
      status: 'active',
      ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      carbonTonsEstimated: 50000,
      creditsIssued: 35000,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 180, // 6 months ago
      ecosystemData: {
        ecosystemType: 'MixedBlueCarbon' as const,
        areaHectares: 1250.5,
        location: {
          latitude: 25.2866,
          longitude: -80.8987,
          countryCode: 'USA',
          regionName: 'South Florida Everglades',
          polygonCoordinates: []
        },
        biodiversityIndex: 0.87,
        speciesCountBaseline: 142,
        speciesComposition: ['Red Mangrove', 'Black Mangrove', 'White Mangrove', 'Seagrass', 'Salt Marsh'],
        aboveGroundBiomass: 125.8,
        belowGroundBiomass: 89.3,
        soilCarbon0To30cm: 234.7,
        soilCarbon30To100cm: 156.2,
        sequestrationRateAnnual: 12.4,
        coBenefits: ['StormProtection', 'WaterPurification', 'BiodiversityConservation', 'CommunityLivelihoods'],
        vcsMethodology: 'VM0033',
        permanenceGuaranteeYears: 30
      }
    },
    {
      id: 'project-002',
      name: 'Chesapeake Bay Seagrass Initiative',
      owner: 'Chesapeake Bay Foundation',
      status: 'pending',
      ipfsCid: 'QmPChd2hVbrJ4bfo8seZnsToHhzLGATJm3SKTgAtNhZWaJ',
      carbonTonsEstimated: 25000,
      creditsIssued: 0,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 60, // 2 months ago
      ecosystemData: {
        ecosystemType: 'Seagrass' as const,
        areaHectares: 890.2,
        location: {
          latitude: 38.8048,
          longitude: -76.4951,
          countryCode: 'USA',
          regionName: 'Chesapeake Bay, Maryland',
          polygonCoordinates: []
        },
        biodiversityIndex: 0.72,
        speciesCountBaseline: 89,
        speciesComposition: ['Zostera marina', 'Ruppia maritima', 'Blue Crab', 'Striped Bass'],
        aboveGroundBiomass: 45.2,
        belowGroundBiomass: 67.8,
        soilCarbon0To30cm: 189.3,
        soilCarbon30To100cm: 123.7,
        sequestrationRateAnnual: 8.7,
        coBenefits: ['WaterPurification', 'BiodiversityConservation', 'RecreationalFisheries'],
        vcsMethodology: 'VM0033',
        permanenceGuaranteeYears: 25
      }
    }
  ], []);

  // Mock monitoring data
  const mockMonitoringData = [
    {
      projectId: 'project-001',
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
      carbonStock: 48750.5,
      biodiversityMeasurements: ['Species count: 145', 'Shannon diversity: 3.42'],
      waterQualityIndices: [
        { parameter: 'pH', value: 7.8 },
        { parameter: 'Dissolved Oxygen', value: 6.2 },
        { parameter: 'Turbidity', value: 12.5 }
      ],
      satelliteImageCid: 'QmSatelliteImg123',
      fieldObservationsCid: 'QmFieldObs456',
      temperature: 24.5,
      salinity: 35.2,
      tidalHeight: 1.8,
      sedimentationRate: 0.45,
      qaProtocol: 'IPCC Wetlands Supplement 2013',
      dataValidated: true,
      measurementConfidence: 0.92
    }
  ];

  // Import and use the useBlockchainData hook
  const { projects: userProjects, loading: projectsLoading } = useBlockchainData.useUserProjects();
  
  useEffect(() => {
    if (!connected) {
      // Use mock projects for demo if not connected
      setProjects(mockProjects);
      if (mockProjects.length > 0) {
        setSelectedProject(mockProjects[0]);
      }
      return;
    }
    
    // If connected and we have real blockchain projects, use them instead
    if (userProjects && userProjects.length > 0) {
      console.log('🔄 Setting real blockchain projects:', userProjects);
      
      // Convert blockchain projects to EnhancedProject format
      const enhancedProjects: EnhancedProject[] = userProjects.map(project => ({
        id: project.id,
        name: project.name || `Blue Carbon Project ${project.id}`,
        owner: project.owner || 'Unknown',
        status: project.verified ? 'active' : 'pending',
        ipfsCid: project.description?.split('IPFS: ')[1] || '',
        carbonTonsEstimated: project.carbonSequestered || 0,
        creditsIssued: project.creditsIssued || 0,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 30, // Placeholder: 30 days ago
        ecosystemData: {
          ecosystemType: 'MixedBlueCarbon',
          areaHectares: project.areaSize || 0,
          location: {
            latitude: 0,
            longitude: 0,
            countryCode: 'USA',
            regionName: project.location || 'Unknown',
            polygonCoordinates: []
          },
          biodiversityIndex: 0.8,
          speciesCountBaseline: 100,
          speciesComposition: ['Mangrove', 'Seagrass'],
          aboveGroundBiomass: 100,
          belowGroundBiomass: 80,
          soilCarbon0To30cm: 200,
          soilCarbon30To100cm: 150,
          sequestrationRateAnnual: 10,
          coBenefits: ['StormProtection', 'WaterPurification'],
          vcsMethodology: project.certificationStandard || 'VM0033',
          permanenceGuaranteeYears: 30
        }
      }));
      
      setProjects(enhancedProjects);
      if (enhancedProjects.length > 0) {
        setSelectedProject(enhancedProjects[0]);
      }
    } else if (projectsLoading) {
      // Set loading state
      setLoading(true);
    } else {
      // If no blockchain projects, fall back to mock projects
      setProjects(mockProjects);
      if (mockProjects.length > 0) {
        setSelectedProject(mockProjects[0]);
      }
    }
  }, [connected, userProjects, projectsLoading, mockProjects, refreshTrigger]);

  const handleProjectRegistration = async (projectData: BlueProjectData) => {
    setLoading(true);
    try {
      const txHash = await blueCarbon.registerBlueCarbon(projectData);
      addNotification('success', `Project registered successfully! Transaction: ${txHash.substring(0, 8)}...`);
      
      // Create new project in local state
      const newProject: EnhancedProject = {
        id: projectData.projectId,
        name: `Blue Carbon Project ${projectData.projectId}`,
        owner: 'Current User',
        status: 'pending',
        ipfsCid: projectData.ipfsCid,
        carbonTonsEstimated: projectData.carbonTonsEstimated,
        creditsIssued: 0,
        createdAt: Math.floor(Date.now() / 1000),
        ecosystemData: projectData
      };
      
      setProjects(prev => [...prev, newProject]);
      setCurrentView('overview');
    } catch (error: any) {
      addNotification('error', `Failed to register project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringSubmission = async (monitoringData: MonitoringDataInput) => {
    setLoading(true);
    try {
      const txHash = await blueCarbon.submitMonitoringData(monitoringData);
      addNotification('success', `Monitoring data submitted! Transaction: ${txHash.substring(0, 8)}...`);
      setCurrentView('overview');
    } catch (error: any) {
      addNotification('error', `Failed to submit monitoring data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-4">🌊 Blue Carbon Registry</h1>
            <p className="text-xl text-gray-600 mb-8">
              Blockchain-powered platform for blue carbon ecosystem management
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-2">🏞️</div>
                <h3 className="font-semibold text-blue-800">Ecosystem Tracking</h3>
                <p className="text-sm text-gray-600">Monitor mangroves, seagrass, and salt marshes</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-2">🔬</div>
                <h3 className="font-semibold text-green-800">Scientific Validation</h3>
                <p className="text-sm text-gray-600">IPCC-compliant carbon measurement protocols</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-purple-800">Carbon Credits</h3>
                <p className="text-sm text-gray-600">Trade verified blue carbon credits</p>
              </div>
            </div>
          </div>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Project Overview', icon: '📊' },
    { id: 'register', label: 'Register Project', icon: '➕' },
    { id: 'monitoring', label: 'Submit Monitoring', icon: '📈' },
    { id: 'marketplace', label: 'Marketplace', icon: '💰' },
    { id: 'verification', label: 'Verification', icon: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-800">🌊 Blue Carbon Registry</h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-md shadow-md max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewMode)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Project Selection */}
              {projects.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Project</h3>
                  <select
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p.id === e.target.value);
                      setSelectedProject(project || null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentView === 'overview' && selectedProject && (
              <ProjectDashboard
                project={selectedProject}
                monitoringData={mockMonitoringData.filter(m => m.projectId === selectedProject.id)}
                verifications={[]}
                marketplaceListings={[]}
              />
            )}

            {currentView === 'register' && (
              <BlueProjectRegistrationForm
                onSubmit={handleProjectRegistration}
                loading={loading}
              />
            )}

            {currentView === 'monitoring' && selectedProject && (
              <MonitoringDataForm
                projectId={selectedProject.id || selectedProject.projectId || 'unknown-project'}
                onSubmit={handleMonitoringSubmission}
                loading={loading}
              />
            )}

            {currentView === 'marketplace' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Carbon Credit Marketplace</h2>
                <div className="text-center text-gray-500">
                  <p className="mb-4">🏗️ Marketplace functionality coming soon!</p>
                  <p className="text-sm">
                    This will include carbon credit listings, trading functionality, and market analytics.
                  </p>
                </div>
              </div>
            )}

            {currentView === 'verification' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Verification System</h2>
                <div className="text-center text-gray-500">
                  <p className="mb-4">🔍 Verification system coming soon!</p>
                  <p className="text-sm">
                    This will include verifier registration, multi-party verification workflows, and compliance tracking.
                  </p>
                </div>
              </div>
            )}

            {!selectedProject && currentView === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center text-gray-500">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Blue Carbon Registry</h2>
                  <p className="mb-6">Get started by registering your first blue carbon project or selecting an existing project.</p>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Register New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Panel (only in development) */}
      <DebugPanel enabled={showDebugPanel} />
    </div>
  );
}