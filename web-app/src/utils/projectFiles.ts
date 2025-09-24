// Utility for managing project files across the application
// This provides persistent storage of uploaded files using localStorage

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  ipfsHash: string;
  ipfsUrl: string;
  uploadedAt: string;
  uploadedBy?: string;
  projectId: string;
}

const STORAGE_KEY = 'blue-carbon-project-files';

/**
 * Get all files for a specific project
 */
export function getProjectFiles(projectId: string): ProjectFile[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedFiles = localStorage.getItem(STORAGE_KEY);
    if (!storedFiles) return [];
    
    const allFiles: ProjectFile[] = JSON.parse(storedFiles);
    return allFiles.filter(file => file.projectId === projectId);
  } catch (error) {
    console.error('Error reading project files:', error);
    return [];
  }
}

/**
 * Get all files across all projects
 */
export function getAllProjectFiles(): ProjectFile[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedFiles = localStorage.getItem(STORAGE_KEY);
    if (!storedFiles) return [];
    
    return JSON.parse(storedFiles);
  } catch (error) {
    console.error('Error reading all project files:', error);
    return [];
  }
}

/**
 * Add a new file to a project
 */
export function addProjectFile(projectFile: Omit<ProjectFile, 'id'>): ProjectFile {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  try {
    const newFile: ProjectFile = {
      ...projectFile,
      id: `${projectFile.projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const allFiles = getAllProjectFiles();
    const updatedFiles = [...allFiles, newFile];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
      detail: { projectId: projectFile.projectId }
    }));
    
    return newFile;
  } catch (error) {
    console.error('Error adding project file:', error);
    throw error;
  }
}

/**
 * Add multiple files to a project
 */
export function addMultipleProjectFiles(projectFiles: Omit<ProjectFile, 'id'>[]): ProjectFile[] {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  try {
    const newFiles: ProjectFile[] = projectFiles.map(file => ({
      ...file,
      id: `${file.projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    const allFiles = getAllProjectFiles();
    const updatedFiles = [...allFiles, ...newFiles];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    
    // Dispatch custom event to notify other components
    if (projectFiles.length > 0) {
      window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
        detail: { projectId: projectFiles[0].projectId }
      }));
    }
    
    return newFiles;
  } catch (error) {
    console.error('Error adding multiple project files:', error);
    throw error;
  }
}

/**
 * Remove a file from a project
 */
export function removeProjectFile(fileId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const allFiles = getAllProjectFiles();
    const fileToRemove = allFiles.find(file => file.id === fileId);
    const updatedFiles = allFiles.filter(file => file.id !== fileId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    
    // Dispatch custom event to notify other components
    if (fileToRemove) {
      window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
        detail: { projectId: fileToRemove.projectId }
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Error removing project file:', error);
    return false;
  }
}

/**
 * Clear all files for a project
 */
export function clearProjectFiles(projectId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const allFiles = getAllProjectFiles();
    const updatedFiles = allFiles.filter(file => file.projectId !== projectId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
      detail: { projectId }
    }));
    
    return true;
  } catch (error) {
    console.error('Error clearing project files:', error);
    return false;
  }
}

/**
 * Initialize with sample data if no files exist
 */
export function initializeSampleFiles(): void {
  if (typeof window === 'undefined') return;
  
  const existingFiles = getAllProjectFiles();
  if (existingFiles.length > 0) return; // Don't overwrite existing data
  
  // Initialize with the sample files we created earlier
  const sampleFiles: ProjectFile[] = [
    {
      id: 'sample-1',
      name: 'project-verification.pdf',
      type: 'application/pdf',
      size: 478,
      ipfsHash: 'bafkreicxdfcyhnzhet6cm4rmfa7vywfn76bjnl56gigcvfqr74cp3z6vom',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafkreicxdfcyhnzhet6cm4rmfa7vywfn76bjnl56gigcvfqr74cp3z6vom',
      uploadedAt: '2024-09-24T10:35:00Z',
      uploadedBy: 'Project Developer',
      projectId: 'subbu0111'
    },
    {
      id: 'sample-2',
      name: 'environmental-impact-assessment.txt',
      type: 'text/plain',
      size: 597,
      ipfsHash: 'bafkreie5xv4ii5q2ky4iwqkogwzi7je4ncaxjmpac43bqrtzawjfmlmlbq',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafkreie5xv4ii5q2ky4iwqkogwzi7je4ncaxjmpac43bqrtzawjfmlmlbq',
      uploadedAt: '2024-09-24T11:20:00Z',
      uploadedBy: 'Environmental Consultant',
      projectId: 'subbu0111'
    },
    {
      id: 'sample-3',
      name: 'site-photos-metadata.json',
      type: 'application/json',
      size: 343,
      ipfsHash: 'bafkreihdkff6x44qth6wj4cc2gft6nte7fbm7zp2dfjlpk7ll6nea5gxtm',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafkreihdkff6x44qth6wj4cc2gft6nte7fbm7zp2dfjlpk7ll6nea5gxtm',
      uploadedAt: '2024-09-24T09:45:00Z',
      uploadedBy: 'Field Team',
      projectId: 'BCP-0307'
    },
    {
      id: 'sample-4',
      name: 'project-monitoring-report.txt',
      type: 'text/plain',
      size: 551,
      ipfsHash: 'bafkreidsrfcv6ram44mz7bcnmydjjzefbbkpg4loffaagg2atelom2d22a',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafkreidsrfcv6ram44mz7bcnmydjjzefbbkpg4loffaagg2atelom2d22a',
      uploadedAt: '2024-09-24T12:15:00Z',
      uploadedBy: 'Monitoring Team',
      projectId: 'akshat_hr'
    }
  ];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleFiles));
}

/**
 * React hook to listen for file updates
 */
export function useProjectFiles(projectId: string) {
  const [files, setFiles] = React.useState<ProjectFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Initialize sample data on first load
    initializeSampleFiles();
    
    // Load initial files
    const loadFiles = () => {
      const projectFiles = getProjectFiles(projectId);
      setFiles(projectFiles);
      setLoading(false);
    };
    
    loadFiles();
    
    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        loadFiles();
      }
    };
    
    window.addEventListener('projectFilesUpdated', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('projectFilesUpdated', handleUpdate as EventListener);
    };
  }, [projectId]);
  
  return { files, loading };
}

// Import React for the hook
import React from 'react';