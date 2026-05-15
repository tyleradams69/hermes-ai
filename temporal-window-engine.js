export function generateTemporalWindows({
  outcomes = [],
  operatorActions = [],
}) {
  const windows = [];

  const successfulOutcomes =
    outcomes.filter((item) => item.success === true);

  const fastActions =
    operatorActions.filter(
      (item) =>
        Number(item.response_latency_seconds || 999999) <= 900
    );

  const slowActions =
    operatorActions.filter(
      (item) =>
        Number(item.response_latency_seconds || 0) > 900
    );

  if (fastActions.length > 0) {
    windows.push({
      window_type: "operator_response_speed",
      observed_window: "under_15_minutes",
      conversion_rate:
        Math.min(
          100,
          Math.round(
            (successfulOutcomes.length / Math.max(1, fastActions.length)) * 100
          )
        ),
      supporting_events:
        fastActions.length,
      observation:
        "Operator responses under 15 minutes appear to preserve conversion momentum.",
    });
  }

  if (slowActions.length > 0) {
    windows.push({
      window_type: "operator_response_speed",
      observed_window: "over_15_minutes",
      conversion_rate:
        Math.min(
          100,
          Math.round(
            (successfulOutcomes.length / Math.max(1, slowActions.length)) * 100
          )
        ),
      supporting_events:
        slowActions.length,
      observation:
        "Slower responses may increase risk of conversion decay.",
    });
  }

  return windows;
}
