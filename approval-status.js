import fs from "fs";

const STATUS_FILE = "approval-status.json";

function loadStatus() {
  if (!fs.existsSync(STATUS_FILE)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
}

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

export function approveOutreach(company) {
  const status = loadStatus();

  status[company] = {
    status: "approved",
    updatedAt: new Date().toISOString()
  };

  saveStatus(status);

  return `${company} approved for sending.`;
}

export function rejectOutreach(company) {
  const status = loadStatus();

  status[company] = {
    status: "rejected",
    updatedAt: new Date().toISOString()
  };

  saveStatus(status);

  return `${company} rejected.`;
}
