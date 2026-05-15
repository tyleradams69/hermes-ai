export function generateOperationalHealth({
  failures = [],
  approvals = [],
  predictions = [],
}) {

  const metrics = [];

  // FAILURE RATE

  const highSeverityFailures =
    failures.filter(
      (item) =>
        String(item.severity || "")
          .toLowerCase() === "high"
    );

  if (highSeverityFailures.length >= 3) {

    metrics.push({
      metric_type:
        "failure_rate_spike",

      metric_value:
        highSeverityFailures.length,

      observation:
        "High-severity failures are increasing across the system.",

      severity:
        "high",
    });
  }

  // BLOCKED AUTOMATION RATE

  const blocked =
    approvals.filter(
      (item) =>
        String(item.status || "")
          .toLowerCase() === "blocked"
    );

  if (blocked.length >= 2) {

    metrics.push({
      metric_type:
        "automation_block_rate",

      metric_value:
        blocked.length,

      observation:
        "Automation safety systems are blocking a growing number of actions.",

      severity:
        "medium",
    });
  }

  // PREDICTION SATURATION

  const saturatedPredictions =
    predictions.filter(
      (item) =>
        Number(item.close_probability || 0) >= 95
    );

  if (saturatedPredictions.length >= 5) {

    metrics.push({
      metric_type:
        "prediction_saturation",

      metric_value:
        saturatedPredictions.length,

      observation:
        "Prediction outputs are clustering at very high confidence levels.",

      severity:
        "medium",
    });
  }

  return metrics;
}
