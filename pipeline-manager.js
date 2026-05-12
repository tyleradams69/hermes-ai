import {
  updateOutreachState
} from "./outreach-state.js";

export function updatePipelineStage({
  company,
  replyStatus
}) {

  let pipelineStage =
    "contacted";

  switch (replyStatus) {

    case "meeting_request":
      pipelineStage =
        "meeting_requested";
      break;

    case "pricing_request":
      pipelineStage =
        "pricing_requested";
      break;

    case "interested":
      pipelineStage =
        "interested";
      break;

    case "not_interested":
      pipelineStage =
        "closed_lost";
      break;

    default:
      pipelineStage =
        "replied";
  }

  updateOutreachState({
    company,
    updates: {
      pipelineStage
    }
  });

  return {
    company,
    pipelineStage
  };
}
