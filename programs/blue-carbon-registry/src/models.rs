use anchor_lang::prelude::*;

// Blue Carbon Ecosystem Types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum EcosystemType {
    Mangrove,
    Seagrass,
    SaltMarsh,
    MixedBlueCarbon,
}

// Verification Status with enhanced options
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum VerificationStatus {
    Pending,
    UnderReview,
    Verified,
    Rejected,
    Monitoring,
    Expired,
}

// Verifier types for multi-party verification
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum VerifierType {
    ScientificInstitution,
    GovernmentAgency,
    CertificationBody,
    LocalCommunity,
    TechnicalAuditor,
    ThirdPartyValidator,
}

// Co-benefits tracking
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum CoBenefit {
    BiodiversityConservation,
    CommunityLivelihoods,
    CoastalProtection,
    WaterQuality,
    FisheryEnhancement,
    TourismDevelopment,
    EducationOutreach,
}

// Geographic location data
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct GeoLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub polygon_coordinates: Vec<[f64; 2]>,
    pub country_code: String,
    pub region_name: String,
}

// Water quality measurements
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct WaterQuality {
    pub ph_level: f64,
    pub salinity: f64,
    pub dissolved_oxygen: f64,
    pub turbidity: f64,
    pub nutrients: NutrientLevels,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct NutrientLevels {
    pub nitrogen: f64,
    pub phosphorus: f64,
    pub potassium: f64,
}

// Tide reading data
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TideReading {
    pub timestamp: i64,
    pub tide_height: f64,
    pub tide_type: String,
}

// IoT sensor reading
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SensorReading {
    pub sensor_id: String,
    pub timestamp: i64,
    pub co2_flux: f64,
    pub soil_moisture: f64,
    pub ph_level: f64,
    pub temperature: f64,
    pub humidity: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CommunityBenefit {
    pub benefit_type: String,
    pub households_affected: u32,
    pub jobs_created: u32,
    pub income_increase_percentage: f64,
    pub capacity_building_programs: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EconomicImpact {
    pub direct_revenue: u64,
    pub indirect_benefits: u64,
    pub cost_savings: u64,
    pub roi_percentage: f64,
    pub payback_period_years: f64,
}

// Global registry account for tracking overall system state
#[account]
#[derive(Debug, Default)]
pub struct GlobalRegistry {
    pub total_credits_issued: u64,
    pub total_projects: u64,
    pub admin: Pubkey,
    pub mint_authority: Pubkey,
    pub carbon_token_mint: Pubkey,
    pub bump: u8,
    pub mint_authority_bump: u8,
}

impl GlobalRegistry {
    pub const LEN: usize = 
        8 + // total_credits_issued
        8 + // total_projects  
        32 + // admin
        32 + // mint_authority
        32 + // carbon_token_mint
        1 + // bump
        1; // mint_authority_bump
}

// Enhanced Blue Carbon Project with comprehensive ecosystem data
#[account]
#[derive(Debug, Default)]
pub struct Project {
    pub project_id: String,
    pub owner: Pubkey,
    pub ipfs_cid: String,
    pub carbon_tons_estimated: u64,
    pub verification_status: VerificationStatus,
    pub credits_issued: u64,
    pub tokens_minted: u64,
    pub bump: u8,
    
    // Blue Carbon Ecosystem Data
    pub ecosystem_type: EcosystemType,
    pub location: GeoLocation,
    pub area_hectares: f64,
    pub species_composition: Vec<String>,
    pub biodiversity_index: f64,
    pub establishment_date: i64,
    
    // Carbon Science Data
    pub above_ground_biomass: f64,
    pub below_ground_biomass: f64,
    pub soil_carbon_0_30cm: f64,
    pub soil_carbon_30_100cm: f64,
    pub sequestration_rate_annual: f64,
    pub measurement_methodology: String,
    pub uncertainty_percentage: f64,
    
    // Verification & Compliance
    pub vcs_methodology: String,
    pub additionality_proof_cid: String,
    pub permanence_guarantee_years: u16,
    pub leakage_assessment: f64,
    pub monitoring_plan_cid: String,
    
    // Impact Metrics
    pub baseline_ecosystem_health: f64,
    pub current_ecosystem_health: f64,
    pub species_count_baseline: u32,
    pub species_count_current: u32,
    pub co_benefits: Vec<CoBenefit>,
    
    // Quality & Trading Data
    pub vintage_year: u16,
    pub quality_rating: u8,
    pub price_per_ton: u64,
    pub available_quantity: u64,
}

impl Project {
    const ID_LEN: usize = 32;
    const CID_LEN: usize = 46;
    const METHODOLOGY_LEN: usize = 100;
    const COUNTRY_CODE_LEN: usize = 4;
    const REGION_NAME_LEN: usize = 50;
    
    pub const LEN: usize =
        4 + Self::ID_LEN + // project_id
        32 + // owner
        4 + Self::CID_LEN + // ipfs_cid
        8 + // carbon_tons_estimated
        1 + // verification_status
        8 + // credits_issued
        8 + // tokens_minted
        1 + // bump
        1 + // ecosystem_type
        8 + 8 + 4 + 100 + 4 + Self::COUNTRY_CODE_LEN + 4 + Self::REGION_NAME_LEN + // location
        8 + // area_hectares
        4 + 320 + // species_composition (up to 10 species, 32 chars each)
        8 + // biodiversity_index
        8 + // establishment_date
        8 + 8 + 8 + 8 + 8 + // carbon measurements
        4 + Self::METHODOLOGY_LEN + // methodology
        8 + // uncertainty
        4 + Self::METHODOLOGY_LEN + // vcs_methodology
        4 + Self::CID_LEN + // additionality_proof_cid
        2 + // permanence_guarantee_years
        8 + // leakage_assessment
        4 + Self::CID_LEN + // monitoring_plan_cid
        8 + 8 + 4 + 4 + // impact metrics
        4 + 280 + // co_benefits (up to 10 benefits)
        2 + 1 + 8 + 8; // quality & trading data
}

// Carbon measurement data structure
#[account]
pub struct CarbonMeasurement {
    pub project_id: String,
    pub measurement_date: i64,
    pub above_ground_biomass: f64,
    pub below_ground_biomass: f64,
    pub soil_carbon_0_30cm: f64,
    pub soil_carbon_30_100cm: f64,
    pub sequestration_rate_annual: f64,
    pub methodology: String,
    pub uncertainty_percentage: f64,
    pub measurer_authority: Pubkey,
    pub verification_status: VerificationStatus,
    pub satellite_imagery_cid: String,
    pub field_data_cid: String,
}

// Multi-party verification node
#[account]
pub struct VerificationNode {
    pub verifier_pubkey: Pubkey,
    pub verifier_type: VerifierType,
    pub credentials: Vec<String>,
    pub reputation_score: u64,
    pub verification_count: u64,
    pub is_active: bool,
    pub registration_date: i64,
    pub specializations: Vec<EcosystemType>,
}

// Environmental monitoring data
#[account]
pub struct MonitoringData {
    pub project_id: String,
    pub timestamp: i64,
    pub satellite_imagery_cid: String,
    pub ndvi_index: f64,
    pub water_quality: WaterQuality,
    pub temperature_data: Vec<f64>,
    pub tide_data: Vec<TideReading>,
    pub iot_sensor_data: Vec<SensorReading>,
    pub ecosystem_health_score: f64,
}

// Marketplace listing for carbon credits
#[account]
pub struct CarbonCreditListing {
    pub project_id: String,
    pub seller: Pubkey,
    pub vintage_year: u16,
    pub quantity_available: u64,
    pub price_per_ton: u64,
    pub quality_rating: u8,
    pub co_benefits: Vec<CoBenefit>,
    pub certification_standards: Vec<String>,
    pub listing_date: i64,
    pub expiry_date: i64,
    pub is_active: bool,
}

// Impact reporting structure
#[account]
pub struct ImpactReport {
    pub project_id: String,
    pub reporting_period_start: i64,
    pub reporting_period_end: i64,
    pub carbon_sequestered: f64,
    pub ecosystem_health_improvement: f64,
    pub biodiversity_increase: f64,
    pub community_benefits: Vec<CommunityBenefit>,
    pub economic_impact: EconomicImpact,
    pub sdg_contributions: Vec<u8>,
    pub verification_report_cid: String,
}

// Default implementations
impl Default for VerificationStatus {
    fn default() -> Self {
        VerificationStatus::Pending
    }
}

impl Default for EcosystemType {
    fn default() -> Self {
        EcosystemType::MixedBlueCarbon
    }
}

// Input data structures for enhanced functions
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BlueProjectData {
    pub project_id: String,
    pub ipfs_cid: String,
    pub carbon_tons_estimated: u64,
    pub ecosystem_type: EcosystemType,
    pub location: GeoLocation,
    pub area_hectares: f64,
    pub species_composition: Vec<String>,
    pub biodiversity_index: f64,
    pub above_ground_biomass: f64,
    pub below_ground_biomass: f64,
    pub soil_carbon_0_30cm: f64,
    pub soil_carbon_30_100cm: f64,
    pub sequestration_rate_annual: f64,
    pub measurement_methodology: String,
    pub uncertainty_percentage: f64,
    pub vcs_methodology: String,
    pub additionality_proof_cid: String,
    pub permanence_guarantee_years: u16,
    pub leakage_assessment: f64,
    pub monitoring_plan_cid: String,
    pub baseline_ecosystem_health: f64,
    pub species_count_baseline: u32,
    pub co_benefits: Vec<CoBenefit>,
    pub vintage_year: u16,
    pub price_per_ton: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VerifierData {
    pub verifier_type: VerifierType,
    pub credentials: Vec<String>,
    pub specializations: Vec<EcosystemType>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MonitoringDataInput {
    pub project_id: String,
    pub satellite_imagery_cid: String,
    pub ndvi_index: f64,
    pub water_quality: WaterQuality,
    pub temperature_data: Vec<f64>,
    pub tide_data: Vec<TideReading>,
    pub iot_sensor_data: Vec<SensorReading>,
    pub ecosystem_health_score: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MarketplaceListingData {
    pub project_id: String,
    pub vintage_year: u16,
    pub quantity_available: u64,
    pub price_per_ton: u64,
    pub certification_standards: Vec<String>,
    pub expiry_date: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ImpactReportData {
    pub project_id: String,
    pub reporting_period_start: i64,
    pub reporting_period_end: i64,
    pub carbon_sequestered: f64,
    pub community_benefits: Vec<CommunityBenefit>,
    pub economic_impact: EconomicImpact,
    pub sdg_contributions: Vec<u8>,
    pub verification_report_cid: String,
    pub species_count_current: u32,
}
