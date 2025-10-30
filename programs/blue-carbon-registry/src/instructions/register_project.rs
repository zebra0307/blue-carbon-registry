use anchor_lang::prelude::*;
use crate::models::*;
use crate::instructions::contexts::*;

pub fn register_project(
    ctx: Context<RegisterProject>,
    project_id: String,
    ipfs_cid: String,
    carbon_tons_estimated: u64,
) -> Result<()> {
    let project_account = &mut ctx.accounts.project;
    let registry = &mut ctx.accounts.registry;

    // Set the initial project data on the new account.
    project_account.project_id = project_id.clone();
    project_account.owner = ctx.accounts.project_owner.key();
    project_account.ipfs_cid = ipfs_cid.clone();
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

pub fn register_blue_carbon_project(
    ctx: Context<RegisterBlueProject>,
    project_data: BlueProjectData,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let registry = &mut ctx.accounts.registry;

    // Set comprehensive project data
    project.project_id = project_data.project_id.clone();
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
