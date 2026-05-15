export function detectWorkerHealth({
  workers = [],
}) {

  const alerts = [];

  const now =
    Date.now();

  for (const worker of workers) {

    const heartbeat =
      new Date(
        worker.last_heartbeat
      ).getTime();

    const secondsSince =
      (now - heartbeat) / 1000;

    // STALLED WORKER

    if (secondsSince > 30) {

      alerts.push({
        worker_name:
          worker.worker_name,

        alert_type:
          "worker_stalled",

        severity:
          "high",

        observation:
          `Worker heartbeat missing for ${Math.round(secondsSince)} seconds.`,
      });
    }

    // LOW THROUGHPUT

    if (
      Number(worker.processed_jobs || 0) === 0
    ) {

      alerts.push({
        worker_name:
          worker.worker_name,

        alert_type:
          "worker_idle",

        severity:
          "low",

        observation:
          "Worker has not processed any jobs yet.",
      });
    }
  }

  return alerts;
}
