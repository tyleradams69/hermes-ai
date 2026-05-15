export async function enforceSystemMode({
  supabase,
  businessId = "global",
  actionType = "unknown",
}) {

  const modeResult =
    await supabase
      .from("system_modes")
      .select("*")
      .eq("business_id", "global")
      .maybeSingle();

  const mode =
    modeResult.data?.mode || "normal";

  // DEGRADED MODE RESTRICTIONS

  if (
    mode === "degraded"
  ) {

    const blockedActions = [
      "auto_followup",
      "autonomous_send",
      "bulk_automation",
    ];

    if (
      blockedActions.includes(actionType)
    ) {

      return {
        allowed: false,

        mode,

        reason:
          `System currently in degraded mode. ${actionType} temporarily restricted.`,
      };
    }
  }

  return {
    allowed: true,

    mode,

    reason:
      "System mode permits action.",
  };
}
