export type EmailTemplateKey =
  | "purchase_confirmation"
  | "production_start"
  | "milestone"
  | "qa_entering"
  | "delivery"
  | "review_request"
  | "referral_invite"
  | "retention"
  | "preview_ready"
  | "website_live"
  | "care_plan_started";

// Appended to every project-related email so a customer never has to
// wonder "is it done yet?" — one link, always current, no login required.
function statusLine(p: Record<string, unknown>) {
  return p.statusUrl ? `\n\nTrack real-time progress any time: ${p.statusUrl}` : "";
}

const TEMPLATES: Record<EmailTemplateKey, (p: Record<string, unknown>) => { subject: string; body: string }> = {
  purchase_confirmation: (p) => ({
    subject: p.intakeUrl ? "One quick step to start your website." : "Your creation has entered the studio.",
    body: p.intakeUrl
      ? `Thanks for your order. To start building "${p.projectName}" we need a few details about your business. It takes about 3 to 5 minutes, and you can skip anything you don't have:

${p.intakeUrl}${statusLine(p)}`
      : `Thanks for your order. "${p.projectName}" has entered production with Patient Creations.${statusLine(p)}`,
  }),
  production_start: (p) => ({
    subject: "Your project is now being created.",
    body: `Production has started on "${p.projectName}".${statusLine(p)}`,
  }),
  milestone: (p) => ({
    subject: "An update on your build.",
    body: `"${p.projectName}": ${p.message ?? "reached the next stage."}${statusLine(p)}`,
  }),
  qa_entering: (p) => ({
    subject: "Your creation is entering final quality control.",
    body: `"${p.projectName}" is now in QA and Perception review.${statusLine(p)}`,
  }),
  delivery: (p) => ({
    subject: "Your creation is ready.",
    body: `"${p.projectName}" is delivered. View it in your portal.${statusLine(p)}`,
  }),
  review_request: (p) => ({
    subject: "Tell us what you think.",
    body: `We'd love your feedback on "${p.projectName}". Leave a review in your portal.${statusLine(p)}`,
  }),
  referral_invite: () => ({
    subject: "Share your creation and earn.",
    body: `Share your referral link and earn 10% commission on purchases you send our way.`,
  }),
  preview_ready: (p) => ({
    subject: p.updated ? "Your updated website preview is ready." : "Your website preview is ready.",
    body: `${p.updated ? "Your change is done. Take another look" : "Your website is built. Take a look"} and approve it, or ask for your one revision:\n\n${p.previewUrl}${statusLine(p)}`,
  }),
  website_live: (p) => ({
    subject: "Your website is live.",
    body: `"${p.projectName}" is live${p.liveUrl ? `: ${p.liveUrl}` : "."}${statusLine(p)}`,
  }),
  care_plan_started: (p) => ({
    subject: "Your website care plan is active.",
    body: `Thanks for starting the care plan for "${p.projectName}". To request an update, message us on your project page.${statusLine(p)}`,
  }),
  retention: (p) => ({
    subject: "A next step worth considering.",
    body: `Based on your last project, you might like: ${p.offer ?? "our next offer"}.`,
  }),
};

export function renderTemplate(key: EmailTemplateKey, payload: Record<string, unknown>) {
  return TEMPLATES[key](payload);
}
