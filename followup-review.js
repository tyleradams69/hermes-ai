import {
  getAllOutreachState
} from "./outreach-state.js";

export function reviewFollowups() {

  const state =
    getAllOutreachState();

  const now =
    new Date();

  const due = [];

  for (const [company, data] of Object.entries(state)) {

    if (!data.nextFollowupAt) {
      continue;
    }

    const next =
      new Date(data.nextFollowupAt);

    if (next <= now) {

      due.push({
        company,
        nextFollowupAt:
          data.nextFollowupAt,
        followupCount:
          data.followupCount || 0,
        status:
          data.status
      });
    }
  }

  return {
    totalDue:
      due.length,
    due
  };
}
