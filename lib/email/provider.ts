import { db } from "@/lib/db";
import { renderTemplate, EmailTemplateKey } from "@/lib/email/templates";
import { CONTACT_EMAIL } from "@/lib/config/site";

export interface SendResult {
  ok: boolean;
  provider: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send: (to: string, subject: string, body: string) => Promise<void>;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Turns a plain-text email into simple HTML: paragraphs, line breaks, and
 * clickable web links. Everything is escaped first, so nothing in the text can
 * inject markup.
 */
export function emailBodyToHtml(body: string): string {
  const linked = escapeHtml(body).replace(/https?:\/\/[^\s<]+/g, (url) => {
    const trailing = /[.,;:!?)]+$/.exec(url)?.[0] ?? "";
    const clean = trailing ? url.slice(0, -trailing.length) : url;
    return `<a href="${clean}">${clean}</a>${trailing}`;
  });
  return linked
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const consoleProvider: EmailProvider = {
  name: "console",
  send: async (to, subject, body) => {
    // eslint-disable-next-line no-console
    console.log(`[email:console] to=${to} subject="${subject}"\n${body}\n`);
  },
};

async function resendProvider(): Promise<EmailProvider> {
  return {
    name: "resend",
    send: async (to, subject, body) => {
      const apiKey = process.env.RESEND_API_KEY!;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "book@patientprofits.com",
          to,
          // Replies go to the owner's inbox even though the sending address is on the verified domain.
          reply_to: process.env.EMAIL_REPLY_TO?.trim() || CONTACT_EMAIL,
          subject,
          text: body,
          html: emailBodyToHtml(body),
        }),
      });
      // A rejected send (unverified domain, bad key, invalid address) must not look like a success.
      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        throw new Error(`Resend answered ${res.status}${detail ? `: ${detail}` : ""}`);
      }
    },
  };
}

async function getProvider(): Promise<EmailProvider> {
  if (process.env.RESEND_API_KEY) return resendProvider();
  return consoleProvider;
}

/**
 * Event-driven transactional email. Every attempt is persisted to email_events
 * with its outcome. A failure never throws: an order or a build must not break
 * because an email couldn't go out. It is recorded as FAILED, the team is told
 * (at most once an hour), and the caller gets `ok: false` so it can react.
 */
export async function sendEmail(to: string, template: EmailTemplateKey, payload: Record<string, unknown>): Promise<SendResult> {
  const { subject, body } = renderTemplate(template, payload);
  const provider = await getProvider();

  let error: string | undefined;
  try {
    await provider.send(to, subject, body);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  try {
    await db.emailEvent.create({
      data: {
        toEmail: to,
        template,
        payloadJson: JSON.stringify(error ? { ...payload, error } : payload),
        provider: provider.name,
        status: error ? "FAILED" : "SENT",
      },
    });
    if (error) {
      const recent = await db.notification.count({
        where: { audience: "admin", title: "Email failed to send", createdAt: { gt: new Date(Date.now() - 3_600_000) } },
      });
      if (recent === 0) {
        await db.notification.create({
          data: {
            audience: "admin",
            title: "Email failed to send",
            body: `A "${template}" email to a customer failed (${error}). Check your sending domain and key in Resend, and use "Send a test email" on System Health.`,
          },
        });
      }
    }
  } catch (logErr) {
    console.error("could not record email outcome", logErr);
  }

  if (error) console.error(`email to ${to} (${template}) failed: ${error}`);
  return { ok: !error, provider: provider.name, ...(error ? { error } : {}) };
}
