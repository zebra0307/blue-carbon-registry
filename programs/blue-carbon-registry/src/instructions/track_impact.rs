use anchor_lang::prelude::*;
use crate::models::*;
use crate::instructions::contexts::*;

pub fn track_impact(ctx: Context<TrackImpact>, data: ImpactData) -> Result<()> {
    msg!("CO₂ absorbed: {}", data.co2_absorbed);
    msg!("Biodiversity Index: {}", data.biodiversity_index);
    Ok(())
}

pub fn generate_impact_report(
    ctx: Context<GenerateImpactReport>,
    project_id: String,
    reporting_period_end: i64,
    report_data: ImpactReportData,
) -> Result<()> {
    let report = &mut ctx.accounts.impact_report;
    let project = &mut ctx.accounts.project;

    report.project_id = report_data.project_id;
    report.reporting_period_start = report_data.reporting_period_start;
    report.reporting_period_end = report_data.reporting_period_end;
    report.carbon_sequestered = report_data.carbon_sequestered;
    report.ecosystem_health_improvement = 
        project.current_ecosystem_health - project.baseline_ecosystem_health;
    report.biodiversity_increase = 
        (project.species_count_current as f64 - project.species_count_baseline as f64) /
        project.species_count_baseline as f64 * 100.0;
    report.community_benefits = report_data.community_benefits;
    report.economic_impact = report_data.economic_impact;
    report.sdg_contributions = report_data.sdg_contributions;
    report.verification_report_cid = report_data.verification_report_cid;

    // Update project metrics
    project.species_count_current = report_data.species_count_current;

    msg!("Impact report generated for project: {}", report.project_id);
    msg!("Carbon sequestered: {} tons", report.carbon_sequestered);
    msg!("Ecosystem health improvement: {}%", report.ecosystem_health_improvement);

    Ok(())
}

// Legacy ImpactData structure for backwards compatibility
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ImpactData {
    pub co2_absorbed: f64,
    pub biodiversity_index: f64,
}

// TrackImpact context (simple version)
#[derive(Accounts)]
pub struct TrackImpact<'info> {
    pub authority: Signer<'info>,
}
