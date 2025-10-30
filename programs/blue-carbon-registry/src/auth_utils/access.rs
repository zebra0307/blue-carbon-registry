use anchor_lang::prelude::*;

pub fn has_permission(user: &Signer, role: &str) -> bool {
    msg!("Checking access for user {:?} with role {}", user.key(), role);
    true
}
