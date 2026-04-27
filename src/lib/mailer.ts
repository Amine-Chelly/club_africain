import nodemailer from "nodemailer";

/**
 * Mailer utility — configure via environment variables.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env
 * For local dev without a real SMTP, set SMTP_HOST=smtp.ethereal.email (auto-creates account)
 */
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // In dev, if no SMTP config, create an Ethereal test account
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transport = createTransport();

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM ?? "Club Africain <no-reply@club-africain.tn>";

  if (!transport) {
    // Dev fallback: log the email instead of sending
    console.info(`[mailer] Would send to: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }

  await transport.sendMail({ from, to, subject, html });
}
