import fs from "fs";

const STATE_FILE = "outreach-state.json";

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

export function updateOutreachState({
  company,
  updates
}) {

  const state = loadState();

  if (!state[company]) {
    state[company] = {};
  }

  state[company] = {
    ...state[company],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveState(state);

  return state[company];
}

export function getOutreachState(company) {

  const state = loadState();

  return state[company] || null;
}

export function getAllOutreachState() {

  return loadState();
}
