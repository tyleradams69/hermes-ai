export function applyGlobalPatternReasoning({
  predictiveInsights,
  globalPatterns = [],
}) {
  const updated = {
    ...predictiveInsights,
  };

  for (const pattern of globalPatterns) {
    const type =
      String(pattern.pattern_type || "").toLowerCase();

    const confidence =
      Number(pattern.confidence || 0);

    if (type.includes("onboarding")) {
      updated.recovery_probability =
        Math.min(
          100,
          updated.recovery_probability + Math.round(confidence / 22)
        );

      updated.reasoning +=
        ` Global intelligence strengthened onboarding recovery confidence from ${pattern.industry} pattern confidence ${confidence}.`;
    }

    if (type.includes("rapid_response")) {
      updated.close_probability =
        Math.min(
          100,
          updated.close_probability + Math.round(confidence / 26)
        );

      updated.reasoning +=
        ` Global intelligence strengthened close probability from rapid-response pattern confidence ${confidence}.`;
    }
  }

  return updated;
}
