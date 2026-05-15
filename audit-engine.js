export async function createAuditLog({
  supabase,
  businessId,
  actorRole = "system",
  actionType,
  targetType,
  targetId = "",
  beforeState = {},
  afterState = {},
  reasoning = "",
}) {

  try {

    await supabase
      .from("audit_logs")
      .insert([
        {
          business_id:
            businessId,

          actor_role:
            actorRole,

          action_type:
            actionType,

          target_type:
            targetType,

          target_id:
            targetId,

          before_state:
            beforeState,

          after_state:
            afterState,

          reasoning,
        },
      ]);

  } catch (err) {
    console.error(
      "Audit log failure:",
      err
    );
  }
}
