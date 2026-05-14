export function applyOperationalOptimizations({
  predictiveInsights,
  correlations,
  weights = [],
}) {

  const optimized =
    {
      ...predictiveInsights,
    };

  const weightMap =
    Object.fromEntries(
      (weights || []).map((weight) => [
        weight.weight_key,
        Number(weight.weight_value || 1),
      ])
    );

  const onboardingWeight =
    weightMap.onboarding_reassurance_weight || 1;

  const fastResponseWeight =
    weightMap.fast_response_weight || 1;

  for (const correlation of correlations || []) {

    const type =
      (correlation.correlation_type || "").toLowerCase();

    const confidence =
      correlation.confidence || 50;

    // FAST OPERATOR RESPONSE

    if (
      type === "fast_operator_response" &&
      confidence >= 60
    ) {

      optimized.close_probability =
        Math.min(
          100,
          optimized.close_probability +
            Math.round(6 * fastResponseWeight)
        );

      optimized.recommended_intervention =
        "Immediate operator engagement strongly recommended based on successful rapid-response patterns.";
    }

    // ONBOARDING REASSURANCE SUCCESS

    if (
      type === "onboarding_reassurance_success" &&
      confidence >= 80
    ) {

      optimized.recovery_probability =
        Math.min(
          100,
          optimized.recovery_probability +
            Math.round(10 * onboardingWeight)
        );

      optimized.reasoning +=
        ` Operational optimization engine increased onboarding recovery confidence using runtime onboarding weight ${onboardingWeight}.`;
    }
  }

  return optimized;
}
