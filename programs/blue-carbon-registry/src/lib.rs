#![allow(deprecated)]

use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
    associated_token::AssociatedToken,
};

declare_id!("6q7u2DH9vswSbpPYZLyaamAyBXQeXBCPfcgmi1dikuQB");

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
    CertificationBody,   // VCS, Gold Standard, etc.
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

#[program]
pub mod blue_carbon_registry {
    use super::*;

    /// Initializes the global carbon credit registry and creates the carbon credit token mint
    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        _decimals: u8, // Decimals are set in the account constraint
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        
        registry.total_credits_issued = 0;
        registry.total_projects = 0;
        registry.admin = ctx.accounts.admin.key();
        registry.mint_authority = ctx.accounts.mint_authority.key();
        registry.carbon_token_mint = ctx.accounts.carbon_token_mint.key();
        registry.bump = ctx.bumps.registry;
        registry.mint_authority_bump = ctx.bumps.mint_authority;
        
        msg!("Carbon Credit Registry initialized successfully!");
        msg!("Admin: {}", registry.admin);
        msg!("Carbon Token Mint: {}", registry.carbon_token_mint);
        
        Ok(())
    }

    /// Registers a new project on the blockchain.
    /// This instruction creates a new Project account and stores the initial project data.
    pub fn register_project(
        ctx: Context<RegisterProject>,
        project_id: String,
        ipfs_cid: String,
        carbon_tons_estimated: u64,
    ) -> Result<()> {
        let project_account = &mut ctx.accounts.project;
        let registry = &mut ctx.accounts.registry;

        // Set the initial project data on the new account.
        project_account.project_id = project_id;
        project_account.owner = ctx.accounts.project_owner.key();
        project_account.ipfs_cid = ipfs_cid;
        project_account.carbon_tons_estimated = carbon_tons_estimated;
        project_account.verification_status = VerificationStatus::Pending;
        project_account.credits_issued = 0;
        project_account.tokens_minted = 0;
        project_account.bump = ctx.bumps.project;

        // Update global registry
        registry.total_projects += 1;

        msg!("Project registered successfully!");
        msg!("Project Owner: {}", project_account.owner);
        msg!("IPFS CID: {}", project_account.ipfs_cid);
        msg!("Estimated Carbon Tons: {}", project_account.carbon_tons_estimated);

        Ok(())
    }

    /// Verifies a project, allowing it to mint carbon credits
    pub fn verify_project(
        ctx: Context<VerifyProject>,
        verified_carbon_tons: u64,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(
            project.verification_status == VerificationStatus::Pending,
            ErrorCode::ProjectAlreadyProcessed
        );

        project.verification_status = VerificationStatus::Verified;
        project.carbon_tons_estimated = verified_carbon_tons;

        msg!("Project {} verified successfully!", project.project_id);
        msg!("Verified carbon tons: {}", verified_carbon_tons);

        Ok(())
    }

    /// Mints carbon credits for verified projects only
    pub fn mint_verified_credits(
        ctx: Context<MintVerifiedCredits>, 
        amount: u64
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let registry = &mut ctx.accounts.registry;
        
        // Ensure project is verified
        require!(
            project.verification_status == VerificationStatus::Verified,
            ErrorCode::ProjectNotVerified
        );

        // Ensure we don't exceed the verified carbon tons (1 token = 1 ton)
        require!(
            project.tokens_minted + amount <= project.carbon_tons_estimated,
            ErrorCode::ExceedsVerifiedCapacity
        );

        // Create the context for the `mint_to` instruction of the SPL Token Program.
        let cpi_accounts = MintTo {
            mint: ctx.accounts.carbon_token_mint.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        // Seeds for the PDA mint authority
        let mint_authority_bump = registry.mint_authority_bump;
        let seeds = &[b"mint_authority".as_ref(), &[mint_authority_bump]];
        let signer_seeds = &[&seeds[..]];

        // Call the `mint_to` function to issue the tokens
        token::mint_to(
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds),
            amount,
        )?;

        // Update project and registry tracking
        project.credits_issued += amount;
        project.tokens_minted += amount;
        registry.total_credits_issued += amount;
        
        msg!(
            "Minted {} carbon credit tokens for project {}",
            amount,
            project.project_id
        );
        msg!("Total tokens minted for project: {}", project.tokens_minted);
        msg!("Global total credits issued: {}", registry.total_credits_issued);

        Ok(())
    }

    /// Transfers carbon credits from one token account to another.
    pub fn transfer_credits(ctx: Context<TransferCredits>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.to_account.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!("Transferred {} credits.", amount);

        Ok(())
    }

    /// Retires carbon credits by transferring them to a burn account.
    pub fn retire_credits(ctx: Context<RetireCredits>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.retirement_account.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!("Retired {} credits.", amount);

        Ok(())
    }

    /// Register a comprehensive blue carbon project with ecosystem data
    pub fn register_blue_carbon_project(
        ctx: Context<RegisterBlueProject>,
        project_data: BlueProjectData,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let registry = &mut ctx.accounts.registry;

        // Set comprehensive project data
        project.project_id = project_data.project_id;
        project.owner = ctx.accounts.project_owner.key();
        project.ipfs_cid = project_data.ipfs_cid;
        project.carbon_tons_estimated = project_data.carbon_tons_estimated;
        project.verification_status = VerificationStatus::Pending;
        
        // Blue carbon ecosystem data
        project.ecosystem_type = project_data.ecosystem_type;
        project.location = project_data.location;
        project.area_hectares = project_data.area_hectares;
        project.species_composition = project_data.species_composition;
        project.biodiversity_index = project_data.biodiversity_index;
        project.establishment_date = Clock::get()?.unix_timestamp;
        
        // Carbon science data
        project.above_ground_biomass = project_data.above_ground_biomass;
        project.below_ground_biomass = project_data.below_ground_biomass;
        project.soil_carbon_0_30cm = project_data.soil_carbon_0_30cm;
        project.soil_carbon_30_100cm = project_data.soil_carbon_30_100cm;
        project.sequestration_rate_annual = project_data.sequestration_rate_annual;
        project.measurement_methodology = project_data.measurement_methodology;
        project.uncertainty_percentage = project_data.uncertainty_percentage;
        
        // Compliance data
        project.vcs_methodology = project_data.vcs_methodology;
        project.additionality_proof_cid = project_data.additionality_proof_cid;
        project.permanence_guarantee_years = project_data.permanence_guarantee_years;
        project.leakage_assessment = project_data.leakage_assessment;
        project.monitoring_plan_cid = project_data.monitoring_plan_cid;
        
        // Initialize impact metrics
        project.baseline_ecosystem_health = project_data.baseline_ecosystem_health;
        project.current_ecosystem_health = project_data.baseline_ecosystem_health;
        project.species_count_baseline = project_data.species_count_baseline;
        project.species_count_current = project_data.species_count_baseline;
        project.co_benefits = project_data.co_benefits;
        
        // Trading data
        project.vintage_year = project_data.vintage_year;
        project.quality_rating = 0; // To be set during verification
        project.price_per_ton = project_data.price_per_ton;
        project.available_quantity = project_data.carbon_tons_estimated;
        
        project.bump = ctx.bumps.project;

        // Update registry
        registry.total_projects += 1;

        msg!("Blue Carbon Project registered: {}", project.project_id);
        msg!("Ecosystem Type: {:?}", project.ecosystem_type);
        msg!("Location: {}, {}", project.location.latitude, project.location.longitude);
        msg!("Area: {} hectares", project.area_hectares);

        Ok(())
    }

    /// Register a verification entity
    pub fn register_verifier(
        ctx: Context<RegisterVerifier>,
        verifier_data: VerifierData,
    ) -> Result<()> {
        let verifier = &mut ctx.accounts.verifier;

        verifier.verifier_pubkey = ctx.accounts.verifier_authority.key();
        verifier.verifier_type = verifier_data.verifier_type;
        verifier.credentials = verifier_data.credentials;
        verifier.reputation_score = 100; // Starting score
        verifier.verification_count = 0;
        verifier.is_active = true;
        verifier.registration_date = Clock::get()?.unix_timestamp;
        verifier.specializations = verifier_data.specializations;

        msg!("Verifier registered: {:?}", verifier.verifier_type);

        Ok(())
    }

    /// Multi-party project verification with enhanced validation
    pub fn multi_party_verify_project(
        ctx: Context<MultiPartyVerifyProject>,
        verified_carbon_tons: u64,
        quality_rating: u8,
        verification_report_cid: String,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let verifier = &mut ctx.accounts.verifier;
        
        require!(
            project.verification_status == VerificationStatus::Pending ||
            project.verification_status == VerificationStatus::UnderReview,
            ErrorCode::ProjectAlreadyProcessed
        );

        require!(verifier.is_active, ErrorCode::VerifierNotActive);
        require!(quality_rating >= 1 && quality_rating <= 5, ErrorCode::InvalidQualityRating);

        // Update project verification
        project.verification_status = VerificationStatus::Verified;
        project.carbon_tons_estimated = verified_carbon_tons;
        project.quality_rating = quality_rating;
        project.available_quantity = verified_carbon_tons;

        // Update verifier stats
        verifier.verification_count += 1;
        verifier.reputation_score += 10; // Reward for verification

        msg!("Project {} verified by {:?}", project.project_id, verifier.verifier_type);
        msg!("Verified carbon tons: {}", verified_carbon_tons);
        msg!("Quality rating: {}/5", quality_rating);

        Ok(())
    }

    /// Submit environmental monitoring data
    pub fn submit_monitoring_data(
        ctx: Context<SubmitMonitoringData>,
        project_id: String,
        timestamp: i64,
        monitoring_data: MonitoringDataInput,
    ) -> Result<()> {
        let monitoring = &mut ctx.accounts.monitoring_data;
        let project = &mut ctx.accounts.project;

        monitoring.project_id = monitoring_data.project_id;
        monitoring.timestamp = Clock::get()?.unix_timestamp;
        monitoring.satellite_imagery_cid = monitoring_data.satellite_imagery_cid;
        monitoring.ndvi_index = monitoring_data.ndvi_index;
        monitoring.water_quality = monitoring_data.water_quality;
        monitoring.temperature_data = monitoring_data.temperature_data;
        monitoring.tide_data = monitoring_data.tide_data;
        monitoring.iot_sensor_data = monitoring_data.iot_sensor_data;
        monitoring.ecosystem_health_score = monitoring_data.ecosystem_health_score;

        // Update project health metrics
        project.current_ecosystem_health = monitoring_data.ecosystem_health_score;

        msg!("Monitoring data submitted for project: {}", monitoring.project_id);
        msg!("Ecosystem health score: {}", monitoring.ecosystem_health_score);

        Ok(())
    }

    /// Create marketplace listing for carbon credits
    pub fn create_marketplace_listing(
        ctx: Context<CreateMarketplaceListing>,
        project_id: String,
        listing_data: MarketplaceListingData,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let project = &ctx.accounts.project;

        require!(
            project.verification_status == VerificationStatus::Verified,
            ErrorCode::ProjectNotVerified
        );

        require!(
            listing_data.quantity_available <= project.available_quantity,
            ErrorCode::ExceedsAvailableQuantity
        );

        listing.project_id = listing_data.project_id;
        listing.seller = ctx.accounts.seller.key();
        listing.vintage_year = listing_data.vintage_year;
        listing.quantity_available = listing_data.quantity_available;
        listing.price_per_ton = listing_data.price_per_ton;
        listing.quality_rating = project.quality_rating;
        listing.co_benefits = project.co_benefits.clone();
        listing.certification_standards = listing_data.certification_standards;
        listing.listing_date = Clock::get()?.unix_timestamp;
        listing.expiry_date = listing_data.expiry_date;
        listing.is_active = true;

        msg!("Marketplace listing created for project: {}", listing.project_id);
        msg!("Quantity: {} tons at {} per ton", listing.quantity_available, listing.price_per_ton);

        Ok(())
    }

    /// Generate impact report
    pub fn generate_impact_report(
        ctx: Context<GenerateImpactReport>,
        project_id: String,
        reporting_period_end: i64,
        report_data: ImpactReportData,
    ) -> Result<()> {
        let report = &mut ctx.accounts.impact_report;
        let project = &mut ctx.accounts.project;

        report.project_id = report_data.project_id;
        report.reporting_period_start = report_data.reporting_period_start;
        report.reporting_period_end = report_data.reporting_period_end;
        report.carbon_sequestered = report_data.carbon_sequestered;
        report.ecosystem_health_improvement = 
            project.current_ecosystem_health - project.baseline_ecosystem_health;
        report.biodiversity_increase = 
            (project.species_count_current as f64 - project.species_count_baseline as f64) / 
            project.species_count_baseline as f64 * 100.0;
        report.community_benefits = report_data.community_benefits;
        report.economic_impact = report_data.economic_impact;
        report.sdg_contributions = report_data.sdg_contributions;
        report.verification_report_cid = report_data.verification_report_cid;

        // Update project metrics
        project.species_count_current = report_data.species_count_current;

        msg!("Impact report generated for project: {}", report.project_id);
        msg!("Carbon sequestered: {} tons", report.carbon_sequestered);
        msg!("Ecosystem health improvement: {}%", report.ecosystem_health_improvement);

        Ok(())
    }
}

// Account validation for initialize_registry instruction
#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalRegistry::LEN,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = mint_authority,
        seeds = [b"carbon_token_mint"],
        bump
    )]
    pub carbon_token_mint: Account<'info, Mint>,

    /// CHECK: This is the mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// `#[derive(Accounts)]` macro defines the accounts required for the `register_project` instruction.
#[derive(Accounts)]
#[instruction(project_id: String)]
pub struct RegisterProject<'info> {
    // `init` creates a new account.
    // `payer` specifies who pays for the rent of the new account (the project owner).
    // `space` calculates the size of the `Project` account.
    // `seeds` ensures the account address is a Program Derived Address (PDA), making it deterministic.
    #[account(
        init,
        payer = project_owner,
        space = 8 + Project::LEN,
        seeds = [b"project", project_owner.key().as_ref(), project_id.as_bytes()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(mut)]
    pub project_owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Account validation for verify_project instruction
#[derive(Accounts)]
pub struct VerifyProject<'info> {
    #[account(
        mut,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        seeds = [b"registry"],
        bump = registry.bump,
        has_one = admin
    )]
    pub registry: Account<'info, GlobalRegistry>,

    pub admin: Signer<'info>,
}

// Account validation for mint_verified_credits instruction
#[derive(Accounts)]
pub struct MintVerifiedCredits<'info> {
    #[account(
        mut,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump,
        has_one = owner
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(
        mut,
        seeds = [b"carbon_token_mint"],
        bump
    )]
    pub carbon_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = carbon_token_mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,

    pub owner: Signer<'info>,
    pub recipient: SystemAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// `#[derive(Accounts)]` macro defines the accounts required for the legacy `mint_credits` instruction.
// DEPRECATED: Use mint_verified_credits instead
#[derive(Accounts)]
pub struct MintCredits<'info> {
    // `mint` is the token's Mint account.
    #[account(mut)]
    /// CHECK: This is the mint account for the token
    pub mint: AccountInfo<'info>,

    // `project` is the Project account being updated.
    #[account(
        mut,
        has_one = owner,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub owner: Signer<'info>,

    // `recipient_token_account` is the account that will receive the new tokens.
    #[account(mut)]
    /// CHECK: This is the recipient token account
    pub recipient_token_account: AccountInfo<'info>,

    /// CHECK: The mint authority is a PDA, so we validate it with seeds.
    #[account(
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub mint_authority: AccountInfo<'info>,

    // `token_program` is a reference to the SPL Token Program, needed for CPI.
    pub token_program: Program<'info, Token>,
}

// Accounts for the transfer_credits instruction
#[derive(Accounts)]
pub struct TransferCredits<'info> {
    #[account(mut)]
    /// CHECK: This is the source token account
    pub from_account: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is the destination token account
    pub to_account: AccountInfo<'info>,
    
    pub from_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Accounts for the retire_credits instruction
#[derive(Accounts)]
pub struct RetireCredits<'info> {
    #[account(mut)]
    /// CHECK: This is the source token account
    pub from_account: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is a placeholder for a "burn" or "retirement" account.
    pub retirement_account: AccountInfo<'info>,
    
    pub from_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
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

// `#[account]` macro defines the `Project` data structure.
// `Debug` and `Default` traits are useful for testing.
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

// Geographic location data
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct GeoLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub polygon_coordinates: Vec<[f64; 2]>, // For complex shapes
    pub country_code: String,
    pub region_name: String,
}

// Carbon measurement data structure
#[account]
pub struct CarbonMeasurement {
    pub project_id: String,
    pub measurement_date: i64,
    pub above_ground_biomass: f64,        // Tons C
    pub below_ground_biomass: f64,        // Tons C  
    pub soil_carbon_0_30cm: f64,          // Tons C
    pub soil_carbon_30_100cm: f64,        // Tons C
    pub sequestration_rate_annual: f64,   // Tons C/year
    pub methodology: String,              // e.g., "IPCC 2019 Blue Carbon"
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
    pub satellite_imagery_cid: String,    // IPFS link to imagery
    pub ndvi_index: f64,                  // Vegetation health
    pub water_quality: WaterQuality,
    pub temperature_data: Vec<f64>,
    pub tide_data: Vec<TideReading>,
    pub iot_sensor_data: Vec<SensorReading>,
    pub ecosystem_health_score: f64,
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
    pub tide_type: String, // "high", "low", "rising", "falling"
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

// Marketplace listing for carbon credits
#[account]
pub struct CarbonCreditListing {
    pub project_id: String,
    pub seller: Pubkey,
    pub vintage_year: u16,
    pub quantity_available: u64,
    pub price_per_ton: u64,
    pub quality_rating: u8,               // 1-5 stars
    pub co_benefits: Vec<CoBenefit>,
    pub certification_standards: Vec<String>, // VCS, Gold Standard, etc.
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
    pub sdg_contributions: Vec<u8>, // UN SDG numbers achieved
    pub verification_report_cid: String,
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

// Enhanced project implementation with size calculation
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

// Enhanced account validation contexts
#[derive(Accounts)]
#[instruction(project_data: BlueProjectData)]
pub struct RegisterBlueProject<'info> {
    #[account(
        init,
        payer = project_owner,
        space = 8 + Project::LEN,
        seeds = [b"project", project_owner.key().as_ref(), project_data.project_id.as_bytes()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(mut)]
    pub project_owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(verifier_data: VerifierData)]
pub struct RegisterVerifier<'info> {
    #[account(
        init,
        payer = verifier_authority,
        space = 8 + 1000, // Space for verifier data
        seeds = [b"verifier", verifier_authority.key().as_ref()],
        bump
    )]
    pub verifier: Account<'info, VerificationNode>,

    #[account(mut)]
    pub verifier_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MultiPartyVerifyProject<'info> {
    #[account(
        mut,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"verifier", verifier_authority.key().as_ref()],
        bump
    )]
    pub verifier: Account<'info, VerificationNode>,

    pub verifier_authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(project_id: String, timestamp: i64)]
pub struct SubmitMonitoringData<'info> {
    #[account(
        init,
        payer = data_provider,
        space = 8 + 2000, // Space for monitoring data
        seeds = [b"monitoring", project_id.as_bytes(), &timestamp.to_le_bytes()],
        bump
    )]
    pub monitoring_data: Account<'info, MonitoringData>,

    #[account(
        mut,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub data_provider: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: String)]
pub struct CreateMarketplaceListing<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + 1000, // Space for listing data
        seeds = [b"listing", project_id.as_bytes(), seller.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, CarbonCreditListing>,

    #[account(
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: String, reporting_period_end: i64)]
pub struct GenerateImpactReport<'info> {
    #[account(
        init,
        payer = report_generator,
        space = 8 + 1500, // Space for impact report
        seeds = [b"impact_report", project_id.as_bytes(), &reporting_period_end.to_le_bytes()],
        bump
    )]
    pub impact_report: Account<'info, ImpactReport>,

    #[account(
        mut,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub report_generator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Project is not verified")]
    ProjectNotVerified,
    #[msg("Amount exceeds verified carbon capacity")]
    ExceedsVerifiedCapacity,
    #[msg("Project has already been processed")]
    ProjectAlreadyProcessed,
    #[msg("Verifier is not active")]
    VerifierNotActive,
    #[msg("Invalid quality rating (must be 1-5)")]
    InvalidQualityRating,
    #[msg("Exceeds available quantity")]
    ExceedsAvailableQuantity,
    #[msg("Invalid ecosystem type")]
    InvalidEcosystemType,
    #[msg("Insufficient monitoring data")]
    InsufficientMonitoringData,
    #[msg("Invalid carbon measurement")]
    InvalidCarbonMeasurement,
    #[msg("Compliance validation failed")]
    ComplianceValidationFailed,
}
