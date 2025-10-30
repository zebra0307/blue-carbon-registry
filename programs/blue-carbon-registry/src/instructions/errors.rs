use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Project is not verified")]
    ProjectNotVerified,
    #[msg("Amount exceeds verified carbon capacity")]
    ExceedsVerifiedCapacity,
    #[msg("Project has already been processed")]
    ProjectAlreadyProcessed,
    #[msg("Verifier is not active")]
    VerifierNotActive,
    #[msg("Invalid quality rating (must be 1-5)")]
    InvalidQualityRating,
    #[msg("Exceeds available quantity")]
    ExceedsAvailableQuantity,
    #[msg("Invalid ecosystem type")]
    InvalidEcosystemType,
    #[msg("Insufficient monitoring data")]
    InsufficientMonitoringData,
    #[msg("Invalid carbon measurement")]
    InvalidCarbonMeasurement,
    #[msg("Compliance validation failed")]
    ComplianceValidationFailed,
    #[msg("Not enough credits to trade.")]
    InsufficientCredits,
}
