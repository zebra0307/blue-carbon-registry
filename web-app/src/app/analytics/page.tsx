'use client';

import React from 'react';
import { Layout } from '@/components/Navigation';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <Layout>
      <AnalyticsDashboard />
    </Layout>
  );
}