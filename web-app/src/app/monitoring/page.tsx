'use client';

import { Layout } from '@/components/Navigation';
import MonitoringDataForm from '@/components/MonitoringDataForm';
import CommunityMonitoringSystem from '@/components/CommunityMonitoringSystem';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole } from '@/types/auth';
import { useState } from 'react';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'community'>('form');

  return (
    <ProtectedRoute requireAuth={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Environmental Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Submit monitoring data and track environmental metrics
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('form')}
              className={`pb-4 px-4 font-medium transition-colors duration-200 ${
                activeTab === 'form'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Submit Data
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`pb-4 px-4 font-medium transition-colors duration-200 ${
                activeTab === 'community'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Community Monitoring
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'form' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Environmental Data Submission
                </h2>
                <MonitoringDataForm 
                  projectId="project-001"
                  onSubmit={async (data) => {
                    console.log('Monitoring data:', data);
                    // Handle submission
                  }}
                />
              </div>
            )}

            {activeTab === 'community' && (
              <CommunityMonitoringSystem />
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
