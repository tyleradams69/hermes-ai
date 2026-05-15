export async function recordSystemFailure({
  supabase,
  businessId = "global",
  failureType,
  route,
  errorMessage,
  severity = "medium",
  metadata = {},
}) {

  try {

    await supabase
      .from("system_failures")
      .insert([
        {
          business_id:
            businessId,

          failure_type:
            failureType,

          route,

          error_message:
            errorMessage,

          severity,

          metadata,
        },
      ]);

  } catch (err) {
    console.error(
      "Monitoring failure logging error:",
      err
    );
  }
}
