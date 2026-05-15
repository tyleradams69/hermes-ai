export function generateWorkerRecovery({
  alerts = [],
}) {

  const recoveries = [];

  for (const alert of alerts) {

    // STALLED WORKER RECOVERY

    if (
      alert.alert_type ===
      "worker_stalled"
    ) {

      recoveries.push({
        recovery_type:
          "restart_worker",

        target_worker:
          alert.worker_name,

        severity:
          "high",

        recommendation:
          `Restart worker ${alert.worker_name} immediately to restore queue processing.`,
      });
    }

    // IDLE WORKER RECOVERY

    if (
      alert.alert_type ===
      "worker_idle"
    ) {

      recoveries.push({
        recovery_type:
          "verify_queue_activity",

        target_worker:
          alert.worker_name,

        severity:
          "low",

        recommendation:
          `Verify worker ${alert.worker_name} queue connectivity and job throughput.`,
      });
    }
  }

  return recoveries;
}
