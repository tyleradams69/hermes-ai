export function evaluateSystemMode({
  alerts = [],
  recoveries = [],
}) {

  const highSeverityAlerts =
    alerts.filter(
      (item) =>
        String(item.severity || "")
          .toLowerCase() === "high"
    );

  const restartRecoveries =
    recoveries.filter(
      (item) =>
        item.recovery_type ===
        "restart_worker"
    );

  // DEGRADED MODE

  if (
    highSeverityAlerts.length >= 1 ||
    restartRecoveries.length >= 1
  ) {

    return {
      mode:
        "degraded",

      reason:
        "Infrastructure instability detected. Automation safeguards activated.",
    };
  }

  // AUTO-RECOVERY TO NORMAL MODE

  if (
    highSeverityAlerts.length === 0 &&
    restartRecoveries.length === 0
  ) {

    return {
      mode:
        "normal",

      reason:
        "Infrastructure stabilized. Autonomous systems restored.",
    };
  }

  // FALLBACK

  return {
    mode:
      "normal",

    reason:
      "Infrastructure operating normally.",
  };
}
