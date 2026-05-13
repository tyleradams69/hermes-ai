import {
  logActivity
} from "./activity-log.js";

import {
  updatePipelineStage
} from "./pipeline-manager.js";

function ingestReply(payload) {
  const company = payload.company || "Unknown";
  const reply = payload.reply || "";

  let classification = "unclear";

  const lower = reply.toLowerCase();

  if (
    lower.includes("meeting") ||
    lower.includes("call") ||
    lower.includes("schedule")
  ) {
    classification = "meeting_request";
  }

  else if (
    lower.includes("price") ||
    lower.includes("pricing")
  ) {
    classification = "pricing_request";
  }

  else if (
    lower.includes("interested") ||
    lower.includes("sounds good")
  ) {
    classification = "interested";
  }

  else if (
    lower.includes("not interested")
  ) {
    classification = "not_interested";
  }

  const updatedState =
    updatePipelineStage(
      company,
      classification
    );

  logActivity({
    type: "reply_received",
    company,
    message: `Reply classified as ${classification}`
  });

  logActivity({
    type: "pipeline_updated",
    company,
    message: `${company} moved to ${updatedState.pipelineStage}`
  });

  return {
    success: true,
    company,
    classification,
    pipelineStage: updatedState.pipelineStage,
    reply
  };
}

export {
  ingestReply
};
