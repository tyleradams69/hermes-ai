export function deriveOutcomeStrategies({
  outcome,
}) {

  const strategies = [];

  const notes =
    (outcome?.notes || "").toLowerCase();

  const result =
    (outcome?.outcome || "").toLowerCase();

  const success =
    Boolean(outcome?.success);

  // ONBOARDING SUCCESS

  if (
    success &&
    (
      notes.includes("onboarding") ||
      notes.includes("implementation")
    )
  ) {

    strategies.push({
      category:
        "successful_onboarding_reassurance",

      pattern:
        "Addressing onboarding and implementation concerns improves conversion likelihood.",

      observation:
        "Leads respond positively when onboarding support is clarified directly.",

      recommendation:
        "Proactively explain implementation guidance and onboarding assistance during high-intent conversations.",

      confidence: 92,

      source_company:
        outcome.company || "",

      source_event:
        result,
    });
  }

  // MEETING BOOKED

  if (
    success &&
    result.includes("meeting")
  ) {

    strategies.push({
      category:
        "meeting_conversion",

      pattern:
        "High-intent leads convert more effectively when moved quickly into scheduled calls.",

      observation:
        "Fast escalation into meetings improves operational momentum.",

      recommendation:
        "Prioritize rapid scheduling for highly engaged leads.",

      confidence: 90,

      source_company:
        outcome.company || "",

      source_event:
        result,
    });
  }

  return strategies;
}
