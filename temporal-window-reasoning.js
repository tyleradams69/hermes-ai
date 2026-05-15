export function applyTemporalWindowReasoning({
  predictiveInsights,
  temporalWindows = [],
}) {

  const updated = {
    ...predictiveInsights,
  };

  for (const window of temporalWindows) {

    const type =
      (window.window_type || "").toLowerCase();

    const observedWindow =
      (window.observed_window || "").toLowerCase();

    const conversionRate =
      Number(window.conversion_rate || 0);

    // FAST RESPONSE CONVERSION WINDOWS

    if (
      type === "operator_response_speed" &&
      observedWindow === "under_15_minutes"
    ) {

      updated.close_probability =
        Math.min(
          100,
          updated.close_probability +
            Math.round(conversionRate / 20)
        );

      updated.reasoning +=
        ` Temporal window reasoning strengthened close probability from under-15-minute response conversion rate ${conversionRate}.`;
    }

    // SLOW RESPONSE WINDOWS

    if (
      type === "operator_response_speed" &&
      observedWindow === "over_15_minutes"
    ) {

      updated.stale_risk =
        Math.min(
          100,
          updated.stale_risk +
            Math.round((100 - conversionRate) / 18)
        );

      updated.reasoning +=
        ` Temporal window reasoning increased stale risk from slow-response conversion decay patterns.`;
    }
  }

  return updated;
}
