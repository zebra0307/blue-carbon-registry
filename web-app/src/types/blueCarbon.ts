// Enhanced TypeScript types for Blue Carbon Registry
export interface BlueProjectData {
  projectId: string;
  ipfsCid: string;
  carbonTonsEstimated: number;
  ecosystemType: EcosystemType;
  location: GeoLocation;
  areaHectares: number;
  speciesComposition: string[];
  biodiversityIndex: number;
  aboveGroundBiomass: number;
  belowGroundBiomass: number;
  soilCarbon0To30cm: number;
  soilCarbon30To100cm: number;
  sequestrationRateAnnual: number;
  measurementMethodology: string;
  uncertaintyPercentage: number;
  vcsMethodology: string;
  additionalityProofCid: string;
  permanenceGuaranteeYears: number;
  leakageAssessment: number;
  monitoringPlanCid: string;
  baselineEcosystemHealth: number;
  speciesCountBaseline: number;
  coBenefits: CoBenefit[];
  vintageYear: number;
  pricePerTon: number;
  // Photo/Media additions
  photos: ProjectPhoto[];
  mediaIpfsCids: string[];
}

export enum EcosystemType {
  Mangrove = "Mangrove",
  Seagrass = "Seagrass",
  SaltMarsh = "SaltMarsh",
  MixedBlueCarbon = "MixedBlueCarbon"
}

export enum VerificationStatus {
  Pending = "Pending",
  UnderReview = "UnderReview",
  Verified = "Verified",
  Rejected = "Rejected",
  Monitoring = "Monitoring",
  Expired = "Expired"
}

export enum VerifierType {
  ScientificInstitution = "ScientificInstitution",
  GovernmentAgency = "GovernmentAgency",
  CertificationBody = "CertificationBody",
  LocalCommunity = "LocalCommunity",
  TechnicalAuditor = "TechnicalAuditor",
  ThirdPartyValidator = "ThirdPartyValidator"
}

export enum CoBenefit {
  BiodiversityConservation = "BiodiversityConservation",
  CommunityLivelihoods = "CommunityLivelihoods",
  CoastalProtection = "CoastalProtection",
  WaterQuality = "WaterQuality",
  FisheryEnhancement = "FisheryEnhancement",
  TourismDevelopment = "TourismDevelopment",
  EducationOutreach = "EducationOutreach"
}

export interface ProjectPhoto {
  ipfsCid: string;
  caption: string;
  takenAt: string; // ISO date string
  location?: {
    latitude: number;
    longitude: number;
  };
  type: 'site' | 'species' | 'equipment' | 'monitoring' | 'other';
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  polygonCoordinates: [number, number][];
  countryCode: string;
  regionName: string;
}

export interface WaterQuality {
  phLevel: number;
  salinity: number;
  dissolvedOxygen: number;
  turbidity: number;
  nutrients: NutrientLevels;
}

export interface NutrientLevels {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface TideReading {
  timestamp: number;
  tideHeight: number;
  tideType: string;
}

export interface SensorReading {
  sensorId: string;
  timestamp: number;
  co2Flux: number;
  soilMoisture: number;
  phLevel: number;
  temperature: number;
  humidity: number;
}

export interface MonitoringDataInput {
  projectId: string;
  timestamp?: number;
  carbonStock?: number;
  biodiversityMeasurements?: string[];
  waterQualityIndices?: any[];
  satelliteImageCid?: string;
  fieldObservationsCid?: string;
  satelliteImageryCid?: string;
  ndviIndex?: number;
  waterQuality?: WaterQuality;
  temperatureData?: number[];
  tideData?: TideReading[];
  iotSensorData?: SensorReading[];
  ecosystemHealthScore?: number;
  temperature?: number;
  salinity?: number;
  tidalHeight?: number;
  sedimentationRate?: number;
  qaProtocol?: string;
  dataValidated?: boolean;
  measurementConfidence?: number;
  [key: string]: any;
}

export interface MonitoringData {
  projectId: string;
  timestamp: number;
  carbonStock: number;
  biodiversityMeasurements?: string[];
  waterQualityIndices?: any[];
  satelliteImageCid?: string;
  fieldObservationsCid?: string;
  temperature?: number;
  salinity?: number;
  tidalHeight?: number;
  sedimentationRate?: number;
  qaProtocol?: string;
  dataValidated?: boolean;
  measurementConfidence?: number;
  [key: string]: any;
}

export interface VerificationNode {
  verifierPubkey: string;
  verifierType: VerifierType;
  credentials: string[];
  reputationScore: number;
  verificationCount: number;
  isActive: boolean;
  approved?: boolean;
  registrationDate: number;
  specializations: EcosystemType[];
  [key: string]: any;
}

export interface CarbonCreditListing {
  projectId: string;
  seller: string;
  vintageYear: number;
  quantityAvailable: number;
  creditsAvailable: number; // Added for compatibility
  pricePerTon: number;
  qualityRating: number;
  coBenefits: CoBenefit[];
  certificationStandards: string[];
  listingDate: number;
  expiryDate: number;
  isActive: boolean;
  status?: string; // Added for compatibility
  [key: string]: any;
}

export interface ImpactReport {
  projectId: string;
  reportingPeriodStart: number;
  reportingPeriodEnd: number;
  carbonSequestered: number;
  ecosystemHealthImprovement: number;
  biodiversityIncrease: number;
  communityBenefits: CommunityBenefit[];
  economicImpact: EconomicImpact;
  sdgContributions: number[];
  verificationReportCid: string;
}

export interface CommunityBenefit {
  benefitType: string;
  householdsAffected: number;
  jobsCreated: number;
  incomeIncreasePercentage: number;
  capacityBuildingPrograms: number;
}

export interface EconomicImpact {
  directRevenue: number;
  indirectBenefits: number;
  costSavings: number;
  roiPercentage: number;
  paybackPeriodYears: number;
}

export interface EnhancedProject {
  id?: string;
  projectId?: string; 
  name?: string;
  owner?: string;
  ipfsCid?: string;
  carbonTonsEstimated?: number;
  verificationStatus?: VerificationStatus | string;
  creditsIssued?: number;
  tokensMinted?: number;
  status?: 'active' | 'pending' | 'verified' | 'rejected' | string;
  createdAt?: number;
  
  // This allows for flexible structure where some properties may be in ecosystemData
  ecosystemData?: any;
  
  // Make all these properties optional to handle both direct and nested structures
  ecosystemType?: EcosystemType;
  location?: GeoLocation;
  areaHectares?: number;
  speciesComposition?: string[];
  biodiversityIndex?: number;
  establishmentDate?: number;
  aboveGroundBiomass?: number;
  belowGroundBiomass?: number;
  soilCarbon0To30cm?: number;
  soilCarbon30To100cm?: number;
  sequestrationRateAnnual?: number;
  measurementMethodology?: string;
  uncertaintyPercentage?: number;
  vcsMethodology?: string;
  additionalityProofCid?: string;
  permanenceGuaranteeYears?: number;
  leakageAssessment?: number;
  monitoringPlanCid?: string;
  baselineEcosystemHealth?: number;
  currentEcosystemHealth?: number;
  speciesCountBaseline?: number;
  speciesCountCurrent?: number;
  coBenefits?: CoBenefit[];
  vintageYear?: number;
  qualityRating?: number;
  pricePerTon?: number;
  availableQuantity?: number;
  
  // Allow other properties
  [key: string]: any;
}

// API Response types
export interface ProjectResponse {
  success: boolean;
  data?: EnhancedProject;
  error?: string;
}

export interface ListingResponse {
  success: boolean;
  data?: CarbonCreditListing[];
  error?: string;
}

export interface VerifierResponse {
  success: boolean;
  data?: VerificationNode[];
  error?: string;
}

export interface MonitoringResponse {
  success: boolean;
  data?: MonitoringDataInput[];
  error?: string;
}

export interface ImpactResponse {
  success: boolean;
  data?: ImpactReport;
  error?: string;
}