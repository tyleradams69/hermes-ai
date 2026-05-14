export function generatePredictiveInsights({
  lead,
  memory,
  strategies,
}) {

  let closeProbability = 50;
  let responseProbability = 50;
  let staleRisk = 50;
  let recoveryProbability = 50;

  const reasoning = [];

  const objections =
    (memory?.objections || "").toLowerCase();

  const relationship =
    (memory?.relationship_status || "").toLowerCase();

  const latestReply =
    (lead?.latest_reply || "").toLowerCase();

  // HIGH INTENT SIGNALS

  if (
    latestReply.includes("move quickly") ||
    latestReply.includes("pricing") ||
    latestReply.includes("schedule")
  ) {

    closeProbability += 18;
    responseProbability += 12;

    reasoning.push(
      "High-intent buying language detected."
    );
  }

  // ENGAGED RELATIONSHIP

  if (
    relationship === "engaged"
  ) {

    closeProbability += 14;

    reasoning.push(
      "Lead relationship status is engaged."
    );
  }

  // ONBOARDING OBJECTION RECOVERY

  for (const strategy of strategies || []) {

    const category =
      (strategy.category || "").toLowerCase();

    const confidence =
      strategy.adaptive_confidence ||
      strategy.confidence ||
      50;

    if (
      category.includes("onboarding") &&
      (
        objections.includes("onboarding") ||
        objections.includes("implementation")
      )
    ) {

      recoveryProbability +=
        Math.round(confidence * 0.25);

      closeProbability +=
        Math.round(confidence * 0.12);

      reasoning.push(
        "Historically recoverable onboarding objection detected."
      );
    }

    if (
      category.includes("meeting") &&
      confidence >= 65
    ) {

      closeProbability += 8;

      reasoning.push(
        "Meeting conversion strategy confidence is high."
      );
    }
  }

  // STALE RISK

  if (
    relationship === "unknown"
  ) {
    staleRisk += 18;
  }

  // CLAMP VALUES

  function clamp(v) {
    return Math.max(
      0,
      Math.min(100, v)
    );
  }

  closeProbability =
    clamp(closeProbability);

  responseProbability =
    clamp(responseProbability);

  staleRisk =
    clamp(staleRisk);

  recoveryProbability =
    clamp(recoveryProbability);

  // INTERVENTION

  let recommendedIntervention =
    "Monitor lead activity.";

  if (
    closeProbability >= 75
  ) {

    recommendedIntervention =
      "Respond immediately and prioritize direct operator engagement.";
  }

  if (
    staleRisk >= 70
  ) {

    recommendedIntervention =
      "Escalate followup cadence before lead becomes inactive.";
  }

  const insightSignature =
    JSON.stringify({
      closeProbability,
      responseProbability,
      staleRisk,
      recoveryProbability,
      recommendedIntervention,
    });

  return {
    insight_signature:
      insightSignature,

    close_probability:
      closeProbability,

    response_probability:
      responseProbability,

    stale_risk:
      staleRisk,

    recovery_probability:
      recoveryProbability,

    recommended_intervention:
      recommendedIntervention,

    reasoning:
      reasoning.join(" "),
  };
}
