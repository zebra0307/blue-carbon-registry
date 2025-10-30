'use client';

import { Layout } from '@/components/Navigation';
import MobileFieldDataCollection from '@/components/MobileFieldDataCollection';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function FieldDataPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Field Data Collection
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Collect environmental data directly from the field using your mobile device
            </p>
          </div>

          <MobileFieldDataCollection />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
