use anchor_lang::prelude::*;
use crate::models::*;
use crate::instructions::contexts::*;

pub fn submit_monitoring_data(
    ctx: Context<SubmitMonitoringData>,
    _project_id: String,
    _timestamp: i64,
    monitoring_data: MonitoringDataInput,
) -> Result<()> {
    let monitoring = &mut ctx.accounts.monitoring_data;
    let project = &mut ctx.accounts.project;

    monitoring.project_id = monitoring_data.project_id.clone();
    monitoring.timestamp = Clock::get()?.unix_timestamp;
    monitoring.satellite_imagery_cid = monitoring_data.satellite_imagery_cid;
    monitoring.ndvi_index = monitoring_data.ndvi_index;
    monitoring.water_quality = monitoring_data.water_quality;
    monitoring.temperature_data = monitoring_data.temperature_data;
    monitoring.tide_data = monitoring_data.tide_data;
    monitoring.iot_sensor_data = monitoring_data.iot_sensor_data;
    monitoring.ecosystem_health_score = monitoring_data.ecosystem_health_score;

    // Update project health metrics
    project.current_ecosystem_health = monitoring_data.ecosystem_health_score;

    msg!("Monitoring data submitted for project: {}", monitoring.project_id);
    msg!("Ecosystem health score: {}", monitoring.ecosystem_health_score);

    Ok(())
}
