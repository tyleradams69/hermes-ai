export function scoreLead(lead) {

  let score = 50;

  const reasons = [];

  const reply =
    (lead.latest_reply || "").toLowerCase();

  const followups =
    lead.followup_count || 0;

  const pipeline =
    lead.pipeline_stage || "";

  // POSITIVE SIGNALS

  if (
    reply.includes("price") ||
    reply.includes("pricing")
  ) {
    score += 18;

    reasons.push(
      "Pricing intent detected"
    );
  }

  if (
    reply.includes("call") ||
    reply.includes("meeting")
  ) {
    score += 22;

    reasons.push(
      "Meeting intent detected"
    );
  }

  if (
    reply.includes("interested")
  ) {
    score += 14;

    reasons.push(
      "Positive reply sentiment"
    );
  }

  if (
    pipeline === "meeting_requested"
  ) {
    score += 30;

    reasons.push(
      "Pipeline indicates meeting request"
    );
  }

  if (
    pipeline === "pricing_requested"
  ) {
    score += 20;

    reasons.push(
      "Pipeline indicates pricing request"
    );
  }

  // NEGATIVE SIGNALS

  if (
    followups >= 3
  ) {
    score -= 12;

    reasons.push(
      "Multiple followups without conversion"
    );
  }

  if (
    pipeline === "closed_lost"
  ) {
    score -= 40;

    reasons.push(
      "Lead marked closed lost"
    );
  }

  // CLAMP

  score =
    Math.max(
      0,
      Math.min(100, score)
    );

  // TEMPERATURE

  let temperature = "warm";

  if (score >= 80) {
    temperature = "hot";
  } else if (score <= 35) {
    temperature = "cold";
  }

  // PRIORITY

  let priority = "normal";

  if (score >= 85) {
    priority = "critical";
  } else if (score >= 70) {
    priority = "high";
  } else if (score <= 30) {
    priority = "low";
  }

  return {
    lead_score: score,
    lead_temperature: temperature,
    lead_priority: priority,
    ai_reasoning:
      reasons.join(". "),
  };
}
