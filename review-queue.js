import fs from "fs";

export function reviewApprovalQueue(path) {

  const content =
    fs.readFileSync(path, "utf8");

  const companyCount =
    (content.match(/^## /gm) || []).length;

  const failedCount =
    (content.match(/Failed/g) || []).length;

  const readyCount =
    (content.match(/Ready for review/g) || []).length;

  return `
APPROVAL QUEUE SUMMARY

Queue File:
${path}

Companies:
${companyCount}

Ready For Review:
${readyCount}

Failed:
${failedCount}

Next Recommended Action:
Review outreach drafts and approve high-quality candidates for sending.
`;
}
