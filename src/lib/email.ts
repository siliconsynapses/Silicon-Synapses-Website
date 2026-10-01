import "server-only";

import { siteConfig } from "@/config/site";

/**
 * Transactional email via Resend's REST API (https://resend.com/docs). We call
 * the HTTP endpoint with `fetch` rather than the SDK so the app has no extra
 * dependency and the bundle stays lean.
 *
 * Email is OPTIONAL: when `RESEND_API_KEY` / `EMAIL_FROM` are unset, every send
 * is a silent no-op that returns `false`. Callers treat sending as best-effort —
 * a failed or skipped email must never break the user flow that triggered it.
 * We never log recipient addresses (PII); only outcomes/status codes.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** True when a Resend key and a verified from-address are both configured. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Where replies should go (e.g. the club's contact address). */
  replyTo?: string;
};

/**
 * Send one email. Returns true only on a 2xx from Resend; never throws, so it is
 * safe to `await` inside a flow that must still succeed if email is down.
 */
export async function sendEmail(args: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] skipped — RESEND_API_KEY/EMAIL_FROM not set");
    }
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[email] send failed — HTTP ${res.status}`);
      }
      return false;
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[email] send error:",
        error instanceof Error ? error.message : error,
      );
    }
    return false;
  }
}

/** Minimal HTML escaping for values interpolated into the email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ConfirmationArgs = {
  to: string;
  participantName: string;
  eventTitle: string;
  /** Pre-formatted, human-readable date/time (already pinned to IST). */
  eventWhen: string;
  eventVenue: string;
  /** Absolute URL to the digital pass (opaque token only — safe to email). */
  passUrl: string;
  status: "CONFIRMED" | "WAITLISTED";
  replyTo?: string;
};

/**
 * Compose and send the post-registration confirmation. The pass URL carries only
 * the opaque token — never participant PII — so it is safe to put in an email.
 */
export async function sendRegistrationConfirmation(
  args: ConfirmationArgs,
): Promise<boolean> {
  const brand = siteConfig.name;
  const confirmed = args.status === "CONFIRMED";

  const name = escapeHtml(args.participantName);
  const title = escapeHtml(args.eventTitle);
  const when = escapeHtml(args.eventWhen);
  const venue = escapeHtml(args.eventVenue);

  const subject = confirmed
    ? `You're registered — ${args.eventTitle}`
    : `You're on the waitlist — ${args.eventTitle}`;

  const lead = confirmed
    ? `You're registered for <strong>${title}</strong>. Your digital pass is ready.`
    : `You're on the waitlist for <strong>${title}</strong>. We'll be in touch if a spot opens up — keep this pass handy.`;

  const leadText = confirmed
    ? `You're registered for ${args.eventTitle}. Your digital pass is ready.`
    : `You're on the waitlist for ${args.eventTitle}. We'll be in touch if a spot opens up — keep this pass handy.`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0b1220;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#111a2e;border:1px solid #1e2b45;border-radius:14px;overflow:hidden;">
      <div style="padding:22px 28px;border-bottom:1px solid #1e2b45;">
        <span style="font-size:17px;font-weight:700;color:#e2e8f0;letter-spacing:0.2px;">${escapeHtml(brand)}</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 10px;font-size:20px;line-height:1.3;color:#f1f5f9;">${confirmed ? "You're registered" : "You're on the waitlist"}</h1>
        <p style="margin:0 0 22px;color:#94a3b8;font-size:14px;line-height:1.6;">Hi ${name}, ${lead}</p>
        <div style="background:#0b1220;border:1px solid #1e2b45;border-radius:10px;padding:16px 18px;margin:0 0 24px;">
          <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:6px;">${title}</div>
          <div style="font-size:13px;color:#94a3b8;line-height:1.7;">
            <div><span style="color:#64748b;">When:</span> ${when}</div>
            <div><span style="color:#64748b;">Venue:</span> ${venue}</div>
          </div>
        </div>
        <a href="${args.passUrl}" style="display:inline-block;background:#22d3ee;color:#06121f;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:9px;">View your pass</a>
        <p style="margin:22px 0 0;color:#64748b;font-size:12px;line-height:1.6;">Bring this pass — or the QR code on it — to the door for check-in. If the button doesn't work, open this link:<br><a href="${args.passUrl}" style="color:#38bdf8;word-break:break-all;">${args.passUrl}</a></p>
      </div>
    </div>
  </body>
</html>`;

  const text = [
    brand,
    "",
    `Hi ${args.participantName}, ${leadText}`,
    "",
    `Event: ${args.eventTitle}`,
    `When:  ${args.eventWhen}`,
    `Venue: ${args.eventVenue}`,
    "",
    `Your pass: ${args.passUrl}`,
    "Bring this pass (or the QR code on it) to the door for check-in.",
  ].join("\n");

  return sendEmail({ to: args.to, subject, html, text, replyTo: args.replyTo });
}
