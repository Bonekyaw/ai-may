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

function renderOtpEmail(otp: string) {
  const digits = otp
    .split("")
    .map(
      (digit) =>
        `<td style="padding:0 6px;"><div style="width:44px;height:56px;line-height:56px;background-color:#f1f4fb;border:1px solid #e2e8f5;border-radius:10px;color:#1b2545;font-size:26px;font-weight:700;text-align:center;font-family:'Courier New',Courier,monospace;">${digit}</div></td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <title>Your HMS Hotel sign-in code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef1f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your HMS Hotel sign-in code is ${otp}. It expires in 5 minutes.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(27,37,69,0.08);">
            <tr>
              <td style="background-color:#1b2545;background-image:linear-gradient(135deg,#1b2545 0%,#2a3a66 100%);padding:36px 40px;">
                <div style="display:inline-block;background-color:rgba(255,255,255,0.12);color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Staff Portal</div>
                <h1 style="margin:18px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.01em;">HMS Hotel</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 8px;">
                <h2 style="margin:0;color:#1b2545;font-size:20px;font-weight:700;">Verify your sign-in</h2>
                <p style="margin:12px 0 0;color:#5b6577;font-size:15px;line-height:1.6;">Use the verification code below to finish signing in to the admin dashboard. This code expires in <strong style="color:#1b2545;">5 minutes</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                  <tr>${digits}</tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px;">
                <div style="background-color:#f8fafc;border:1px solid #eef1f7;border-radius:10px;padding:14px 16px;color:#5b6577;font-size:13px;line-height:1.6;">
                  Didn't try to sign in? You can safely ignore this email &mdash; your account remains secure.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 36px;border-top:1px solid #eef1f7;">
                <p style="margin:0;color:#94a0b4;font-size:12px;line-height:1.6;">This is an automated message from HMS Hotel. Please do not reply.</p>
                <p style="margin:6px 0 0;color:#94a0b4;font-size:12px;">&copy; ${new Date().getFullYear()} HMS Hotel. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOtpEmail(to: string, otp: string) {
  await sendEmail({
    to,
    subject: "Your HMS Hotel sign-in code",
    text: `Your HMS Hotel sign-in code is: ${otp}. It expires in 5 minutes.\n\nIf you didn't try to sign in, you can safely ignore this email.`,
    html: renderOtpEmail(otp),
  });
}

function renderPasswordResetEmail(resetUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <title>Reset your HMS Hotel password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef1f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Reset your HMS Hotel staff account password. This link expires in 1 hour.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(27,37,69,0.08);">
            <tr>
              <td style="background-color:#1b2545;background-image:linear-gradient(135deg,#1b2545 0%,#2a3a66 100%);padding:36px 40px;">
                <div style="display:inline-block;background-color:rgba(255,255,255,0.12);color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Staff Portal</div>
                <h1 style="margin:18px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.01em;">HMS Hotel</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 8px;">
                <h2 style="margin:0;color:#1b2545;font-size:20px;font-weight:700;">Reset your password</h2>
                <p style="margin:12px 0 0;color:#5b6577;font-size:15px;line-height:1.6;">We received a request to reset the password for your staff account. Click the button below to choose a new password. This link expires in <strong style="color:#1b2545;">1 hour</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px;" align="center">
                <a href="${resetUrl}" style="display:inline-block;background-color:#1b2545;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Reset password</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 8px;">
                <p style="margin:0;color:#94a0b4;font-size:13px;line-height:1.6;word-break:break-all;">Or copy this link: ${resetUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px;">
                <div style="background-color:#f8fafc;border:1px solid #eef1f7;border-radius:10px;padding:14px 16px;color:#5b6577;font-size:13px;line-height:1.6;">
                  Didn't request a password reset? You can safely ignore this email &mdash; your password will not change.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 36px;border-top:1px solid #eef1f7;">
                <p style="margin:0;color:#94a0b4;font-size:12px;line-height:1.6;">This is an automated message from HMS Hotel. Please do not reply.</p>
                <p style="margin:6px 0 0;color:#94a0b4;font-size:12px;">&copy; ${new Date().getFullYear()} HMS Hotel. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Reset your HMS Hotel password",
    text: `Reset your HMS Hotel staff account password by visiting this link (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request a password reset, you can safely ignore this email.`,
    html: renderPasswordResetEmail(resetUrl),
  });
}
