export function evaluateAutomationSafety({
  confidence = 0,
  role = "viewer",
  actionType = "unknown",
}) {

  // HARD BLOCKS

  if (role === "viewer") {
    return {
      allowed: false,
      reason:
        "Viewer role cannot execute automation actions.",
    };
  }

  // CONFIDENCE THRESHOLDS

  const minimumConfidenceByAction = {
    send_email: 75,
    escalate_operator: 60,
    auto_followup: 80,
    update_pipeline: 50,
  };

  const required =
    minimumConfidenceByAction[actionType] || 70;

  if (confidence < required) {
    return {
      allowed: false,
      reason:
        `Confidence ${confidence} below required threshold ${required} for ${actionType}.`,
    };
  }

  return {
    allowed: true,
    reason:
      "Automation safety checks passed.",
  };
}
