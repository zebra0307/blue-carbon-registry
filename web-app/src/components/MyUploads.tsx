'use client';

import React, { useState, useEffect } from 'react';
import { UploadHistoryManager, UploadProject, UploadedFile } from '../utils/uploadHistory';

const MyUploads: React.FC = () => {
  const [uploadHistory, setUploadHistory] = useState<UploadProject[]>([]);
  const [selectedView, setSelectedView] = useState<'projects' | 'files'>('projects');
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalFiles: 0, totalSize: 0 });

  useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = () => {
    const history = UploadHistoryManager.getUploadHistory();
    const files = UploadHistoryManager.getAllFiles();
    const statistics = UploadHistoryManager.getTotalStats();
    
    setUploadHistory(history);
    setAllFiles(files);
    setStats(statistics);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to remove this project from your history?')) {
      UploadHistoryManager.removeUploadProject(projectId);
      loadUploadHistory();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    return '📎';
  };

  if (uploadHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Uploads</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No uploads yet</h3>
          <p className="text-gray-500">Start uploading documents to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Uploads</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('projects')}
            className={`px-4 py-2 rounded-md ${
              selectedView === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Projects ({stats.totalProjects})
          </button>
          <button
            onClick={() => setSelectedView('files')}
            className={`px-4 py-2 rounded-md ${
              selectedView === 'files'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Files ({stats.totalFiles})
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Files</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalFiles}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Size</h3>
          <p className="text-2xl font-bold text-purple-600">
            {UploadHistoryManager.formatFileSize(stats.totalSize)}
          </p>
        </div>
      </div>

      {selectedView === 'projects' ? (
        <div className="space-y-4">
          {uploadHistory.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Upload - {formatDate(project.uploadDate)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {project.totalFiles} files • {UploadHistoryManager.formatFileSize(project.totalSize)}
                  </p>
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Project CID:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                    {project.projectCID}
                  </code>
                  <button
                    onClick={() => copyToClipboard(project.projectCID)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${project.projectCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View on IPFS
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Files:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.files.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                      <span className="text-lg">{getFileIcon(file.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {UploadHistoryManager.formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => copyToClipboard(file.ipfsHash)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Copy Hash
                        </button>
                        <a
                          href={file.ipfsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPFS Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{getFileIcon(file.fileType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                          <div className="text-sm text-gray-500">{file.fileType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {UploadHistoryManager.formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.ipfsHash.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.ipfsHash)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                        <a
                          href={file.ipfsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUploads;