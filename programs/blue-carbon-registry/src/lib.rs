#![allow(deprecated)]

use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
    associated_token::AssociatedToken,
};

declare_id!("GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr");

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
}

// `const` block for static sizes of the `Project` account data.
impl Project {
    const ID_LEN: usize = 32; // Project ID string
    const CID_LEN: usize = 46; // IPFS CID is typically 46 characters
    pub const LEN: usize =
        4 + Self::ID_LEN + // project_id
        32 + // owner
        4 + Self::CID_LEN + // ipfs_cid
        8 + // carbon_tons_estimated
        1 + // verification_status (enum)
        8 + // credits_issued
        8 + // tokens_minted
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone, PartialEq)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
}

impl Default for VerificationStatus {
    fn default() -> Self {
        VerificationStatus::Pending
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Project is not verified")]
    ProjectNotVerified,
    #[msg("Amount exceeds verified carbon capacity")]
    ExceedsVerifiedCapacity,
    #[msg("Project has already been processed")]
    ProjectAlreadyProcessed,
}
