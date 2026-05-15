import "dotenv/config";
import { supabase } from "./supabase-client.js";
import { sendFollowupEmail } from "./resend-sender.js";

async function processJobs() {

  const now =
    new Date().toISOString();

  const { data: jobs, error } =
    await supabase
      .from("job_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(10);

  if (error) {
    console.error(
      "Queue fetch error:",
      error
    );

    return;
  }

  for (const job of jobs || []) {

    try {

      await supabase
        .from("job_queue")
        .update({
          status: "processing",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", job.id);

      // FOLLOWUP EMAIL JOBS

      if (
        job.job_type ===
        "send_followup_email"
      ) {

        await sendFollowupEmail({
          to:
            job.payload?.to,

          subject:
            job.payload?.subject,

          body:
            job.payload?.body,
        });
      }

      await supabase
        .from("job_queue")
        .update({
          status: "completed",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", job.id);

      processedJobs += 1;

      console.log(
        `Processed job ${job.id}`
      );

    } catch (err) {

      console.error(
        `Job failure ${job.id}:`,
        err
      );

      const attempts =
        Number(job.attempts || 0) + 1;

      const failed =
        attempts >=
        Number(job.max_attempts || 3);

      if (failed) {
        await supabase
          .from("dead_letter_jobs")
          .insert([
            {
              original_job_id:
                job.id,

              business_id:
                job.business_id,

              job_type:
                job.job_type,

              payload:
                job.payload || {},

              attempts,

              last_error:
                String(err?.message || err),

              metadata: {
                max_attempts:
                  job.max_attempts,
              },
            },
          ]);
      }

      await supabase
        .from("job_queue")
        .update({
          status:
            failed
              ? "failed"
              : "pending",

          attempts,

          last_error:
            String(err?.message || err),

          updated_at:
            new Date().toISOString(),

          scheduled_for:
            new Date(
              Date.now() + 60000
            ).toISOString(),
        })
        .eq("id", job.id);
    }
  }
}

const WORKER_NAME =
  process.env.WORKER_NAME ||
  "local-queue-worker";

let processedJobs =
  0;

async function heartbeat() {
  await supabase
    .from("worker_heartbeats")
    .upsert(
      {
        worker_name:
          WORKER_NAME,

        worker_type:
          "queue_worker",

        status:
          "online",

        processed_jobs:
          processedJobs,

        last_heartbeat:
          new Date().toISOString(),

        metadata: {
          pid:
            process.pid,
        },
      },
      {
        onConflict:
          "worker_name",
      }
    );
}

console.log(
  "Hermes queue worker online"
);

setInterval(
  async () => {
    await processJobs();
    await heartbeat();
  },
  5000
);

heartbeat();
