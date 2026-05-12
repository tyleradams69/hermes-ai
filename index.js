import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "readline";
import { MemoryClient } from "mem0ai";
import { chromium } from "playwright";
import fs from "fs";

import { competitorAnalysis } from "./competitor-upgrade.js";
import { generateOutreach } from "./outreach-upgrade.js";
import { enrichLeads } from "./enrich-leads.js";
import { buildApprovalQueue } from "./approval-queue.js";
import { reviewApprovalQueue } from "./review-queue.js";
import { sendApprovedOutreach } from "./resend-sender.js";
import { generateFollowUp } from "./followup-generator.js";
import { processDueFollowups } from "./followup-processor.js";
import { classifyReplies } from "./reply-classifier.js";
import { updatePipelineStage } from "./pipeline-manager.js";

import {
  updateOutreachState,
  getOutreachState,
  getAllOutreachState
} from "./outreach-state.js";

import { reviewFollowups } from "./followup-review.js";
import { scheduleFollowup } from "./followup-scheduler.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const memory = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let browser = null;
let context = null;
let page = null;

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: false
    });

    const sessionExists = fs.existsSync("session.json");

    if (sessionExists) {
      context = await browser.newContext({
        storageState: "session.json"
      });
    } else {
      context = await browser.newContext();
    }

    page = await context.newPage();
  }
}

async function saveSession() {
  if (context) {
    await context.storageState({
      path: "session.json"
    });
  }
}

function askApproval(question) {
  return new Promise((resolve) => {
    rl.question(`${question} yes/no: `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

function saveReport(filename, content) {
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  const finalName = `${safeName}.md`;
  fs.writeFileSync(finalName, content);
  return finalName;
}

function parseCSV(path) {
  const raw = fs.readFileSync(path, "utf8");
  const lines = raw.trim().split("\n");
  const rows = lines.slice(1);

  return rows.map(row => {
    const [company, website] = row.split(",");

    return {
      company: company.trim(),
      website: website?.trim() || ""
    };
  });
}

async function structuredWebsiteAudit(url) {
  await ensureBrowser();

  await page.goto(url);

  const title = await page.title();
  const bodyText = await page.locator("body").innerText();
  const links = await page.locator("a").count();
  const images = await page.locator("img").count();

  const headings = await page
    .locator("h1, h2, h3")
    .evaluateAll(els => els.map(el => el.innerText));

  const auditPrompt = `
You are an elite website audit consultant.

Analyze this website and produce a concise professional audit.

URL:
${url}

TITLE:
${title}

WORD COUNT:
${bodyText.split(" ").length}

LINK COUNT:
${links}

IMAGE COUNT:
${images}

HEADINGS:
${JSON.stringify(headings, null, 2)}

PAGE TEXT:
${bodyText.slice(0, 4000)}

Return:

1. Executive Summary
2. Brand Clarity
3. Messaging Quality
4. UX Observations
5. SEO Observations
6. Conversion Opportunities
7. Top 5 Recommendations
8. Overall Score /10

Keep it practical and business-focused.
`;

  const auditResponse = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional website auditor."
      },
      {
        role: "user",
        content: auditPrompt
      }
    ]
  });

  return auditResponse.choices[0].message.content;
}

async function runLeadPipeline({ businessName, website }) {
  const audit = await structuredWebsiteAudit(website);

  const auditFile = saveReport(
    `audit-${businessName}`,
    audit
  );

  const outreach = await generateOutreach({
    client,
    businessName,
    website,
    auditSummary: audit
  });

  updateOutreachState({
    company: businessName,
    updates: {
      status: "pending",
      auditFile,
      outreachFile: outreach.filename,
      website,
      pipelineStage: "new_lead"
    }
  });

  return {
    audit,
    auditFile,
    outreach: outreach.output,
    outreachFile: outreach.filename
  };
}

async function batchLeadPipeline(csvPath) {
  const leads = parseCSV(csvPath);
  const results = [];

  for (const lead of leads) {
    console.log(`\nProcessing ${lead.company}...`);

    try {
      const result = await runLeadPipeline({
        businessName: lead.company,
        website: lead.website
      });

      results.push({
        company: lead.company,
        success: true,
        auditFile: result.auditFile,
        outreachFile: result.outreachFile
      });
    } catch (err) {
      results.push({
        company: lead.company,
        success: false,
        error: err.message
      });

      updateOutreachState({
        company: lead.company,
        updates: {
          status: "failed",
          error: err.message,
          pipelineStage: "closed_lost"
        }
      });
    }
  }

  const summary = JSON.stringify(results, null, 2);

  fs.writeFileSync("batch-results.json", summary);

  return summary;
}

const messages = [
  {
    role: "system",
    content: `
You are Hermes, the AI operating assistant for Liminull AI.

AVAILABLE TOOLS:

LEAD_PIPELINE:
LEAD_PIPELINE: Company Name | https://website.com

BATCH_LEAD_PIPELINE:
BATCH_LEAD_PIPELINE: leads.csv

ENRICH_LEADS:
ENRICH_LEADS: leads.csv

BUILD_APPROVAL_QUEUE:
BUILD_APPROVAL_QUEUE: batch-results.json

REVIEW_APPROVAL_QUEUE:
REVIEW_APPROVAL_QUEUE: outreach-approval-queue.md

APPROVE_OUTREACH:
APPROVE_OUTREACH: Company Name

REJECT_OUTREACH:
REJECT_OUTREACH: Company Name

SEND_APPROVED_OUTREACH:
SEND_APPROVED_OUTREACH: Company Name | email@example.com

GENERATE_FOLLOWUP:
GENERATE_FOLLOWUP: Company Name

REVIEW_FOLLOWUPS:
REVIEW_FOLLOWUPS

PROCESS_DUE_FOLLOWUPS:
PROCESS_DUE_FOLLOWUPS

CLASSIFY_REPLIES:
CLASSIFY_REPLIES: sample-replies.json

VIEW_OUTREACH_STATE:
VIEW_OUTREACH_STATE: Company Name

VIEW_ALL_OUTREACH_STATE:
VIEW_ALL_OUTREACH_STATE

COMPETITOR_ANALYSIS:
COMPETITOR_ANALYSIS: AI automation agencies

CRITICAL TOOL RULES:
- NEVER narrate
- ONLY output tool commands
- Use exact syntax with colons
- One tool at a time
- Do not remove colons from tool calls

Keep responses operational.
`
  }
];

async function askUser() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      if (browser) {
        await saveSession();
        await browser.close();
      }

      console.log("Hermes: Goodbye.");
      rl.close();
      return;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        ...messages,
        {
          role: "user",
          content: input
        }
      ]
    });

    const reply = response.choices[0].message.content;

    // LEAD PIPELINE
    if (reply.startsWith("LEAD_PIPELINE:")) {
      const raw = reply.replace("LEAD_PIPELINE:", "").trim();
      const parts = raw.split("|");

      const businessName = parts[0]?.trim();
      const website = parts[1]?.trim();

      console.log(`\nHermes wants to run lead pipeline for: ${businessName}`);

      const approved = await askApproval("Allow lead pipeline?");

      if (!approved) {
        console.log("Lead pipeline cancelled.");
        askUser();
        return;
      }

      const result = await runLeadPipeline({
        businessName,
        website
      });

      console.log("\nSTRUCTURED AUDIT:\n");
      console.log(result.audit);

      console.log(`\nSaved audit: ${result.auditFile}`);

      console.log("\nGENERATED OUTREACH:\n");
      console.log(result.outreach);

      console.log(`\nSaved outreach: ${result.outreachFile}`);

      askUser();
      return;
    }

    // BATCH LEAD PIPELINE
    if (reply.startsWith("BATCH_LEAD_PIPELINE:")) {
      const csvPath = reply
        .replace("BATCH_LEAD_PIPELINE:", "")
        .trim();

      console.log(`\nHermes wants to process lead batch: ${csvPath}`);

      const approved = await askApproval("Allow batch lead pipeline?");

      if (!approved) {
        console.log("Batch pipeline cancelled.");
        askUser();
        return;
      }

      const result = await batchLeadPipeline(csvPath);

      console.log("\nBATCH PIPELINE RESULTS:\n");
      console.log(result);

      console.log("\nSaved summary: batch-results.json");

      askUser();
      return;
    }

    // ENRICH LEADS
    if (reply.startsWith("ENRICH_LEADS:")) {
      const csvPath = reply.replace("ENRICH_LEADS:", "").trim();

      console.log(`\nHermes wants to enrich leads from: ${csvPath}`);

      const approved = await askApproval("Allow lead enrichment?");

      if (!approved) {
        console.log("Lead enrichment cancelled.");
        askUser();
        return;
      }

      const leads = parseCSV(csvPath);

      const enriched = await enrichLeads({
        client,
        leads
      });

      console.log("\nENRICHED LEADS:\n");
      console.log(enriched);

      console.log("\nSaved: enriched-leads.csv");

      askUser();
      return;
    }

    // BUILD APPROVAL QUEUE
    if (reply.startsWith("BUILD_APPROVAL_QUEUE:")) {
      const path = reply
        .replace("BUILD_APPROVAL_QUEUE:", "")
        .trim();

      console.log(`\nHermes wants to build approval queue from: ${path}`);

      const approved = await askApproval("Allow approval queue build?");

      if (!approved) {
        console.log("Approval queue cancelled.");
        askUser();
        return;
      }

      const queueFile = buildApprovalQueue(path);

      console.log(`\nSaved approval queue: ${queueFile}`);

      askUser();
      return;
    }

    // REVIEW APPROVAL QUEUE
    if (reply.startsWith("REVIEW_APPROVAL_QUEUE:")) {
      const path = reply
        .replace("REVIEW_APPROVAL_QUEUE:", "")
        .trim();

      console.log(`\nHermes wants to review approval queue: ${path}`);

      const approved = await askApproval("Allow queue review?");

      if (!approved) {
        console.log("Queue review cancelled.");
        askUser();
        return;
      }

      const result = reviewApprovalQueue(path);

      console.log("\nQUEUE REVIEW:\n");
      console.log(result);

      askUser();
      return;
    }

    // APPROVE OUTREACH
    if (reply.startsWith("APPROVE_OUTREACH:")) {
      const company = reply
        .replace("APPROVE_OUTREACH:", "")
        .trim();

      console.log(`\nHermes wants to approve outreach for: ${company}`);

      const approved = await askApproval("Approve this outreach?");

      if (!approved) {
        console.log("Approval cancelled.");
        askUser();
        return;
      }

      updateOutreachState({
        company,
        updates: {
          status: "approved",
          approvedAt: new Date().toISOString()
        }
      });

      console.log(`\n${company} approved for sending.`);

      askUser();
      return;
    }

    // REJECT OUTREACH
    if (reply.startsWith("REJECT_OUTREACH:")) {
      const company = reply
        .replace("REJECT_OUTREACH:", "")
        .trim();

      console.log(`\nHermes wants to reject outreach for: ${company}`);

      const approved = await askApproval("Reject this outreach?");

      if (!approved) {
        console.log("Rejection cancelled.");
        askUser();
        return;
      }

      updateOutreachState({
        company,
        updates: {
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          pipelineStage: "closed_lost"
        }
      });

      console.log(`\n${company} rejected.`);

      askUser();
      return;
    }

    // SEND APPROVED OUTREACH
    if (reply.startsWith("SEND_APPROVED_OUTREACH:")) {
      const raw = reply
        .replace("SEND_APPROVED_OUTREACH:", "")
        .trim();

      const parts = raw.split("|");

      const company = parts[0]?.trim();
      const toEmail = parts[1]?.trim();

      console.log(`\nHermes wants to send approved outreach for: ${company}`);
      console.log(`Recipient: ${toEmail}`);

      const currentState = getOutreachState(company);

      if (currentState?.status !== "approved") {
        console.log(`\nBlocked: ${company} is not approved for sending.`);
        askUser();
        return;
      }

      const approved = await askApproval("Send this approved outreach?");

      if (!approved) {
        console.log("Send cancelled.");
        askUser();
        return;
      }

      const result = await sendApprovedOutreach({
        company,
        toEmail
      });

      updateOutreachState({
        company,
        updates: {
          status: "sent",
          toEmail,
          sentAt: new Date().toISOString(),
          pipelineStage: "contacted"
        }
      });

      console.log("\nOUTREACH SENT:\n");
      console.log(result);

      const scheduleResult = scheduleFollowup({
        company,
        days: 3
      });

      console.log("\nFOLLOW-UP SCHEDULED:\n");
      console.log(scheduleResult);

      askUser();
      return;
    }

    // GENERATE FOLLOWUP
    if (reply.startsWith("GENERATE_FOLLOWUP:")) {
      const company = reply
        .replace("GENERATE_FOLLOWUP:", "")
        .trim();

      console.log(`\nHermes wants to generate follow-up for: ${company}`);

      const approved = await askApproval("Generate follow-up?");

      if (!approved) {
        console.log("Follow-up generation cancelled.");
        askUser();
        return;
      }

      const result = await generateFollowUp({
        client,
        company
      });

      console.log("\nFOLLOW-UP GENERATED:\n");
      console.log(result.output);

      console.log(`\nSaved follow-up: ${result.filename}`);

      updateOutreachState({
        company,
        updates: {
          followupFile: result.filename,
          followupGeneratedAt: new Date().toISOString()
        }
      });

      askUser();
      return;
    }

    // REVIEW FOLLOWUPS
    if (reply.startsWith("REVIEW_FOLLOWUPS")) {
      const result = reviewFollowups();

      console.log("\nFOLLOW-UP REVIEW:\n");
      console.log(result);

      askUser();
      return;
    }

    // PROCESS DUE FOLLOWUPS
    if (reply.startsWith("PROCESS_DUE_FOLLOWUPS")) {
      console.log("\nHermes wants to process due follow-ups.");

      const approved = await askApproval("Process due follow-ups?");

      if (!approved) {
        console.log("Follow-up processing cancelled.");
        askUser();
        return;
      }

      const result = await processDueFollowups({
        client,
        generateFollowUp
      });

      console.log("\nFOLLOW-UP PROCESSING RESULTS:\n");
      console.log(result);

      askUser();
      return;
    }

    // CLASSIFY REPLIES
    if (reply.startsWith("CLASSIFY_REPLIES:")) {
      const path = reply.replace("CLASSIFY_REPLIES:", "").trim();

      console.log(`\nHermes wants to classify replies from: ${path}`);

      const approved = await askApproval("Classify replies?");

      if (!approved) {
        console.log("Reply classification cancelled.");
        askUser();
        return;
      }

      const result = await classifyReplies({
        client,
        path
      });

      console.log("\nREPLY CLASSIFICATION RESULTS:\n");
      console.log(result);

      for (const item of result) {
        const pipeline = updatePipelineStage({
          company: item.company,
          replyStatus: item.classification
        });

        console.log("\nPIPELINE UPDATED:\n");
        console.log(pipeline);
      }

      askUser();
      return;
    }

    // VIEW OUTREACH STATE
    if (reply.startsWith("VIEW_OUTREACH_STATE:")) {
      const company = reply
        .replace("VIEW_OUTREACH_STATE:", "")
        .trim();

      const result = getOutreachState(company);

      console.log("\nOUTREACH STATE:\n");
      console.log(result);

      askUser();
      return;
    }

    // VIEW ALL OUTREACH STATE
    if (reply.startsWith("VIEW_ALL_OUTREACH_STATE")) {
      const result = getAllOutreachState();

      console.log("\nALL OUTREACH STATE:\n");
      console.log(result);

      askUser();
      return;
    }

    // COMPETITOR ANALYSIS
    if (reply.startsWith("COMPETITOR_ANALYSIS:")) {
      const query = reply
        .replace("COMPETITOR_ANALYSIS:", "")
        .trim();

      console.log(`\nHermes wants to analyze competitors for: ${query}`);

      const approved = await askApproval("Allow competitor analysis?");

      if (!approved) {
        console.log("Competitor analysis cancelled.");
        askUser();
        return;
      }

      await ensureBrowser();

      const result = await competitorAnalysis({
        client,
        page,
        query
      });

      console.log("\nCompetitor analysis:\n");
      console.log(result);

      const savedFile = saveReport(
        `competitor-analysis-${query}`,
        result
      );

      console.log(`\nSaved report: ${savedFile}`);

      await saveSession();

      askUser();
      return;
    }

    console.log("\nHermes:", reply);

    askUser();
  });
}

console.log("Hermes online with master outbound operating system.");

askUser();
