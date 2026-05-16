export function generateProactiveRecommendations({
  business = null,
  leads = [],
  approvals = [],
  queue = [],
  mode = null,
  workers = [],
}) {

  const recommendations = [];

  // DEGRADED MODE

  if (
    mode?.mode === "degraded"
  ) {

    recommendations.push({
      recommendation_type:
        "system_stability",

      priority:
        "high",

      title:
        "Infrastructure safeguards active",

      recommendation:
        "Hermes is currently operating in degraded mode. Review worker health and operational alerts before scaling automation.",
    });
  }

  // BLOCKED APPROVALS

  const blocked =
    approvals.filter(
      (a) =>
        a.status === "blocked"
    );

  if (blocked.length >= 2) {

    recommendations.push({
      recommendation_type:
        "blocked_automation",

      priority:
        "medium",

      title:
        "Multiple blocked automations detected",

      recommendation:
        `There are currently ${blocked.length} blocked approvals. Review safety restrictions and operational conditions.`,
    });
  }

  // HOT LEADS

  const hotLeads =
    leads.filter(
      (l) =>
        l.lead_temperature === "hot"
    );

  if (hotLeads.length >= 1) {

    recommendations.push({
      recommendation_type:
        "hot_leads",

      priority:
        "high",

      title:
        "High-intent leads require rapid engagement",

      recommendation:
        `${hotLeads.length} hot lead(s) detected. Rapid operator response is recommended to maximize conversion probability.`,
    });
  }

  // LAW FIRM SPECIFIC

  if (
    business?.industry ===
    "law_firm"
  ) {

    recommendations.push({
      recommendation_type:
        "law_firm_intake",

      priority:
        "medium",

      title:
        "Law firm intake responsiveness",

      recommendation:
        "Consultation conversion rates improve significantly when intake responses occur rapidly after inquiry submission.",
    });
  }

  return recommendations;
}
