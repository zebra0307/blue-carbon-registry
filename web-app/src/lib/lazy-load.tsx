/**
 * Dynamic imports for code splitting
 * Use these to lazy load heavy components
 */

import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load verification system
export const VerificationSystem = dynamic(
  () => import('@/components/VerificationSystem'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load monitoring components
export const MonitoringDataForm = dynamic(
  () => import('@/components/MonitoringDataForm'),
  { loading: () => <LoadingSpinner /> }
);

export const CommunityMonitoringSystem = dynamic(
  () => import('@/components/CommunityMonitoringSystem'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load field data collection
export const MobileFieldDataCollection = dynamic(
  () => import('@/components/MobileFieldDataCollection'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load project registration
export const BlueProjectRegistrationForm = dynamic(
  () => import('@/components/BlueProjectRegistrationForm'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load credit operations
export const CreditMintForm = dynamic(
  () => import('@/components/CreditMintForm'),
  { loading: () => <LoadingSpinner /> }
);

export const CreditTransferForm = dynamic(
  () => import('@/components/CreditTransferForm'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load analytics
export const AnalyticsDashboard = dynamic(
  () => import('@/components/AnalyticsDashboard'),
  { loading: () => <LoadingSpinner /> }
);

// Lazy load token economics
export const TokenEconomicsDashboard = dynamic(
  () => import('@/components/TokenEconomicsDashboard'),
  { loading: () => <LoadingSpinner /> }
);

// Generic lazy loader with custom loading component
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent?: ComponentType
) {
  return dynamic(importFunc, {
    loading: LoadingComponent ? () => <LoadingComponent /> : () => <LoadingSpinner />,
  });
}
