import fs from "fs";

export async function enrichLeads({
  client,
  leads
}) {

  const enriched = [];

  for (const lead of leads) {

    if (lead.website && lead.website !== "") {
      enriched.push(lead);
      continue;
    }

    const prompt = `
Find the most likely official website for this business.

BUSINESS:
${lead.company}

Return ONLY the website URL.
Example:
https://example.com
`;

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You identify official business websites."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

    const website =
      response.choices[0]
        .message
        .content
        .trim();

    enriched.push({
      company: lead.company,
      website
    });
  }

  const csvLines = [
    "company,website",
    ...enriched.map(
      lead =>
        `${lead.company},${lead.website}`
    )
  ];

  fs.writeFileSync(
    "enriched-leads.csv",
    csvLines.join("\n")
  );

  return enriched;
}
