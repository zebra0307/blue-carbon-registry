'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to registration page since file upload is now integrated there
    router.replace('/register');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to project registration...</p>
        <p className="text-sm text-gray-500 mt-2">File upload is now integrated into the registration process</p>
      </div>
    </div>
  );
}