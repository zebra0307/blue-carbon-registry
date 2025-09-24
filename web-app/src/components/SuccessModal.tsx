'use client';

import { useState, useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectCid: string;
  documents: Array<{
    name: string;
    cid: string;
    category: string;
    size: number;
  }>;
}

export default function SuccessModal({ isOpen, onClose, projectCid, documents }: SuccessModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getIPFSUrl = (cid: string) => `https://ipfs.io/ipfs/${cid}`;
  const getPinataUrl = (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                🎉 Documents Successfully Submitted!
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Your documents have been permanently stored on IPFS (InterPlanetary File System) and are now immutable and globally accessible.
                </p>

                {/* Project Bundle CID */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">📦 Project Bundle Hash (CID)</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="flex-1 text-xs bg-white px-3 py-2 rounded border font-mono break-all">
                      {projectCid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(projectCid, 'project')}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      {copied === 'project' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex space-x-2 text-xs">
                    <a
                      href={getIPFSUrl(projectCid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View on IPFS.io →
                    </a>
                    <a
                      href={getPinataUrl(projectCid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      View on Pinata →
                    </a>
                  </div>
                </div>

                {/* Individual Document CIDs */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📄 Individual Document Hashes</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {documents.map((doc, index) => (
                      <div key={index} className="bg-white rounded border p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.category} • {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                            {doc.cid}
                          </code>
                          <button
                            onClick={() => copyToClipboard(doc.cid, `doc-${index}`)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            {copied === `doc-${index}` ? '✓' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex space-x-2 mt-1 text-xs">
                          <a
                            href={getIPFSUrl(doc.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            IPFS.io →
                          </a>
                          <a
                            href={getPinataUrl(doc.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 underline"
                          >
                            Pinata →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Note */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>🔒 Important:</strong> These documents are now permanently stored on a decentralized network. 
                    Save these CID hashes as they are the permanent addresses to access your documents from anywhere in the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}