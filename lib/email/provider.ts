import { db } from "@/lib/db";
import { renderTemplate, EmailTemplateKey } from "@/lib/email/templates";

export interface EmailProvider {
  name: string;
  send: (to: string, subject: string, body: string) => Promise<void>;
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
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "book@patientprofits.com",
          to,
          subject,
          html: body,
        }),
      });
    },
  };
}

async function getProvider(): Promise<EmailProvider> {
  if (process.env.RESEND_API_KEY) return resendProvider();
  return consoleProvider;
}

/**
 * Event-driven transactional email. Every send is persisted to
 * email_events regardless of provider, so lifecycle history survives even
 * in console/mock mode.
 */
export async function sendEmail(to: string, template: EmailTemplateKey, payload: Record<string, unknown>) {
  const { subject, body } = renderTemplate(template, payload);
  const provider = await getProvider();

  await provider.send(to, subject, body);

  await db.emailEvent.create({
    data: {
      toEmail: to,
      template,
      payloadJson: JSON.stringify(payload),
      provider: provider.name,
    },
  });
}
