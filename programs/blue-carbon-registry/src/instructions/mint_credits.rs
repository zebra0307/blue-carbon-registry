use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo};
use crate::models::*;
use crate::instructions::{contexts::*, errors::ErrorCode};

pub fn initialize_registry(
    ctx: Context<InitializeRegistry>,
    _decimals: u8,
) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    
    registry.total_credits_issued = 0;
    registry.total_projects = 0;
    registry.admin = ctx.accounts.admin.key();
    registry.mint_authority = registry.key();
    registry.carbon_token_mint = ctx.accounts.carbon_token_mint.key();
    registry.bump = ctx.bumps.registry;
    registry.mint_authority_bump = ctx.bumps.registry;
    
    msg!("Carbon Credit Registry initialized successfully!");
    msg!("Admin: {}", registry.admin);
    msg!("Carbon Token Mint: {}", registry.carbon_token_mint);
    
    Ok(())
}

pub fn mint_verified_credits(
    ctx: Context<MintVerifiedCredits>, 
    amount: u64
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    
    // Ensure project is verified
    require!(
        project.verification_status == VerificationStatus::Verified,
        ErrorCode::ProjectNotVerified
    );

    // Ensure we don't exceed the verified carbon tons (1 token = 1 ton)
    // Scale carbon_tons_estimated to match token precision (6 decimals)
    let verified_capacity = project.carbon_tons_estimated * 10u64.pow(6);
    require!(
        project.tokens_minted + amount <= verified_capacity,
        ErrorCode::ExceedsVerifiedCapacity
    );

    // Get the bump from registry without mutable borrow
    let registry_bump = ctx.accounts.registry.bump;

    // Create the context for the `mint_to` instruction of the SPL Token Program.
    let cpi_accounts = MintTo {
        mint: ctx.accounts.carbon_token_mint.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.registry.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();

    // Seeds for the registry PDA (now the mint authority)
    let seeds = &[b"registry_v3".as_ref(), &[registry_bump]];
    let signer_seeds = &[&seeds[..]];

    // Call the `mint_to` function to issue the tokens
    token::mint_to(
        CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds),
        amount,
    )?;

    // Update project and registry tracking
    let registry = &mut ctx.accounts.registry;
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

// Legacy mint_credits (deprecated)
pub fn mint_credits(ctx: Context<MintCredits>, amount: u64) -> Result<()> {
    let project = &mut ctx.accounts.project;
    
    // Basic validation
    require!(
        project.verification_status == VerificationStatus::Verified,
        ErrorCode::ProjectNotVerified
    );

    // Create the context for the `mint_to` instruction
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();

    // PDA seeds for signing
    let project_id_bytes = project.project_id.as_bytes();
    let seeds = &[
        b"project",
        project.owner.as_ref(),
        project_id_bytes,
        &[project.bump],
    ];
    let signer = &[&seeds[..]];

    // Mint the tokens
    token::mint_to(
        CpiContext::new_with_signer(cpi_program, cpi_accounts, signer),
        amount,
    )?;

    // Update the project's credits_issued count
    project.credits_issued += amount;
    project.tokens_minted += amount;

    msg!("Minted {} credits for project {}", amount, project.project_id);

    Ok(())
}
