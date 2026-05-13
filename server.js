import { supabase } from "./supabase-client.js";
import express from "express";
import cors from "cors";

import {
  reviewFollowups
} from "./followup-review.js";

import {
  readActivity,
  logActivity
} from "./activity-log.js";

import {
  ingestReply
} from "./reply-ingestion.js";

import {
  processInboundWebhook
} from "./inbound-webhook.js";

import {
import { scoreLead } from "./lead-intelligence.js";
  getAllLeads,
  getLeadByCompany
} from "./lead-store.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3002;

// HEALTH CHECK
app.get("/", (req, res) => {

  res.json({
    status: "Hermes API online"
  });
});

// GET ALL LEADS STATE
app.get("/api/state", async (req, res) => {

  const state =
    await getAllLeads();

  res.json(state);
});

// UPDATE LEAD PIPELINE STAGE
app.post("/api/lead/:company/stage", async (req, res) => {
  try {
    const company = req.params.company;
    const { pipeline_stage } = req.body;

    if (!company || !pipeline_stage) {
      return res.status(400).json({
        ok: false,
        error: "Company and pipeline_stage are required",
      });
    }

    
    const intelligence =
      scoreLead(newLead);

    Object.assign(
      newLead,
      intelligence
    );

const { data, error } = await supabase
      .from("leads")
      .update({
        pipeline_stage,
        updated_at: new Date().toISOString(),
      })
      .eq("company", company)
      .select();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: error.message,
      });
    }

    await supabase.from("activities").insert([
      {
        type: "pipeline_stage_updated",
        company,
        message: `Pipeline stage updated to ${pipeline_stage}`,
        payload: {
          company,
          pipeline_stage,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      lead: data?.[0] || null,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to update pipeline stage",
    });
  }
});

// MANUAL LEAD IMPORT
app.post("/api/leads/import", async (req, res) => {

  try {

    const {
      company,
      email,
      phone,
      website
    } = req.body;

    if (!company) {

      return res.status(400).json({
        ok: false,
        error: "Company required"
      });
    }

    const newLead = {

      company,

      email: email || "",

      phone: phone || "",

      website: website || "",

      status: "new",

      pipeline_stage: "new_lead",

      reply_status: "",

      latest_reply: "",

      followup_count: 0,

      created_at: new Date().toISOString(),

      updated_at: new Date().toISOString()
    };

    const { data, error } =
      await supabase
        .from("leads")
        .insert([newLead])
        .select();

    if (error) {

      console.error(error);

      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }

    await supabase
      .from("activities")
      .insert([{

        type: "lead_imported",

        company,

        message: `Lead manually imported: ${company}`,

        payload: newLead,

        created_at: new Date().toISOString()
      }]);

    res.json({
      ok: true,
      lead: data[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Import failed"
    });
  }
});

// GET SINGLE COMPANY STATE
app.get("/api/state/:company", async (req, res) => {

  const company =
    req.params.company;

  const state =
    await getLeadByCompany(company);

  res.json(state || {});
});

// GET FOLLOWUP REVIEW
app.get("/api/followups", (req, res) => {

  const review =
    reviewFollowups();

  res.json(review);
});

// GET ACTIVITY FEED
app.get("/api/activity", async (req, res) => {

  const activity =
    await readActivity();

  res.json({
    activity
  });
});

// GET COMPANY ACTIVITY
app.get("/api/activity/:company", async (req, res) => {

  const company =
    req.params.company;

  const activity =
    await readActivity();

  const filtered =
    activity.filter(
      (event) =>
        event.company === company
    );

  res.json({
    activity: filtered
  });
});

// TEST ACTIVITY EVENT
app.post("/api/test-activity", async (req, res) => {

  const event =
    await logActivity({
      type: "test_event",
      company: "Hermes System",
      message: "Activity logging operational"
    });

  res.json({
    success: true,
    event
  });
});

// TEST INBOUND REPLY
app.post("/api/replies/ingest", async (req, res) => {

  const result =
    await ingestReply(req.body);

  res.json(result);
});

// INBOUND EMAIL WEBHOOK
app.post("/api/inbound-webhook", async (req, res) => {

  const result =
    await processInboundWebhook(req.body);

  res.json(result);
});

// APPROVE LEAD
app.post("/api/lead/:company/approve", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "lead_approved",
      company,
      message:
        `${company} approved for outreach`
    });

  res.json({
    success: true,
    company,
    action: "approved",
    event
  });
});

// REJECT LEAD
app.post("/api/lead/:company/reject", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "lead_rejected",
      company,
      message:
        `${company} rejected from outbound queue`
    });

  res.json({
    success: true,
    company,
    action: "rejected",
    event
  });
});

// SEND OUTREACH
app.post("/api/lead/:company/send", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "outreach_sent",
      company,
      message:
        `Outreach send triggered for ${company}`
    });

  res.json({
    success: true,
    company,
    action: "send_triggered",
    event
  });
});

// GENERATE FOLLOW-UP
app.post("/api/lead/:company/followup", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "followup_generated",
      company,
      message:
        `Follow-up generation triggered for ${company}`
    });

  res.json({
    success: true,
    company,
    action: "followup_triggered",
    event
  });
});

// LOCAL DEV SERVER
if (process.env.VERCEL !== "1") {

  app.listen(PORT, () => {

    console.log(
      `Hermes API running on port ${PORT}`
    );
  });
}

// VERCEL EXPORT
export default app;