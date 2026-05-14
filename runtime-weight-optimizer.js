export function generateWeightAdjustments({
  correlations,
}) {

  const adjustments = [];

  for (const correlation of correlations || []) {

    const type =
      (correlation.correlation_type || "").toLowerCase();

    const confidence =
      correlation.confidence || 50;

    // FAST RESPONSE CORRELATION

    if (
      type === "fast_operator_response"
    ) {

      adjustments.push({
        weight_key:
          "fast_response_weight",

        delta:
          confidence >= 80
            ? 0.25
            : confidence >= 60
              ? 0.12
              : 0.04,

        reasoning:
          "Fast operator responses are correlating with stronger workflow outcomes.",
      });
    }

    // ONBOARDING SUCCESS CORRELATION

    if (
      type === "onboarding_reassurance_success"
    ) {

      adjustments.push({
        weight_key:
          "onboarding_reassurance_weight",

        delta:
          confidence >= 85
            ? 0.30
            : confidence >= 70
              ? 0.18
              : 0.08,

        reasoning:
          "Onboarding reassurance is strongly connected to successful outcomes.",
      });
    }
  }

  return adjustments;
}
