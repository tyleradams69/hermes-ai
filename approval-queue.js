import fs from "fs";

export function buildApprovalQueue(resultsPath = "batch-results.json") {
  const raw = fs.readFileSync(resultsPath, "utf8");
  const results = JSON.parse(raw);

  let queue = `# Outreach Approval Queue\n\n`;

  for (const item of results) {
    queue += `---\n\n`;
    queue += `## ${item.company}\n\n`;
    queue += `Status: ${item.success ? "Ready for review" : "Failed"}\n\n`;

    if (!item.success) {
      queue += `Error: ${item.error}\n\n`;
      continue;
    }

    queue += `Audit file: ${item.auditFile}\n`;
    queue += `Outreach file: ${item.outreachFile}\n\n`;

    if (fs.existsSync(item.outreachFile)) {
      const outreach = fs.readFileSync(item.outreachFile, "utf8");
      queue += `### Outreach Draft\n\n${outreach}\n\n`;
    }
  }

  fs.writeFileSync("outreach-approval-queue.md", queue);

  return "outreach-approval-queue.md";
}
