export function extractStrategyMemory({
  classification,
  memory,
  lead,
}) {

  const strategies = [];

  const objections =
    (memory?.objections || "").toLowerCase();

  const intent =
    classification?.intent || "";

  const urgency =
    classification?.urgency || "";

  // ONBOARDING PATTERN

  if (
    objections.includes("onboarding") ||
    objections.includes("implementation")
  ) {

    strategies.push({
      category: "onboarding_objection",

      pattern:
        "Businesses frequently hesitate due to onboarding and implementation concerns.",

      observation:
        "Direct reassurance about implementation support improves engagement.",

      recommendation:
        "Address onboarding speed and hands-on implementation support proactively in followups.",

      confidence: 82,

      source_company:
        lead?.company || "",

      source_event:
        intent,
    });
  }

  // HIGH URGENCY BUYER

  if (
    urgency === "high"
  ) {

    strategies.push({
      category: "high_urgency_buyers",

      pattern:
        "High urgency buyers respond positively to decisive operational followups.",

      observation:
        "Fast response cadence increases conversion probability.",

      recommendation:
        "Escalate followup speed and prioritize rapid operator response.",

      confidence: 88,

      source_company:
        lead?.company || "",

      source_event:
        intent,
    });
  }

  // PRICING SIGNAL

  if (
    intent === "pricing_request"
  ) {

    strategies.push({
      category: "pricing_interest",

      pattern:
        "Pricing requests strongly correlate with high conversion intent.",

      observation:
        "Leads requesting pricing should be prioritized aggressively.",

      recommendation:
        "Respond rapidly with pricing clarity and scheduling options.",

      confidence: 90,

      source_company:
        lead?.company || "",

      source_event:
        intent,
    });
  }

  return strategies;
}
