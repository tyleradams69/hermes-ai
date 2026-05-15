export async function createRollbackSnapshot({
  supabase,
  businessId,
  snapshotType,
  targetId,
  snapshotData = {},
  createdByRole = "system",
}) {

  try {

    await supabase
      .from("rollback_snapshots")
      .insert([
        {
          business_id:
            businessId,

          snapshot_type:
            snapshotType,

          target_id:
            targetId,

          snapshot_data:
            snapshotData,

          created_by_role:
            createdByRole,
        },
      ]);

  } catch (err) {
    console.error(
      "Rollback snapshot failure:",
      err
    );
  }
}
