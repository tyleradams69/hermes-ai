import fs from "fs";
import path from "path";

const ACTIVITY_FILE =
  path.join(process.cwd(), "activity-log.json");

function readActivity() {

  if (!fs.existsSync(ACTIVITY_FILE)) {
    return [];
  }

  try {

    return JSON.parse(
      fs.readFileSync(ACTIVITY_FILE, "utf8")
    );

  } catch {

    return [];
  }
}

function writeActivity(events) {

  fs.writeFileSync(
    ACTIVITY_FILE,
    JSON.stringify(events, null, 2)
  );
}

function logActivity(event) {

  const events =
    readActivity();

  const entry = {
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...event
  };

  events.unshift(entry);

  writeActivity(
    events.slice(0, 250)
  );

  return entry;
}

export {
  readActivity,
  logActivity
};
