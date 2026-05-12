import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "readline";
import { MemoryClient } from "mem0ai";
import { chromium } from "playwright";
import fs from "fs";

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
let page = null;

let dryRunMode = false;

async function ensureBrowser() {

  if (!browser) {
    browser = await chromium.launch({
      headless: true
    });

    page = await browser.newPage();
  }
}

function askApproval(question) {
  return new Promise((resolve) => {
    rl.question(`${question} yes/no: `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function openBrowserPage(url) {

  if (dryRunMode) {
    return `[DRY RUN] Would open browser at ${url}`;
  }

  await ensureBrowser();

  await page.goto(url);

  const title = await page.title();

  const bodyText = await page.locator("body").innerText();

  await page.screenshot({
    path: "browser-screenshot.png"
  });

  return `Opened ${url}

Page title:
${title}

Page text preview:
${bodyText.slice(0, 1000)}

Screenshot saved as browser-screenshot.png`;
}

async function googleSearch(query) {

  if (dryRunMode) {
    return `[DRY RUN] Would Google search: ${query}`;
  }

  await ensureBrowser();

  await page.goto("https://www.google.com");

  await page.fill("textarea[name='q']", query);

  await page.keyboard.press("Enter");

  await page.waitForLoadState("networkidle");

  const title = await page.title();

  const bodyText = await page.locator("body").innerText();

  await page.screenshot({
    path: "google-results.png"
  });

  return `Google search completed.

Query:
${query}

Page title:
${title}

Search results preview:
${bodyText.slice(0, 1500)}

Screenshot saved as google-results.png`;
}

const messages = [
  {
    role: "system",
    content: `
You are Hermes, the AI operating assistant for Liminull AI.

You have browser tools.

OPEN_BROWSER:
OPEN_BROWSER: https://example.com

GOOGLE SEARCH:
GOOGLE_SEARCH: search query

IMPORTANT:
- Use exact tool labels
- Use one tool at a time
- Wait for tool results
- Never repeat successful actions
- Treat dry-run actions as completed
- Prefer high-level tools over low-level browser actions

Keep responses practical and step-by-step.
`
  }
];

async function askUser() {

  rl.question("\nYou: ", async (input) => {

    if (input.toLowerCase() === "exit") {

      if (browser) {
        await browser.close();
      }

      console.log("Hermes: Goodbye.");
      rl.close();
      return;
    }

    if (input.toLowerCase() === "dry run on") {

      dryRunMode = true;

      console.log(
        "Hermes: Dry-run mode is ON."
      );

      askUser();
      return;
    }

    if (input.toLowerCase() === "dry run off") {

      dryRunMode = false;

      console.log(
        "Hermes: Dry-run mode is OFF."
      );

      askUser();
      return;
    }

    const memories = await memory.search(input, {
      filters: {
        user_id: "tyler"
      }
    });

    let memoryContext = "";

    if (memories.results?.length > 0) {

      memoryContext = memories.results
        .map(m => m.memory)
        .join("\n");
    }

    const fullPrompt = `
Relevant memory:
${memoryContext}

Dry-run mode:
${dryRunMode ? "ON" : "OFF"}

User message:
${input}
`;

    messages.push({
      role: "user",
      content: fullPrompt
    });

    let response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages
    });

    let reply = response.choices[0].message.content;

    let toolSteps = 0;
    const maxToolSteps = 6;

    while (
      toolSteps < maxToolSteps &&
      (
        reply.startsWith("OPEN_BROWSER:") ||
        reply.startsWith("GOOGLE_SEARCH:")
      )
    ) {

      toolSteps++;

      // OPEN BROWSER
      if (reply.startsWith("OPEN_BROWSER:")) {

        const url = reply
          .replace("OPEN_BROWSER:", "")
          .trim();

        console.log(`\nHermes wants to open browser: ${url}`);

        const approved = await askApproval(
          "Allow browser action?"
        );

        if (!approved) {
          reply = "Browser action cancelled.";
          break;
        }

        const result = await openBrowserPage(url);

        console.log("\nBrowser result:");
        console.log(result);

        messages.push({
          role: "assistant",
          content: `
Browser action completed:
${result}

Treat this action as completed.
`
        });

        break;
      }

      // GOOGLE SEARCH
      if (reply.startsWith("GOOGLE_SEARCH:")) {

        const query = reply
          .replace("GOOGLE_SEARCH:", "")
          .trim();

        console.log(`\nHermes wants to Google search: ${query}`);

        const approved = await askApproval(
          "Allow Google search?"
        );

        if (!approved) {
          reply = "Google search cancelled.";
          break;
        }

        const result = await googleSearch(query);

        console.log("\nGoogle search result:");
        console.log(result);

        messages.push({
          role: "assistant",
          content: `
Google search completed:
${result}

Treat this action as completed.
`
        });

        break;
      }
    }

    console.log("\nHermes:", reply);

    askUser();
  });
}

console.log(
  "Hermes online with smart browser automation."
);

console.log(
  "Commands: dry run on | dry run off | exit"
);

askUser();
