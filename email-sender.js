import fs from "fs";

export async function sendApprovedOutreach({
  transporter,
  company,
  toEmail
}) {

  const filename =
    `outreach-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") + ".md";

  if (!fs.existsSync(filename)) {
    throw new Error(
      `Outreach file not found: ${filename}`
    );
  }

  const content =
    fs.readFileSync(filename, "utf8");

  const subjectMatch =
    content.match(/Subject Line:(.*)/i);

  const subject =
    subjectMatch
      ? subjectMatch[1].trim()
      : `Liminull AI Outreach`;

  const body =
    content.replace(/Subject Line:.*\n/i, "");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text: body
  });

  return `
OUTREACH SENT

Company:
${company}

Recipient:
${toEmail}

Subject:
${subject}
`;
}
