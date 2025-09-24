export interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  ipfsHash: string;
  uploadDate: string;
  projectCID?: string;
  fileType: string;
  ipfsUrl: string;
}

export interface UploadProject {
  id: string;
  projectCID: string;
  uploadDate: string;
  files: UploadedFile[];
  totalFiles: number;
  totalSize: number;
}

const STORAGE_KEY = 'blue_carbon_uploads';

export class UploadHistoryManager {
  static getUploadHistory(): UploadProject[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading upload history:', error);
      return [];
    }
  }

  static saveUploadProject(project: UploadProject): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getUploadHistory();
      history.unshift(project); // Add to beginning of array (most recent first)
      
      // Keep only last 50 uploads to prevent localStorage bloat
      const limitedHistory = history.slice(0, 50);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving upload history:', error);
    }
  }

  static removeUploadProject(projectId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getUploadHistory();
      const filtered = history.filter(project => project.id !== projectId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing upload project:', error);
    }
  }

  static getAllFiles(): UploadedFile[] {
    const projects = this.getUploadHistory();
    return projects.flatMap(project => project.files);
  }

  static getTotalStats() {
    const projects = this.getUploadHistory();
    const totalProjects = projects.length;
    const totalFiles = projects.reduce((sum, project) => sum + project.totalFiles, 0);
    const totalSize = projects.reduce((sum, project) => sum + project.totalSize, 0);
    
    return { totalProjects, totalFiles, totalSize };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}