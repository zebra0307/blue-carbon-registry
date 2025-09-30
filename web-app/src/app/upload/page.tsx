'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to project registration...</p>
    </div>
  );
}