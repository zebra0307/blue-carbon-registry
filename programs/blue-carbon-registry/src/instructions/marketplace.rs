use anchor_lang::prelude::*;
use crate::models::*;
use crate::instructions::{contexts::*, errors::ErrorCode};

pub fn create_marketplace_listing(
    ctx: Context<CreateMarketplaceListing>,
    _project_id: String,
    listing_data: MarketplaceListingData,
) -> Result<()> {
    let listing = &mut ctx.accounts.listing;
    let project = &ctx.accounts.project;

    require!(
        project.verification_status == VerificationStatus::Verified,
        ErrorCode::ProjectNotVerified
    );

    require!(
        listing_data.quantity_available <= project.available_quantity,
        ErrorCode::ExceedsAvailableQuantity
    );

    listing.project_id = listing_data.project_id.clone();
    listing.seller = ctx.accounts.seller.key();
    listing.vintage_year = listing_data.vintage_year;
    listing.quantity_available = listing_data.quantity_available;
    listing.price_per_ton = listing_data.price_per_ton;
    listing.quality_rating = project.quality_rating;
    listing.co_benefits = project.co_benefits.clone();
    listing.certification_standards = listing_data.certification_standards;
    listing.listing_date = Clock::get()?.unix_timestamp;
    listing.expiry_date = listing_data.expiry_date;
    listing.is_active = true;

    msg!("Marketplace listing created for project: {}", listing.project_id);
    msg!("Quantity: {} tons at {} per ton", listing.quantity_available, listing.price_per_ton);

    Ok(())
}
