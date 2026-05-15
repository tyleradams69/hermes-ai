export function calibratePredictiveInsights({
  predictiveInsights,
  predictionOutcomes = [],
}) {
  const calibrated = {
    ...predictiveInsights,
  };

  const successfulOutcomes =
    predictionOutcomes.filter((item) => item.success === true);

  const failedOutcomes =
    predictionOutcomes.filter((item) => item.success === false);

  const onboardingSuccesses =
    successfulOutcomes.filter((item) =>
      JSON.stringify(item.contributing_factors || {})
        .toLowerCase()
        .includes("onboarding")
    );

  const fastResponseSuccesses =
    successfulOutcomes.filter((item) =>
      JSON.stringify(item.contributing_factors || {})
        .toLowerCase()
        .includes("fast_response")
    );

  if (onboardingSuccesses.length >= 1) {

    const onboardingStrength =
      onboardingSuccesses.reduce(
        (sum, item) =>
          sum + Number(item.predicted_value || 50),
        0
      ) / onboardingSuccesses.length;

    calibrated.recovery_probability =
      Math.min(
        100,
        calibrated.recovery_probability +
          Math.round(
            onboardingSuccesses.length *
            (onboardingStrength / 25)
          )
      );

    calibrated.reasoning +=
      ` Prediction calibration increased recovery probability from ${onboardingSuccesses.length} successful onboarding outcome(s).`;
  }

  if (fastResponseSuccesses.length >= 1) {

    const fastResponseStrength =
      fastResponseSuccesses.reduce(
        (sum, item) =>
          sum + Number(item.predicted_value || 50),
        0
      ) / fastResponseSuccesses.length;

    calibrated.close_probability =
      Math.min(
        100,
        calibrated.close_probability +
          Math.round(
            fastResponseSuccesses.length *
            (fastResponseStrength / 35)
          )
      );

    calibrated.reasoning +=
      ` Prediction calibration increased close probability from ${fastResponseSuccesses.length} fast-response success outcome(s).`;
  }

  if (failedOutcomes.length >= 1) {

    const failureSeverity =
      failedOutcomes.reduce(
        (sum, item) =>
          sum + (100 - Number(item.predicted_value || 50)),
        0
      ) / failedOutcomes.length;

    calibrated.stale_risk =
      Math.min(
        100,
        calibrated.stale_risk +
          Math.round(
            failedOutcomes.length *
            (failureSeverity / 30)
          )
      );

    calibrated.reasoning +=
      ` Prediction calibration increased stale risk from ${failedOutcomes.length} failed historical outcome(s).`;
  }

  return calibrated;
}
