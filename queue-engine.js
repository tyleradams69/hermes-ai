export async function enqueueJob({
  supabase,
  businessId,
  jobType,
  payload = {},
  scheduledFor = null,
}) {

  const { data, error } = await supabase
    .from("job_queue")
    .insert([
      {
        business_id:
          businessId,

        job_type:
          jobType,

        payload,

        scheduled_for:
          scheduledFor ||
          new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
