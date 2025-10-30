#![allow(deprecated)]

use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    associated_token::AssociatedToken,
};

pub mod models;
pub mod auth_utils;
pub mod instructions;

use crate::models::*;
use crate::instructions::*;

declare_id!("6q7u2DH9vswSbpPYZLyaamAyBXQeXBCPfcgmi1dikuQB");

#[program]
pub mod blue_carbon_registry {
    use super::*;

    /// Initializes the global carbon credit registry and creates the carbon credit token mint
    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        decimals: u8,
    ) -> Result<()> {
        instructions::initialize_registry(ctx, decimals)
    }

    /// Registers a new project on the blockchain
    pub fn register_project(
        ctx: Context<RegisterProject>,
        project_id: String,
        ipfs_cid: String,
        carbon_tons_estimated: u64,
    ) -> Result<()> {
        instructions::register_project(ctx, project_id, ipfs_cid, carbon_tons_estimated)
    }

    /// Verifies a project, allowing it to mint carbon credits
    pub fn verify_project(
        ctx: Context<VerifyProject>,
        verified_carbon_tons: u64,
    ) -> Result<()> {
        instructions::verify_project(ctx, verified_carbon_tons)
    }

    /// Mints carbon credits for verified projects only
    pub fn mint_verified_credits(
        ctx: Context<MintVerifiedCredits>, 
        amount: u64
    ) -> Result<()> {
        instructions::mint_verified_credits(ctx, amount)
    }

    /// Legacy mint_credits (deprecated - use mint_verified_credits)
    pub fn mint_credits(ctx: Context<MintCredits>, amount: u64) -> Result<()> {
        instructions::mint_credits(ctx, amount)
    }

    /// Transfers carbon credits from one token account to another
    pub fn transfer_credits(ctx: Context<TransferCredits>, amount: u64) -> Result<()> {
        instructions::transfer_credits(ctx, amount)
    }

    /// Retires carbon credits by transferring them to a burn account
    pub fn retire_credits(ctx: Context<RetireCredits>, amount: u64) -> Result<()> {
        instructions::retire_credits(ctx, amount)
    }

    /// Trade credits (placeholder for internal trading logic)
    pub fn trade_credits(ctx: Context<TradeCredits>, amount: u64) -> Result<()> {
        instructions::trade_credits(ctx, amount)
    }

    /// Track environmental impact data
    pub fn track_impact(ctx: Context<TrackImpact>, data: ImpactData) -> Result<()> {
        instructions::track_impact(ctx, data)
    }

    /// Register a comprehensive blue carbon project with ecosystem data
    pub fn register_blue_carbon_project(
        ctx: Context<RegisterBlueProject>,
        project_data: BlueProjectData,
    ) -> Result<()> {
        instructions::register_blue_carbon_project(ctx, project_data)
    }

    /// Register a verification entity
    pub fn register_verifier(
        ctx: Context<RegisterVerifier>,
        verifier_data: VerifierData,
    ) -> Result<()> {
        instructions::register_verifier(ctx, verifier_data)
    }

    /// Multi-party project verification with enhanced validation
    pub fn multi_party_verify_project(
        ctx: Context<MultiPartyVerifyProject>,
        verified_carbon_tons: u64,
        quality_rating: u8,
        verification_report_cid: String,
    ) -> Result<()> {
        instructions::multi_party_verify_project(ctx, verified_carbon_tons, quality_rating, verification_report_cid)
    }

    /// Submit environmental monitoring data
    pub fn submit_monitoring_data(
        ctx: Context<SubmitMonitoringData>,
        project_id: String,
        timestamp: i64,
        monitoring_data: MonitoringDataInput,
    ) -> Result<()> {
        instructions::submit_monitoring_data(ctx, project_id, timestamp, monitoring_data)
    }

    /// Create marketplace listing for carbon credits
    pub fn create_marketplace_listing(
        ctx: Context<CreateMarketplaceListing>,
        project_id: String,
        listing_data: MarketplaceListingData,
    ) -> Result<()> {
        instructions::create_marketplace_listing(ctx, project_id, listing_data)
    }

    /// Generate impact report
    pub fn generate_impact_report(
        ctx: Context<GenerateImpactReport>,
        project_id: String,
        reporting_period_end: i64,
        report_data: ImpactReportData,
    ) -> Result<()> {
        instructions::generate_impact_report(ctx, project_id, reporting_period_end, report_data)
    }
}

