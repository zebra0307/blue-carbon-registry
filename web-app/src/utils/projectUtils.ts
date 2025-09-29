// Define required enums locally to avoid import issues
export enum ProjectCategory {
  MANGROVE = 'MANGROVE',
  SEAGRASS = 'SEAGRASS',
  SALTMARSH = 'SALTMARSH',
  MIXED = 'MIXED',
  AFFORESTATION = 'AFFORESTATION',
  REFORESTATION = 'REFORESTATION',
  FOREST_CONSERVATION = 'FOREST_CONSERVATION',
  WETLAND_RESTORATION = 'WETLAND_RESTORATION',
  MANGROVE_RESTORATION = 'MANGROVE_RESTORATION',
  SOIL_CARBON = 'SOIL_CARBON',
  BLUE_CARBON = 'BLUE_CARBON',
  RENEWABLE_ENERGY = 'RENEWABLE_ENERGY'
}

export enum CertificationStandard {
  VCS = 'VCS',
  GOLDSTANDARD = 'GOLDSTANDARD',
  GOLD_STANDARD = 'GOLD_STANDARD',
  CARBONPLUS = 'CARBONPLUS',
  BLUECARBON = 'BLUECARBON',
  CDM = 'CDM',
  CLIMATE_ACTION_RESERVE = 'CLIMATE_ACTION_RESERVE',
  AMERICAN_CARBON_REGISTRY = 'AMERICAN_CARBON_REGISTRY',
  PLAN_VIVO = 'PLAN_VIVO',
  OCEANA_VERSE_STANDARD = 'OCEANA_VERSE_STANDARD'
}

/**
 * Generate a unique project ID using timestamp and cryptographic randomness
 */
export function generateProjectId(): string {
  try {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const uuid = crypto.randomUUID().split('-')[0]; // First 8 chars
      const timestamp = Date.now().toString(36);
      return `BCR-${timestamp}-${uuid}`.toUpperCase();
    }
    
    // Fallback for older browsers
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 8);
    const random2 = Math.random().toString(36).substring(2, 8);
    return `BCR-${timestamp}-${random1}${random2}`.toUpperCase();
  } catch (error) {
    console.error('Error generating project ID:', error);
    // Ultimate fallback
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `BCR-${timestamp}-${random}`.toUpperCase();
  }
}

/**
 * Validate project ID format
 */
export function validateProjectId(projectId: string): boolean {
  const pattern = /^BCR-[A-Z0-9]+-[A-Z0-9]+$/;
  return pattern.test(projectId);
}

/**
 * Generate validator ID
 */
export function generateValidatorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `VAL-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate evaluation ID
 */
export function generateEvaluationId(projectId: string, validatorId: string): string {
  const timestamp = Date.now().toString(36);
  return `EVAL-${projectId}-${validatorId}-${timestamp}`.toUpperCase();
}

/**
 * Calculate project risk score based on various factors
 */
export function calculateProjectRiskScore(project: {
  category: ProjectCategory;
  areaHectares: number;
  estimatedCarbonSequestration: number;
  creditorPeriodYears: number;
  certificationStandard: CertificationStandard;
}): { score: number; level: 'low' | 'medium' | 'high'; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  
  // Category risk assessment
  const categoryRisk = {
    [ProjectCategory.AFFORESTATION]: 15,
    [ProjectCategory.REFORESTATION]: 10,
    [ProjectCategory.FOREST_CONSERVATION]: 5,
    [ProjectCategory.WETLAND_RESTORATION]: 20,
    [ProjectCategory.MANGROVE_RESTORATION]: 25,
    [ProjectCategory.SOIL_CARBON]: 30,
    [ProjectCategory.BLUE_CARBON]: 35,
    [ProjectCategory.RENEWABLE_ENERGY]: 10
  };
  
  score += categoryRisk[project.category as keyof typeof categoryRisk] || 20;
  factors.push(`Project category: ${project.category}`);
  
  // Scale risk
  if (project.areaHectares > 10000) {
    score += 15;
    factors.push('Large scale project (>10,000 ha)');
  } else if (project.areaHectares > 1000) {
    score += 10;
    factors.push('Medium scale project (1,000-10,000 ha)');
  }
  
  // Carbon sequestration ambition
  const carbonPerHectare = project.estimatedCarbonSequestration / project.areaHectares;
  if (carbonPerHectare > 100) {
    score += 20;
    factors.push('High carbon sequestration rate (>100 tCO2/ha)');
  } else if (carbonPerHectare > 50) {
    score += 10;
    factors.push('Moderate carbon sequestration rate (50-100 tCO2/ha)');
  }
  
  // Crediting period
  if (project.creditorPeriodYears > 30) {
    score += 15;
    factors.push('Long crediting period (>30 years)');
  } else if (project.creditorPeriodYears > 20) {
    score += 10;
    factors.push('Extended crediting period (20-30 years)');
  }
  
  // Certification standard reliability
  const standardReliability = {
    [CertificationStandard.VCS]: -5,
    [CertificationStandard.GOLD_STANDARD]: -10,
    [CertificationStandard.CDM]: 0,
    [CertificationStandard.CLIMATE_ACTION_RESERVE]: -5,
    [CertificationStandard.AMERICAN_CARBON_REGISTRY]: 0,
    [CertificationStandard.PLAN_VIVO]: 5,
    [CertificationStandard.OCEANA_VERSE_STANDARD]: 10
  };
  
  score += standardReliability[project.certificationStandard as keyof typeof standardReliability] || 5;
  
  // Determine risk level
  let level: 'low' | 'medium' | 'high';
  if (score < 30) {
    level = 'low';
  } else if (score < 60) {
    level = 'medium';
  } else {
    level = 'high';
  }
  
  return { score, level, factors };
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Calculate estimated project timeline
 */
export function calculateProjectTimeline(
  startDate: string,
  endDate: string,
  monitoringFrequency: number
): {
  durationMonths: number;
  monitoringEvents: number;
  nextMonitoring?: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  const durationMonths = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const monitoringEvents = Math.floor(durationMonths / monitoringFrequency);
  
  let nextMonitoring: string | undefined;
  if (start <= now && now <= end) {
    const monthsSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const nextMonitoringMonth = Math.ceil(monthsSinceStart / monitoringFrequency) * monitoringFrequency;
    const nextDate = new Date(start);
    nextDate.setMonth(start.getMonth() + nextMonitoringMonth);
    nextMonitoring = nextDate.toISOString().split('T')[0];
  }
  
  return {
    durationMonths,
    monitoringEvents,
    nextMonitoring
  };
}

/**
 * Generate project summary statistics
 */
export function generateProjectSummary(projects: any[]): {
  totalProjects: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  totalCarbonSequestration: number;
  averageAreaSize: number;
} {
  const summary = {
    totalProjects: projects.length,
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    totalCarbonSequestration: 0,
    averageAreaSize: 0
  };
  
  let totalArea = 0;
  
  projects.forEach(project => {
    // Count by category
    const category = project.category || 'unknown';
    summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    
    // Count by status
    const status = project.status || 'unknown';
    summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    
    // Sum carbon sequestration
    summary.totalCarbonSequestration += project.estimatedCarbonSequestration || 0;
    
    // Sum area
    totalArea += project.areaHectares || 0;
  });
  
  summary.averageAreaSize = projects.length > 0 ? totalArea / projects.length : 0;
  
  return summary;
}

/**
 * Sanitize project data for blockchain storage
 */
export function sanitizeProjectData(data: any): any {
  const sanitized = { ...data };
  
  // Remove undefined values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  
  // Ensure required fields have defaults
  sanitized.createdAt = sanitized.createdAt || new Date().toISOString();
  sanitized.updatedAt = new Date().toISOString();
  sanitized.status = sanitized.status || 'draft';
  
  return sanitized;
}