import {
  updateOutreachState,
  getOutreachState
} from "./outreach-state.js";

export function scheduleFollowup({
  company,
  days = 3
}) {

  const current =
    getOutreachState(company);

  const now =
    new Date();

  const next =
    new Date(
      now.getTime() +
      days * 24 * 60 * 60 * 1000
    );

  const followupCount =
    (current?.followupCount || 0) + 1;

  updateOutreachState({
    company,
    updates: {
      nextFollowupAt:
        next.toISOString(),
      followupCount
    }
  });

  return `
FOLLOW-UP SCHEDULED

Company:
${company}

Next Follow-Up:
${next.toISOString()}

Follow-Up Count:
${followupCount}
`;
}
