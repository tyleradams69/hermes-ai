import fs from "fs";

export async function generateFollowUp({
  client,
  company
}) {

  const outreachFile =
    `outreach-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") + ".md";

  if (!fs.existsSync(outreachFile)) {
    throw new Error(
      `Missing outreach file: ${outreachFile}`
    );
  }

  const original =
    fs.readFileSync(outreachFile, "utf8");

  const prompt = `
You are an elite outbound sales strategist.

Generate a concise professional follow-up email.

COMPANY:
${company}

ORIGINAL OUTREACH:
${original}

Requirements:
- Friendly
- Shorter than original
- Professional
- Not spammy
- Natural tone
- Include soft CTA
- Mention prior outreach politely

Return:
1. Subject Line
2. Follow-Up Email
`;

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional sales follow-up copywriter."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

  const output =
    response.choices[0]
      .message
      .content;

  const filename =
    `followup-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") + ".md";

  fs.writeFileSync(filename, output);

  return {
    output,
    filename
  };
}
