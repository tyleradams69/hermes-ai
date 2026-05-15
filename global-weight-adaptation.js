export function generateGlobalWeightAdjustments({
  patterns = [],
}) {

  const adjustments = [];

  for (const pattern of patterns) {

    const type =
      String(pattern.pattern_type || "").toLowerCase();

    const confidence =
      Number(pattern.confidence || 0);

    // RAPID RESPONSE GLOBAL ADAPTATION

    if (
      type.includes("rapid_response")
    ) {

      adjustments.push({
        weight_key:
          "fast_response_weight",

        delta:
          Number((confidence / 1000).toFixed(2)),

        reasoning:
          "Global rapid-response intelligence increased fast-response optimization weight.",
      });
    }

    // ONBOARDING GLOBAL ADAPTATION

    if (
      type.includes("onboarding")
    ) {

      adjustments.push({
        weight_key:
          "onboarding_reassurance_weight",

        delta:
          Number((confidence / 900).toFixed(2)),

        reasoning:
          "Global onboarding intelligence increased onboarding reassurance optimization weight.",
      });
    }
  }

  return adjustments;
}
