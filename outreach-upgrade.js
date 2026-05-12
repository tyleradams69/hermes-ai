import fs from "fs";

export async function generateOutreach({
  client,
  businessName,
  website,
  auditSummary
}) {

  const prompt = `
You are an elite AI sales strategist.

Generate a personalized cold outreach email.

BUSINESS:
${businessName}

WEBSITE:
${website}

AUDIT SUMMARY:
${auditSummary}

Requirements:
- Friendly but high-level professional tone
- Personalized observations
- Mention real weaknesses/opportunities
- Explain how Liminull AI could help
- Keep under 250 words
- Strong CTA
- Not spammy
- Feels human and intelligent

Return:
1. Subject Line
2. Outreach Email
`;

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a world-class AI sales copywriter."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

  const output =
    response.choices[0].message.content;

  const filename =
    `outreach-${businessName}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") + ".md";

  fs.writeFileSync(filename, output);

  return {
    output,
    filename
  };
}
