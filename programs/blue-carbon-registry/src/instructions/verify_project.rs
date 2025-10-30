use anchor_lang::prelude::*;
use crate::models::*;
use crate::instructions::{contexts::*, errors::ErrorCode};

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
