import fs from "fs";

const STATE_FILE = "./outreach-state.json";

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync(STATE_FILE, "utf8")
  );
}

function saveState(state) {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(state, null, 2)
  );
}

function updatePipelineStage(company, classification) {
  const state = loadState();

  if (!state[company]) {
    state[company] = {};
  }

  let pipelineStage = "replied";

  if (classification === "meeting_request") {
    pipelineStage = "meeting_requested";
  }

  else if (classification === "pricing_request") {
    pipelineStage = "pricing_requested";
  }

  else if (classification === "not_interested") {
    pipelineStage = "closed_lost";
  }

  else if (classification === "interested") {
    pipelineStage = "interested";
  }

  state[company].pipelineStage = pipelineStage;
  state[company].replyStatus = classification;
  state[company].latestReplyAt = new Date().toISOString();
  state[company].updatedAt = new Date().toISOString();

  saveState(state);

  return state[company];
}

export {
  updatePipelineStage
};
