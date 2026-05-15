export function generateGlobalPatterns({
  strategies = [],
}) {

  const patterns = [];

  const onboardingStrategies =
    strategies.filter((item) =>
      String(item.category || "")
        .toLowerCase()
        .includes("onboarding")
    );

  if (onboardingStrategies.length >= 2) {

    const avgConfidence =
      onboardingStrategies.reduce(
        (sum, item) =>
          sum + Number(item.adaptive_confidence || item.confidence || 50),
        0
      ) / onboardingStrategies.length;

    patterns.push({
      industry:
        "general_b2b",

      pattern_type:
        "onboarding_reassurance",

      observation:
        "Businesses consistently respond positively to proactive onboarding reassurance during high-intent stages.",

      recommendation:
        "Prioritize implementation reassurance and hands-on onboarding support during conversion windows.",

      confidence:
        Math.round(avgConfidence),

      supporting_businesses:
        onboardingStrategies.length,
    });
  }

  const urgencyStrategies =
    strategies.filter((item) =>
      String(item.category || "")
        .toLowerCase()
        .includes("urgency")
    );

  if (urgencyStrategies.length >= 1) {

    const avgConfidence =
      urgencyStrategies.reduce(
        (sum, item) =>
          sum + Number(item.adaptive_confidence || item.confidence || 50),
        0
      ) / urgencyStrategies.length;

    patterns.push({
      industry:
        "general_b2b",

      pattern_type:
        "rapid_response_conversion",

      observation:
        "Rapid operator engagement frequently preserves conversion momentum in high-intent interactions.",

      recommendation:
        "Escalate high-intent leads into immediate operator response windows whenever possible.",

      confidence:
        Math.round(avgConfidence),

      supporting_businesses:
        urgencyStrategies.length,
    });
  }

  return patterns;
}
