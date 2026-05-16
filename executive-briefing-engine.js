export function generateExecutiveBriefing({
  business = null,
  leads = [],
  approvals = [],
  queue = [],
  recommendations = [],
  workers = [],
  mode = null,
}) {

  const hotLeads =
    leads.filter(
      (l) =>
        l.lead_temperature === "hot"
    ).length;

  const blockedApprovals =
    approvals.filter(
      (a) =>
        a.status === "blocked"
    ).length;

  const pendingQueue =
    queue.filter(
      (q) =>
        q.status === "pending"
    ).length;

  const onlineWorkers =
    workers.filter(
      (w) =>
        w.status === "online"
    ).length;

  const risks = [];

  if (
    mode?.mode === "degraded"
  ) {

    risks.push(
      "Infrastructure safeguards are currently active."
    );
  }

  if (blockedApprovals >= 2) {

    risks.push(
      "Multiple blocked automations detected."
    );
  }

  if (onlineWorkers === 0) {

    risks.push(
      "No online workers detected."
    );
  }

  const summary =
    `Hermes analyzed current operational activity for ${business?.name || "this business"}. The system detected ${hotLeads} hot lead(s), ${blockedApprovals} blocked automation(s), and ${pendingQueue} pending queue job(s). ${onlineWorkers} worker(s) are currently online.`;

  return {
    title:
      `${business?.name || "Business"} Operational Briefing`,

    summary,

    risks,

    recommendations:
      recommendations.map(
        (r) => r.title
      ),

    metrics: {
      hot_leads:
        hotLeads,

      blocked_approvals:
        blockedApprovals,

      pending_queue:
        pendingQueue,

      online_workers:
        onlineWorkers,

      system_mode:
        mode?.mode || "unknown",
    },
  };
}
