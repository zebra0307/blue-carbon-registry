'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Navigation';
import VerificationSystem from '@/components/VerificationSystem';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { VerificationStatus, VerificationData } from '@/types';

export default function VerificationPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [mockProjects] = useState([
    { id: 'project-1', name: 'Mangrove Restoration - Indonesia' },
    { id: 'project-2', name: 'Seagrass Protection - Caribbean' },
    { id: 'project-3', name: 'Salt Marsh Conservation - USA' },
  ]);

  const [mockVerification, setMockVerification] = useState<VerificationData>({
    status: 'pending' as VerificationStatus,
    submittedAt: new Date(),
    requiredDocuments: ['Project Plan', 'Land Rights', 'Carbon Measurements'],
    submittedDocuments: ['Project Plan', 'Land Rights'],
  });

  const handleStatusUpdate = (status: VerificationStatus, notes: string) => {
    setMockVerification(prev => ({
      ...prev,
      status,
      verificationNotes: notes,
      verifiedBy: user?.walletAddress,
      reviewedAt: new Date(),
    }));
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.VALIDATOR, UserRole.ADMIN]}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Project Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and verify blue carbon projects using multi-party verification
            </p>
          </div>

          {!selectedProject ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Select a Project to Verify
              </h2>
              <div className="space-y-3">
                {mockProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 
                             rounded-lg hover:border-blue-500 dark:hover:border-blue-400 
                             transition-colors duration-200"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ID: {project.id}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedProject(null)}
                className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to project list
              </button>
              <VerificationSystem 
                projectId={selectedProject}
                verification={mockVerification}
                isAdmin={user?.role === UserRole.ADMIN}
                onStatusUpdate={handleStatusUpdate}
                onMintingEnabled={() => console.log('Minting enabled')}
              />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

