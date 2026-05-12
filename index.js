import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "readline";
import { MemoryClient } from "mem0ai";
import { chromium } from "playwright";
import fs from "fs";

import { competitorAnalysis } from "./competitor-upgrade.js";
import { generateOutreach } from "./outreach-upgrade.js";
import { enrichLeads } from "./enrich-leads.js";

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

    const sessionExists =
      fs.existsSync("session.json");

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

  const raw =
    fs.readFileSync(path, "utf8");

  const lines =
    raw.trim().split("\n");

  const rows =
    lines.slice(1);

  return rows.map(row => {

    const [company, website] =
      row.split(",");

    return {
      company: company.trim(),
      website: website?.trim() || ""
    };
  });
}

async function structuredWebsiteAudit(url) {

  await ensureBrowser();

  await page.goto(url);

  const title =
    await page.title();

  const bodyText =
    await page.locator("body").innerText();

  const links =
    await page.locator("a").count();

  const images =
    await page.locator("img").count();

  const headings =
    await page.locator("h1, h2, h3")
      .evaluateAll(
        els => els.map(el => el.innerText)
      );

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

  const auditResponse =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional website auditor."
        },
        {
          role: "user",
          content: auditPrompt
        }
      ]
    });

  return auditResponse
    .choices[0]
    .message
    .content;
}

async function runLeadPipeline({
  businessName,
  website
}) {

  const audit =
    await structuredWebsiteAudit(website);

  const auditFile =
    saveReport(
      `audit-${businessName}`,
      audit
    );

  const outreach =
    await generateOutreach({
      client,
      businessName,
      website,
      auditSummary: audit
    });

  return {
    audit,
    auditFile,
    outreach: outreach.output,
    outreachFile: outreach.filename
  };
}

async function batchLeadPipeline(csvPath) {

  const leads =
    parseCSV(csvPath);

  const results = [];

  for (const lead of leads) {

    console.log(
      `\nProcessing ${lead.company}...`
    );

    try {

      const result =
        await runLeadPipeline({
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
    }
  }

  const summary =
    JSON.stringify(results, null, 2);

  fs.writeFileSync(
    "batch-results.json",
    summary
  );

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

COMPETITOR_ANALYSIS:
COMPETITOR_ANALYSIS: AI automation agencies

CRITICAL TOOL RULES:
- NEVER narrate
- ONLY output tool commands
- Use exact syntax
- One tool at a time

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

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          ...messages,
          {
            role: "user",
            content: input
          }
        ]
      });

    const reply =
      response.choices[0].message.content;

    // ENRICH LEADS
    if (
      reply.startsWith(
        "ENRICH_LEADS:"
      )
    ) {

      const csvPath =
        reply.replace(
          "ENRICH_LEADS:",
          ""
        ).trim();

      console.log(
        `\nHermes wants to enrich leads from: ${csvPath}`
      );

      const approved =
        await askApproval(
          "Allow lead enrichment?"
        );

      if (!approved) {

        console.log(
          "Lead enrichment cancelled."
        );

        askUser();

        return;
      }

      const leads =
        parseCSV(csvPath);

      const enriched =
        await enrichLeads({
          client,
          leads
        });

      console.log(
        "\nENRICHED LEADS:\n"
      );

      console.log(enriched);

      console.log(
        "\nSaved: enriched-leads.csv"
      );

      askUser();

      return;
    }

    // BATCH LEAD PIPELINE
    if (
      reply.startsWith(
        "BATCH_LEAD_PIPELINE:"
      )
    ) {

      const csvPath =
        reply.replace(
          "BATCH_LEAD_PIPELINE:",
          ""
        ).trim();

      console.log(
        `\nHermes wants to process lead batch: ${csvPath}`
      );

      const approved =
        await askApproval(
          "Allow batch lead pipeline?"
        );

      if (!approved) {

        console.log(
          "Batch pipeline cancelled."
        );

        askUser();

        return;
      }

      const result =
        await batchLeadPipeline(csvPath);

      console.log(
        "\nBATCH PIPELINE RESULTS:\n"
      );

      console.log(result);

      console.log(
        "\nSaved summary: batch-results.json"
      );

      askUser();

      return;
    }

    // LEAD PIPELINE
    if (
      reply.startsWith(
        "LEAD_PIPELINE:"
      )
    ) {

      const raw =
        reply.replace(
          "LEAD_PIPELINE:",
          ""
        ).trim();

      const parts =
        raw.split("|");

      const businessName =
        parts[0]?.trim();

      const website =
        parts[1]?.trim();

      console.log(
        `\nHermes wants to run lead pipeline for: ${businessName}`
      );

      const approved =
        await askApproval(
          "Allow lead pipeline?"
        );

      if (!approved) {

        console.log(
          "Lead pipeline cancelled."
        );

        askUser();

        return;
      }

      const result =
        await runLeadPipeline({
          businessName,
          website
        });

      console.log(
        "\nSTRUCTURED AUDIT:\n"
      );

      console.log(result.audit);

      console.log(
        `\nSaved audit: ${result.auditFile}`
      );

      console.log(
        "\nGENERATED OUTREACH:\n"
      );

      console.log(result.outreach);

      console.log(
        `\nSaved outreach: ${result.outreachFile}`
      );

      askUser();

      return;
    }

    // COMPETITOR ANALYSIS
    if (
      reply.startsWith(
        "COMPETITOR_ANALYSIS:"
      )
    ) {

      const query =
        reply.replace(
          "COMPETITOR_ANALYSIS:",
          ""
        ).trim();

      console.log(
        `\nHermes wants to analyze competitors for: ${query}`
      );

      const approved =
        await askApproval(
          "Allow competitor analysis?"
        );

      if (!approved) {

        console.log(
          "Competitor analysis cancelled."
        );

        askUser();

        return;
      }

      await ensureBrowser();

      const result =
        await competitorAnalysis({
          client,
          page,
          query
        });

      console.log(
        "\nCompetitor analysis:\n"
      );

      console.log(result);

      const savedFile =
        saveReport(
          `competitor-analysis-${query}`,
          result
        );

      console.log(
        `\nSaved report: ${savedFile}`
      );

      await saveSession();

      askUser();

      return;
    }

    console.log("\nHermes:", reply);

    askUser();
  });
}

console.log(
  "Hermes online with scalable outbound workflows."
);

askUser();
