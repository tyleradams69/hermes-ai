export function generateInterventionChains({
  simulations = [],
}) {
  const byType =
    Object.fromEntries(
      simulations.map((item) => [
        item.simulation_type,
        item,
      ])
    );

  const chains = [];

  const onboarding =
    byType.send_onboarding_reassurance;

  const escalation =
    byType.immediate_operator_escalation;

  const fastResponse =
    byType.respond_under_15_minutes;

  if (onboarding && escalation && fastResponse) {
    chains.push({
      chain_name:
        "high_intent_onboarding_recovery_sequence",

      ordered_actions: [
        "send_onboarding_reassurance",
        "immediate_operator_escalation",
        "respond_under_15_minutes",
      ],

      cumulative_probability_delta:
        Number(onboarding.probability_delta || 0) +
        Number(escalation.probability_delta || 0) +
        Number(fastResponse.probability_delta || 0),

      cumulative_risk_reduction:
        12,

      confidence:
        Math.round(
          (
            Number(onboarding.confidence || 0) +
            Number(escalation.confidence || 0) +
            Number(fastResponse.confidence || 0)
          ) / 3
        ),

      observation:
        "Combining onboarding reassurance, immediate escalation, and rapid response creates the strongest projected recovery path for high-intent onboarding concerns.",
    });
  }

  return chains;
}
