export function applyStrategyAdjustments({
  score,
  memory,
  strategies,
}) {

  let adjustedScore = score;

  const objections =
    (memory?.objections || "").toLowerCase();

  for (const strategy of strategies || []) {

    const category =
      (strategy.category || "").toLowerCase();

    const confidence =
      strategy.adaptive_confidence ||
      strategy.confidence ||
      50;

    // ONBOARDING OBJECTION RECOVERY

    if (
      category.includes("onboarding") &&
      (
        objections.includes("onboarding") ||
        objections.includes("implementation")
      )
    ) {

      // historically recoverable objection

      if (confidence >= 65) {
        adjustedScore += 12;
      }

      if (confidence >= 85) {
        adjustedScore += 8;
      }
    }

    // HIGH-CONVERSION MEETING PATTERN

    if (
      category.includes("meeting") &&
      confidence >= 70
    ) {
      adjustedScore += 6;
    }
  }

  adjustedScore =
    Math.max(
      0,
      Math.min(100, adjustedScore)
    );

  return adjustedScore;
}
