import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFollowup(lead) {
  const prompt = `
You are an outbound operator for Liminull AI.

Generate a concise outbound followup email.

Lead Information:

Company:
${lead.company}

Pipeline Stage:
${lead.pipeline_stage}

Latest Reply:
${lead.latest_reply || "none"}

Lead Score:
${lead.lead_score}

Temperature:
${lead.lead_temperature}

Followup Count:
${lead.followup_count || 0}

Operational Memory Summary:
${lead.memory?.summary || "none"}

Relationship Status:
${lead.memory?.relationship_status || "unknown"}

Detected Objections:
${lead.memory?.objections || "none"}

Opportunity Notes:
${lead.memory?.opportunity_notes || "none"}

Recommended Next Action:
${lead.memory?.recommended_next_action || "none"}

Relevant Learned Strategies:
${JSON.stringify(lead.strategies || [], null, 2)}

Requirements:

- concise
- direct
- human
- no AI wording
- no hype
- professional Liminull AI tone
- no emojis

Behavior Rules:

- If objections exist, directly address them naturally.
- If onboarding concerns exist, reassure implementation/support quality.
- If urgency is high, increase decisiveness.
- If relationship_status is engaged, assume prior rapport.
- If recommended_next_action exists, align the email with that action.
- Use operational memory context strategically, not generically.
- If learned strategies are provided, apply them directly when relevant.
- Prioritize strategy recommendations with higher confidence.
- Avoid sounding templated or robotic.

Return ONLY valid JSON:

{
  "subject": "...",
  "body": "Sign emails from Liminull AI.",
  "reasoning": "..."
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "You generate outbound followups for Liminull AI. Return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || "";

  try {
    return JSON.parse(content);
  } catch {
    return {
      subject: "Quick follow-up",
      body: content,
      reasoning: "Fallback parsing",
    };
  }
}
