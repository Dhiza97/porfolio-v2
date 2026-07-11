import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || user;

  if (!host || !user || !pass || !to || !from || Number.isNaN(port)) {
    throw new Error("Missing contact email environment variables");
  }

  return { host, port, user, pass, to, from };
}

function redirectWithStatus(request, status) {
  const url = new URL("/contact", request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(name, email, message) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New contact message</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#666;">
                Portfolio
              </p>
              <h1 style="margin:8px 0 0;font-size:36px;font-weight:700;letter-spacing:-0.02em;color:#f5f5f5;line-height:1;">
                NEW MESSAGE
              </h1>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">

              <!-- Sender block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#555;">From</p>
                    <p style="margin:0;font-size:18px;font-weight:600;color:#f0f0f0;">${safeName}</p>
                  </td>
                  <td style="vertical-align:top;text-align:right;">
                    <a href="mailto:${safeEmail}" style="display:inline-block;margin-top:20px;font-size:13px;color:#888;text-decoration:none;border-bottom:1px solid #333;padding-bottom:2px;">${safeEmail}</a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top:1px solid #222;margin-bottom:28px;"></div>

              <!-- Message -->
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#555;">Message</p>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c0c0c0;">${safeMessage}</p>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}?subject=Re: Your message" style="display:inline-block;padding:12px 28px;background:#f5f5f5;color:#0d0d0d;font-size:13px;font-weight:600;letter-spacing:0.04em;text-decoration:none;border-radius:6px;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;">
              <p style="margin:0;font-size:11px;color:#444;letter-spacing:0.06em;">
                Sent ${date} via your portfolio contact form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = cleanText(formData.get("name"), 120);
    const email = cleanText(formData.get("email"), 180);
    const message = cleanText(formData.get("message"), 5000);

    if (!name || !email || !message) {
      return redirectWithStatus(request, "error");
    }

    const { host, port, user, pass, to, from } = getMailConfig();

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New contact message from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, "", "Message:", message].join("\n"),
      html: buildHtml(name, email, message),
    });

    return redirectWithStatus(request, "sent");
  } catch {
    return redirectWithStatus(request, "error");
  }
}