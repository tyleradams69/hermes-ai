import fs from "fs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovedOutreach({
  company,
  toEmail
}) {
  const filename =
    `outreach-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") + ".md";

  if (!fs.existsSync(filename)) {
    throw new Error(`Outreach file not found: ${filename}`);
  }

  const content = fs.readFileSync(filename, "utf8");

  const subjectMatch = content.match(/Subject Line:(.*)/i);

  const subject = subjectMatch
    ? subjectMatch[1].trim()
    : "Liminull AI Outreach";

  const body = content.replace(/Subject Line:.*\n/i, "").trim();

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject,
    text: body
  });

  return {
    company,
    toEmail,
    subject,
    result
  };
}
