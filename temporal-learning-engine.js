export function generateTemporalPatterns({
  outcomes = [],
  operatorActions = [],
}) {
  const patterns = [];

  const successfulOutcomes =
    outcomes.filter((item) => item.success === true);

  const failedOutcomes =
    outcomes.filter((item) => item.success === false);

  const fastActions =
    operatorActions.filter(
      (item) =>
        Number(item.response_latency_seconds || 999999) <= 300
    );

  if (fastActions.length >= 2 && successfulOutcomes.length >= 1) {
    patterns.push({
      pattern_type: "fast_response_window",
      observed_window: "under_5_minutes",
      observation:
        "Fast operator responses are appearing alongside successful outcomes.",
      impact_score: 80,
      supporting_events:
        fastActions.length + successfulOutcomes.length,
    });
  }

  if (failedOutcomes.length >= 1) {
    patterns.push({
      pattern_type: "failure_decay_signal",
      observed_window: "post_delay",
      observation:
        "Failed outcomes indicate delayed or unresolved concerns may increase conversion decay.",
      impact_score: 65,
      supporting_events:
        failedOutcomes.length,
    });
  }

  return patterns;
}
