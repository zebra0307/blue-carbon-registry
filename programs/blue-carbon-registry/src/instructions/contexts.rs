use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    associated_token::AssociatedToken,
};
use crate::models::*;

// Account validation for initialize_registry instruction
#[derive(Accounts)]
#[instruction(_decimals: u8)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalRegistry::LEN,
        seeds = [b"registry_v3"],
        bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(
        init,
        payer = admin,
        mint::decimals = _decimals,
        mint::authority = registry,
        seeds = [b"carbon_token_mint_v3"],
        bump
    )]
    pub carbon_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Account validation for the `register_project` instruction
#[derive(Accounts)]
#[instruction(project_id: String)]
pub struct RegisterProject<'info> {
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
        seeds = [b"registry_v3"],
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
        seeds = [b"registry_v3"],
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
        seeds = [b"registry_v3"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalRegistry>,

    #[account(
        mut,
        seeds = [b"carbon_token_mint_v3"],
        bump
    )]
    pub carbon_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = carbon_token_mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,
    pub recipient: SystemAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// DEPRECATED: Legacy mint_credits account structure
#[derive(Accounts)]
pub struct MintCredits<'info> {
    #[account(mut)]
    /// CHECK: This is the mint account for the token
    pub mint: AccountInfo<'info>,

    #[account(
        mut,
        has_one = owner,
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    /// CHECK: This is the recipient token account
    pub recipient_token_account: AccountInfo<'info>,

    /// CHECK: The mint authority is a PDA, so we validate it with seeds.
    #[account(
        seeds = [b"project", project.owner.as_ref(), project.project_id.as_bytes()],
        bump = project.bump
    )]
    pub mint_authority: AccountInfo<'info>,

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

// Accounts for trade_credits (placeholder)
#[derive(Accounts)]
pub struct TradeCredits<'info> {
    pub authority: Signer<'info>,
}

// Enhanced account validation contexts for blue carbon features
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
        seeds = [b"registry_v3"],
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
        space = 8 + 1000,
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
        space = 8 + 2000,
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
        space = 8 + 1000,
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
        space = 8 + 1500,
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
