import fs from "fs";

import {
  updateOutreachState
} from "./outreach-state.js";

export async function classifyReplies({
  client,
  path
}) {

  const raw =
    fs.readFileSync(path, "utf8");

  const replies =
    JSON.parse(raw);

  const results = [];

  for (const reply of replies) {

    const prompt = `
You are a sales reply classifier.

Classify this reply into ONE category:

- interested
- not_interested
- pricing_request
- meeting_request
- unclear

REPLY:
${reply.body}

Return ONLY the category.
`;

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You classify sales replies."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

    const classification =
      response.choices[0]
        .message
        .content
        .trim();

    updateOutreachState({
      company: reply.company,
      updates: {
        replyStatus: classification,
        repliedAt:
          new Date().toISOString(),
        latestReply:
          reply.body
      }
    });

    results.push({
      company: reply.company,
      classification
    });
  }

  return results;
}
