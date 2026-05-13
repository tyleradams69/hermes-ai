import express from "express";
import cors from "cors";

import {
  getOutreachState,
  getAllOutreachState
} from "./outreach-state.js";

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

// GET ALL OUTREACH STATE
app.get("/api/state", (req, res) => {
  const state = getAllOutreachState();
  res.json(state);
});

// GET SINGLE COMPANY STATE
app.get("/api/state/:company", (req, res) => {
  const company = req.params.company;
  const state = getOutreachState(company);

  res.json(state || {});
});

// GET FOLLOWUP REVIEW
app.get("/api/followups", (req, res) => {
  const review = reviewFollowups();
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
