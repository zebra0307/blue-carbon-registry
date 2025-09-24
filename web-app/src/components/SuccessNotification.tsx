'use client';

import { useState, useEffect } from 'react';

interface SuccessNotificationProps {
  message: string;
  cid?: string;
  onClose: () => void;
}

export default function SuccessNotification({ message, cid, onClose }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Upload Successful!
            </h3>
            <div className="mt-1 text-sm text-green-700">
              <p>{message}</p>
              {cid && (
                <div className="mt-2">
                  <p className="text-xs text-green-600">IPFS CID:</p>
                  <code className="text-xs bg-green-100 px-2 py-1 rounded font-mono break-all">
                    {cid}
                  </code>
                  <div className="mt-1">
                    <a 
                      href={`https://ipfs.io/ipfs/${cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      View on IPFS →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}