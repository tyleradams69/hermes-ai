export function applyTemporalReasoning({
  predictiveInsights,
  temporalPatterns = [],
}) {

  const updated = {
    ...predictiveInsights,
  };

  for (const pattern of temporalPatterns) {

    const type =
      (pattern.pattern_type || "").toLowerCase();

    const impact =
      Number(pattern.impact_score || 0);

    // FAILURE DECAY

    if (
      type === "failure_decay_signal"
    ) {

      updated.stale_risk =
        Math.min(
          100,
          updated.stale_risk +
            Math.round(impact / 12)
        );

      updated.reasoning +=
        ` Temporal reasoning increased stale risk from decay-pattern impact score ${impact}.`;
    }

    // FAST RESPONSE WINDOWS

    if (
      type === "fast_response_window"
    ) {

      updated.close_probability =
        Math.min(
          100,
          updated.close_probability +
            Math.round(impact / 18)
        );

      updated.reasoning +=
        ` Temporal reasoning strengthened close probability from fast-response temporal pattern score ${impact}.`;
    }
  }

  return updated;
}
