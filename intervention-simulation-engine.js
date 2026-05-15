export function generateInterventionSimulations({
  predictiveInsights,
  associations = [],
  temporalPatterns = [],
  temporalWindows = [],
}) {
  const simulations = [];

  const onboardingAssociation =
    associations.find(
      (item) =>
        String(item.source_memory || "").includes("onboarding") &&
        String(item.target_memory || "").includes("onboarding")
    );

  if (onboardingAssociation) {
    const strength =
      Number(onboardingAssociation.association_strength || 50);

    simulations.push({
      simulation_type: "send_onboarding_reassurance",
      predicted_effect: "increase_recovery_probability",
      probability_delta: Math.round(strength / 10),
      confidence: Math.min(95, strength),
      observation:
        "Sending onboarding reassurance is likely to improve recovery probability based on reinforced memory associations.",
    });
  }

  const urgencyAssociation =
    associations.find(
      (item) =>
        String(item.source_memory || "").includes("urgency") &&
        String(item.target_memory || "").includes("urgency")
    );

  if (urgencyAssociation) {
    const strength =
      Number(urgencyAssociation.association_strength || 50);

    simulations.push({
      simulation_type: "immediate_operator_escalation",
      predicted_effect: "increase_close_probability",
      probability_delta: Math.round(strength / 12),
      confidence: Math.min(95, strength),
      observation:
        "Immediate operator escalation is likely to improve close probability based on urgency-response associations.",
    });
  }

  const decayPattern =
    temporalPatterns.find(
      (item) => item.pattern_type === "failure_decay_signal"
    );

  if (decayPattern) {
    simulations.push({
      simulation_type: "delay_followup",
      predicted_effect: "increase_stale_risk",
      probability_delta: Math.round(Number(decayPattern.impact_score || 0) / 8),
      confidence: Math.min(90, Number(decayPattern.impact_score || 50)),
      observation:
        "Delaying follow-up is likely to increase stale risk based on temporal decay patterns.",
    });
  }

  const fastWindow =
    temporalWindows.find(
      (item) =>
        item.window_type === "operator_response_speed" &&
        item.observed_window === "under_15_minutes"
    );

  if (fastWindow) {
    simulations.push({
      simulation_type: "respond_under_15_minutes",
      predicted_effect: "preserve_conversion_momentum",
      probability_delta: Math.round(Number(fastWindow.conversion_rate || 0) / 15),
      confidence: Math.min(95, Number(fastWindow.conversion_rate || 50)),
      observation:
        "Responding under 15 minutes is likely to preserve conversion momentum based on temporal response-window learning.",
    });
  }

  return simulations;
}
