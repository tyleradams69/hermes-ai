import { upsertLead } from "./lead-store.js";

const leads = [
  {
    company: "Acme Roofing",
    status: "sent",
    pipelineStage: "meeting_requested",
    replyStatus: "meeting_request",
    latestReply:
      "Hey, this looks interesting. I'd be open to a quick call next week.",
    followupCount: 1,
    email: "valeraven47@gmail.com"
  },

  {
    company: "Bright Dental",
    pipelineStage: "closed_lost",
    replyStatus: "not_interested",
    latestReply:
      "Not interested at the moment, thanks."
  },

  {
    company: "Rapid HVAC",
    pipelineStage: "pricing_requested",
    replyStatus: "pricing_request",
    latestReply:
      "Can you send pricing information?"
  }
];

for (const lead of leads) {

  await upsertLead(lead);

  console.log(
    `Seeded ${lead.company}`
  );
}
