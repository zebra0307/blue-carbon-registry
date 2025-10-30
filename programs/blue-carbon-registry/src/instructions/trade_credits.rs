use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use crate::instructions::{contexts::*, errors::ErrorCode};

pub fn trade_credits(ctx: Context<TradeCredits>, amount: u64) -> Result<()> {
    // This is a placeholder that just uses the internal project.credits counter
    // In a real implementation, this would transfer SPL tokens
    msg!("Trading {} credits (internal counter)", amount);
    Ok(())
}

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
