'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedProject, MonitoringData, VerificationNode, CarbonCreditListing } from '@/types/blueCarbon';

interface ProjectDashboardProps {
  project: EnhancedProject;
  monitoringData: MonitoringData[];
  verifications: VerificationNode[];
  marketplaceListings: CarbonCreditListing[];
}

export default function ProjectDashboard({ 
  project, 
  monitoringData = [], 
  verifications = [], 
  marketplaceListings = [] 
}: ProjectDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'monitoring' | 'verification' | 'marketplace'>('overview');
  
  // Calculate carbon sequestration trend
  const carbonTrend = monitoringData
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(data => ({
      date: new Date(data.timestamp * 1000).toLocaleDateString(),
      carbonStock: data.carbonStock
    }));

  // Get latest monitoring data
  const latestMonitoring = monitoringData.length > 0 
    ? monitoringData.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      )
    : null;

  // Calculate verification status
  const verificationStatus = verifications.length > 0 
    ? verifications.every(v => v.approved) ? 'Verified' : 'Pending Verification'
    : 'Not Verified';

  // Calculate total credits available for sale
  const totalCreditsForSale = marketplaceListings.reduce((total, listing) => 
    listing.status === 'active' ? total + listing.creditsAvailable : total, 0
  );

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: '🏞️' },
    { id: 'monitoring', label: 'Monitoring Data', icon: '📊' },
    { id: 'verification', label: 'Verification', icon: '✅' },
    { id: 'marketplace', label: 'Marketplace', icon: '💰' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">{project.name}</h1>
        
        {/* Status Badges */}
        <div className="flex gap-4 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'active' ? 'bg-green-100 text-green-800' : 
            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' : 
            verificationStatus === 'Pending Verification' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {verificationStatus}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {project.ecosystemData.ecosystemType}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`pb-2 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Area</h3>
              <p className="text-2xl font-bold text-blue-600">{project.ecosystemData.areaHectares}</p>
              <p className="text-sm text-gray-600">hectares</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Carbon Stock</h3>
              <p className="text-2xl font-bold text-green-600">
                {latestMonitoring ? latestMonitoring.carbonStock.toFixed(1) : project.carbonTonsEstimated}
              </p>
              <p className="text-sm text-gray-600">tons C</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Biodiversity Index</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {(project.ecosystemData.biodiversityIndex * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">species diversity</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Credits for Sale</h3>
              <p className="text-2xl font-bold text-purple-600">{totalCreditsForSale}</p>
              <p className="text-sm text-gray-600">available credits</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ecosystem Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Ecosystem Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Ecosystem Type:</span>
                  <span>{project.ecosystemData.ecosystemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Species Count:</span>
                  <span>{project.ecosystemData.speciesCountBaseline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Above Ground Biomass:</span>
                  <span>{project.ecosystemData.aboveGroundBiomass} tons C</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Below Ground Biomass:</span>
                  <span>{project.ecosystemData.belowGroundBiomass} tons C</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Annual Sequestration:</span>
                  <span>{project.ecosystemData.sequestrationRateAnnual} tons C/year</span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Location Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Country:</span>
                  <span>{project.location?.countryCode || project.ecosystemData?.location?.countryCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Region:</span>
                  <span>{project.location?.regionName || project.ecosystemData?.location?.regionName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Coordinates:</span>
                  <span>
                    {project.location?.latitude ? 
                      `${project.location.latitude.toFixed(6)}, ${project.location.longitude.toFixed(6)}` : 
                      project.ecosystemData?.location?.latitude ?
                      `${project.ecosystemData.location.latitude.toFixed(6)}, ${project.ecosystemData.location.longitude.toFixed(6)}` :
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">VCS Methodology:</span>
                  <span>{project.ecosystemData.vcsMethodology || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Permanence Guarantee:</span>
                  <span>{project.ecosystemData.permanenceGuaranteeYears || 'N/A'} years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Co-Benefits */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">Co-Benefits</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {project.ecosystemData?.coBenefits && project.ecosystemData.coBenefits.map((benefit: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                  {benefit}
                </span>
              ))}
              {!project.ecosystemData?.coBenefits && project.coBenefits && project.coBenefits.map((benefit: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                  {benefit}
                </span>
              ))}
              {!project.ecosystemData?.coBenefits && !project.coBenefits && (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">No co-benefits listed</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {selectedTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Carbon Trend Chart */}
          <div className="bg-white p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Carbon Stock Trend</h3>
            {carbonTrend.length > 0 ? (
              <div className="h-64 flex items-end space-x-2">
                {carbonTrend.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 min-h-4 rounded-t"
                      style={{ height: `${(point.carbonStock / Math.max(...carbonTrend.map(p => p.carbonStock))) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-1 transform rotate-45 origin-left">
                      {point.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No monitoring data available</p>
            )}
          </div>

          {/* Latest Monitoring Data */}
          {latestMonitoring && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Latest Monitoring Data ({new Date(latestMonitoring.timestamp * 1000).toLocaleDateString()})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded">
                  <span className="font-medium">Carbon Stock:</span>
                  <p className="text-lg font-bold text-green-600">{latestMonitoring.carbonStock} tons C</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <span className="font-medium">Temperature:</span>
                  <p className="text-lg font-bold text-blue-600">{latestMonitoring.temperature}°C</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <span className="font-medium">Salinity:</span>
                  <p className="text-lg font-bold text-cyan-600">{latestMonitoring.salinity} ppt</p>
                </div>
              </div>
            </div>
          )}

          {/* All Monitoring Records */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <h3 className="text-xl font-semibold p-6 border-b">All Monitoring Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carbon Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temperature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monitoringData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(data.timestamp * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {data.carbonStock} tons C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {data.temperature}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          data.dataValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {data.dataValidated ? 'Validated' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {selectedTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg overflow-hidden">
            <h3 className="text-xl font-semibold p-6 border-b">Verification History</h3>
            {verifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {verifications.map((verification, index) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{verification.verifierName}</h4>
                        <p className="text-sm text-gray-600">{verification.verifierCredentials}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        verification.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.approved ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Verification Date:</span>
                        <span className="ml-2">{new Date(verification.timestamp * 1000).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Confidence Score:</span>
                        <span className="ml-2">{(verification.confidenceScore * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    {verification.reportCid && (
                      <div className="mt-3">
                        <a 
                          href={`https://ipfs.io/ipfs/${verification.reportCid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Verification Report →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No verification records available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketplace Tab */}
      {selectedTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg overflow-hidden">
            <h3 className="text-xl font-semibold p-6 border-b">Carbon Credit Listings</h3>
            {marketplaceListings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {marketplaceListings.map((listing, index) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {listing.creditsAvailable} Carbon Credits
                        </h4>
                        <p className="text-sm text-gray-600">Vintage: {listing.vintage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${listing.pricePerCredit}</p>
                        <p className="text-sm text-gray-600">per credit</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                          listing.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Listed:</span>
                        <span className="ml-2">{new Date(listing.listedAt * 1000).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Value:</span>
                        <span className="ml-2 font-bold">${(listing.creditsAvailable * listing.pricePerCredit).toLocaleString()}</span>
                      </div>
                    </div>

                    {listing.certificationStandard && (
                      <div className="text-sm">
                        <span className="font-medium">Certification:</span>
                        <span className="ml-2">{listing.certificationStandard}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No marketplace listings available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}