export async function competitorAnalysis({
  client,
  page,
  query
}) {

  await page.goto("https://www.google.com");

  await page.fill(
    "textarea[name='q']",
    `${query} competitors`
  );

  await page.keyboard.press("Enter");

  await page.waitForLoadState("networkidle");

  const bodyText =
    await page.locator("body").innerText();

  const analysisPrompt = `
You are a senior market intelligence strategist.

Analyze the following competitor research data.

QUERY:
${query}

GOOGLE RESULTS:
${bodyText.slice(0, 6000)}

Return:

1. Top Competitors
2. Market Positioning
3. Messaging Patterns
4. Pricing Signals
5. Service Offerings
6. Market Gaps
7. Opportunities for Liminull AI
8. Recommended Differentiation
9. Strategic Recommendations
10. Overall Market Observations

Be concise, tactical, and business-focused.
`;

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional market intelligence analyst."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

  return response.choices[0].message.content;
}
