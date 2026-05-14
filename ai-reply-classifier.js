import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifyReply(reply) {

  const prompt = `
You are Hermes Control.

Classify the operational intent of this inbound customer reply.

Reply:

${reply.body}

Return ONLY valid JSON:

{
  "intent": "...",
  "confidence": 0-100,
  "suggested_stage": "...",
  "urgency": "...",
  "suggested_next_action": "...",
  "reasoning": "..."
}

Allowed intents:

- pricing_request
- meeting_request
- interested
- followup_needed
- not_interested
- spam
- support
- unclear

Examples of suggested_next_action:

- Generate pricing followup
- Schedule sales call
- Pause outreach
- Escalate operator
- Send meeting scheduler

Examples of suggested_next_action:

- Generate pricing followup
- Schedule sales call
- Pause outreach
- Escalate operator
- Send meeting scheduler

Allowed stages:

- new_lead
- contacted
- interested
- pricing_requested
- meeting_requested
- closed_lost
`;

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content:
            "You classify inbound business replies for Hermes Control."
        },

        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.2,
    });

  const content =
    response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {

    return {
      intent: "unclear",
      confidence: 0,
      suggested_stage: "contacted",
      urgency: "low",
      reasoning: "Failed to parse model response"
    };
  }
}
