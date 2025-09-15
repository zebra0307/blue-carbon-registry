'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Camera, 
  Shield,
  Eye,
  XCircle
} from 'lucide-react';
import { VerificationStatus, VerificationData } from '@/types';

interface VerificationSystemProps {
  projectId: string;
  verification: VerificationData;
  isAdmin?: boolean;
  onStatusUpdate?: (status: VerificationStatus, notes: string) => void;
}

export default function VerificationSystem({ 
  projectId, 
  verification, 
  isAdmin = false, 
  onStatusUpdate 
}: VerificationSystemProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'field_verification':
        return <MapPin className="h-5 w-5 text-purple-500" />;
      case 'scientific_review':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'field_verification':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scientific_review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return 'Project submitted and awaiting initial review';
      case 'under_review':
        return 'Documentation being reviewed by verification team';
      case 'field_verification':
        return 'Field verification in progress by certified assessors';
      case 'scientific_review':
        return 'Scientific validation of carbon sequestration data';
      case 'approved':
        return 'Project verified and approved for credit minting';
      case 'rejected':
        return 'Project rejected - see verification notes for details';
      default:
        return 'Unknown verification status';
    }
  };

  const verificationSteps = [
    { 
      status: 'pending', 
      title: 'Initial Submission', 
      description: 'Project details and documentation submitted' 
    },
    { 
      status: 'under_review', 
      title: 'Document Review', 
      description: 'Legal documents, permits, and baseline data reviewed' 
    },
    { 
      status: 'field_verification', 
      title: 'Field Verification', 
      description: 'On-site inspection and measurement validation' 
    },
    { 
      status: 'scientific_review', 
      title: 'Scientific Review', 
      description: 'Carbon sequestration calculations and methodology validated' 
    },
    { 
      status: 'approved', 
      title: 'Approved', 
      description: 'Project verified and ready for credit minting' 
    }
  ];

  const getCurrentStepIndex = () => {
    return verificationSteps.findIndex(step => step.status === verification.status);
  };

  const handleStatusUpdate = (newStatus: VerificationStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(newStatus, adminNotes);
      setAdminNotes('');
      setShowAdminPanel(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Admin Panel
          </button>
        )}
      </div>

      {/* Current Status */}
      <div className={`flex items-center justify-between p-4 rounded-lg border-2 mb-6 ${getStatusColor(verification.status)}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon(verification.status)}
          <div>
            <h4 className="font-medium capitalize">{verification.status.replace('_', ' ')}</h4>
            <p className="text-sm opacity-90">{getStatusDescription(verification.status)}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p>Submitted: {verification.submittedAt.toLocaleDateString()}</p>
          {verification.reviewedAt && (
            <p>Last Updated: {verification.reviewedAt.toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Verification Progress */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Verification Progress</h4>
        <div className="space-y-3">
          {verificationSteps.map((step, index) => {
            const currentStep = getCurrentStepIndex();
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h5 className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </h5>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required Documents */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Required Documentation</h4>
        <div className="grid grid-cols-2 gap-3">
          {verification.requiredDocuments.map((doc, index) => {
            const isSubmitted = verification.submittedDocuments.includes(doc);
            return (
              <div key={index} className={`flex items-center space-x-2 p-2 rounded border ${
                isSubmitted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {isSubmitted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{doc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Notes */}
      {verification.verificationNotes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Verification Notes</h4>
          <p className="text-sm text-gray-700">{verification.verificationNotes}</p>
          {verification.verifiedBy && (
            <p className="text-xs text-gray-500 mt-2">- {verification.verifiedBy}</p>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && showAdminPanel && (
        <div className="mt-6 border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Admin Controls</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Add verification notes..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusUpdate('approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate('field_verification')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Send to Field Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}