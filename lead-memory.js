import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function updateLeadMemory({
  lead,
  reply,
  classification,
}) {
  const prompt = `
You are Hermes Control.

Update the operational memory for this lead.

Lead:
${JSON.stringify(lead, null, 2)}

Latest Reply:
${reply?.body || ""}

Classification:
${JSON.stringify(classification, null, 2)}

Return ONLY valid JSON:

{
  "summary": "...",
  "current_intent": "...",
  "objections": "...",
  "relationship_status": "...",
  "recommended_next_action": "...",
  "risk_level": "...",
  "opportunity_notes": "..."
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You maintain concise operational memory for business leads. Return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  let content = response.choices[0].message.content || "";

  content = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      summary:
        reply?.body ||
        "Memory update failed to parse.",
      current_intent:
        classification?.intent || "unclear",
      objections:
        classification?.reasoning || "",
      relationship_status:
        "unknown",
      recommended_next_action:
        classification?.suggested_next_action || "",
      risk_level:
        classification?.urgency === "high" ? "low" : "normal",
      opportunity_notes:
        classification?.reasoning || "",
    };
  }
}
