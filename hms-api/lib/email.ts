import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html?: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.RESEND_FROM_EMAIL ?? "HMS Hotel <onboarding@resend.dev>";

  const { error } = await getResend().emails.send({
    from,
    to,
    subject,
    html: html ?? `<p>${text}</p>`,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendOtpEmail(to: string, otp: string) {
  await sendEmail({
    to,
    subject: "Your HMS Hotel sign-in code",
    text: `Your HMS Hotel sign-in code is: ${otp}. It expires in 5 minutes.`,
    html: `<p>Your HMS Hotel sign-in code is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`,
  });
}
