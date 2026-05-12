import {
  reviewFollowups
} from "./followup-review.js";

import {
  getOutreachState,
  updateOutreachState
} from "./outreach-state.js";

export async function processDueFollowups({
  client,
  generateFollowUp
}) {

  const review =
    reviewFollowups();

  const processed = [];

  for (const item of review.due) {

    try {

      const result =
        await generateFollowUp({
          client,
          company: item.company
        });

      updateOutreachState({
        company: item.company,
        updates: {
          lastFollowupGeneratedAt:
            new Date().toISOString(),
          latestFollowupFile:
            result.filename
        }
      });

      processed.push({
        company: item.company,
        success: true,
        followupFile:
          result.filename
      });

    } catch (err) {

      processed.push({
        company: item.company,
        success: false,
        error: err.message
      });
    }
  }

  return processed;
}
