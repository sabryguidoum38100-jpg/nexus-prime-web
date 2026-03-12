use metrics_exporter_prometheus::{PrometheusBuilder, PrometheusHandle};
use once_cell::sync::Lazy;
use prometheus::{IntCounter, Registry};

pub static REQUESTS_TOTAL: Lazy<IntCounter> = Lazy::new(|| {
    IntCounter::new("http_requests_total", "Total HTTP requests").expect("metric")
});

pub type RegistryType = Registry;

pub fn install_global_recorder() -> anyhow::Result<PrometheusHandle> {
    let builder = PrometheusBuilder::new();
    let handle = builder.install_recorder()?;
    metrics::describe_counter!(
        "http_requests_total",
        "Total HTTP requests handled by the API"
    );
    Ok(handle)
}
