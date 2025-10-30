use anchor_lang::prelude::*;

pub fn validate_authority(authority: &Signer) -> Result<()> {
    msg!("Validating authority: {:?}", authority.key());
    Ok(())
}
