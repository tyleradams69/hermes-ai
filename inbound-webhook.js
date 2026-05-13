import {
  ingestReply
} from "./reply-ingestion.js";

function processInboundWebhook(payload) {
  const from = payload.from || "Unknown";
  const subject = payload.subject || "";
  const text = payload.text || "";

  const company =
    subject
      .replace("Re:", "")
      .trim() || from;

  return ingestReply({
    company,
    reply: text
  });
}

export {
  processInboundWebhook
};
