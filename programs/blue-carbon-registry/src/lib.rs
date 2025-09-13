use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, MintTo, Token, Transfer},
};

declare_id!("GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr");

#[program]
pub mod blue_carbon_registry {
    use super::*;

    /// Registers a new project on the blockchain.
    /// This instruction creates a new Project account and stores the initial project data.
    pub fn register_project(
        ctx: Context<RegisterProject>,
        project_id: String,
        ipfs_cid: String,
    ) -> Result<()> {
        let project_account = &mut ctx.accounts.project;

        // Set the initial project data on the new account.
        project_account.project_id = project_id;
        project_account.owner = ctx.accounts.project_owner.key();
        project_account.ipfs_cid = ipfs_cid;
        project_account.credits_issued = 0;
        project_account.bump = ctx.bumps.project;

        msg!("Project registered successfully!");
        msg!("Project Owner: {}", project_account.owner);
        msg!("IPFS CID: {}", project_account.ipfs_cid);

        Ok(())
    }

    /// Mints new carbon credits (SPL tokens) to a recipient.
    /// This instruction uses Cross-Program Invocation (CPI) to call the SPL Token Program.
    pub fn mint_credits(ctx: Context<MintCredits>, amount: u64) -> Result<()> {
        // Create the context for the `mint_to` instruction of the SPL Token Program.
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        // Seeds for the PDA authority.
        let seeds = &[
            b"project",
            ctx.accounts.project.owner.as_ref(),
            ctx.accounts.project.project_id.as_bytes(),
            &[ctx.accounts.project.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Call the `mint_to` function to issue the tokens, using the PDA as the signer.
        token::mint_to(
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds),
            amount,
        )?;

        // Update the credits issued on the project account.
        let project_account = &mut ctx.accounts.project;
        project_account.credits_issued += amount;
        
        msg!(
            "Minted {} credits to {}",
            amount,
            ctx.accounts.recipient_token_account.key()
        );

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

    #[account(mut)]
    pub project_owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// `#[derive(Accounts)]` macro defines the accounts required for the `mint_credits` instruction.
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

// `#[account]` macro defines the `Project` data structure.
// `Debug` and `Default` traits are useful for testing.
#[account]
#[derive(Debug, Default)]
pub struct Project {
    pub project_id: String,
    pub owner: Pubkey,
    pub ipfs_cid: String,
    pub credits_issued: u64,
    pub bump: u8,
}

// `const` block for static sizes of the `Project` account data.
impl Project {
    const ID_LEN: usize = 32; // Public key is 32 bytes
    const CID_LEN: usize = 46; // IPFS CID is typically 46 characters
    pub const LEN: usize =
        4 + Self::ID_LEN + // project_id
        32 + // owner
        4 + Self::CID_LEN + // ipfs_cid
        8 + // credits_issued
        1; // bump
}
