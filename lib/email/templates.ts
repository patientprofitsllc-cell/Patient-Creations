import { CONTACT_PHONE_DISPLAY } from "@/lib/config/site";

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
  | "care_plan_started"
  | "intake_reminder"
  | "order_received"
  | "ads_plan_started"
  | "owner_new_order"
  | "test_email";

// Appended to every project-related email so a customer never has to
// wonder "is it done yet?" — one link, always current, no login required.
function statusLine(p: Record<string, unknown>) {
  return p.statusUrl ? `\n\nTrack real-time progress any time: ${p.statusUrl}` : "";
}

const TEMPLATES: Record<EmailTemplateKey, (p: Record<string, unknown>) => { subject: string; body: string }> = {
  purchase_confirmation: (p) => ({
    subject: p.intakeUrl ? "Thank you. One quick step to start your website." : "Thank you. Your creation has entered the studio.",
    body: p.intakeUrl
      ? `Thank you for choosing Patient Creations. It means a lot that you trusted a small team with your business, and we will treat "${p.projectName}" that way.

What happens next:
1. Tell us about your business. It takes about 3 to 5 minutes, and you can skip anything you don't have: ${p.intakeUrl}
2. We build your one-page website from your own words and facts. Our 72-hour target starts once we have your info.
3. You get a private preview link to approve it or ask for a change.

One thing that makes a real difference: specific answers. Your real services, your real prices, your hours, and the neighborhoods you serve are what help a local customer decide to call you.${statusLine(p)}`
      : `Thank you for choosing Patient Creations. It means a lot that you trusted a small team with your project.

"${p.projectName}" has entered production. Your private project page shows every step as it happens, and you can message us from it any time. The clearer your notes there (colors, examples you like, a line you want said), the fewer revisions you will need.${statusLine(p)}`,
  }),
  order_received: (p) => ({
    subject: "Thank you. We have your order.",
    body: `Thank you for choosing Patient Creations. We have your order for ${p.summary ?? "your project"}.

Next: your payment. We will send you ${p.paymentLabel ?? "payment"} instructions shortly, and production starts as soon as we confirm the payment. Questions? Reply to this email or call ${CONTACT_PHONE_DISPLAY}.${
      p.intakeUrl
        ? `

You can save time by telling us about your business now. It takes about 3 to 5 minutes, and you can skip anything you don't have: ${p.intakeUrl}`
        : ""
    }`,
  }),
  ads_plan_started: (p) => ({
    subject: "Thank you. Your Monthly Ads plan is active.",
    body: `Thank you for choosing Patient Creations. It means a lot that you trusted a small team with your advertising.

Your ${p.planName ?? "Monthly Ads plan"} for ${p.businessName ?? "your business"} is active.

What happens next:
1. Open your private plan page and fill in this month's brief. It takes a few minutes: what to promote, who it is for, and any style you like. You can send photos and logos by email or on a call.
2. We make your ads from your brief. Our target is about 7 business days from when we have it.
3. Your finished ads appear on the same page, with a download link, ready to post.

One thing that makes a real difference: a specific offer. A clear product, a clear price, and a clear next step give the ads something real to say.

Your private plan page (keep this link, it is how you reach your plan): ${p.manageUrl}`,
  }),
  owner_new_order: (p) => ({ subject: String(p.subject ?? "New order"), body: String(p.body ?? "") }),
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
  intake_reminder: (p) => ({
    subject: p.last ? "Last reminder: your website details." : "Your website is waiting on a few details.",
    body: `We're ready to build "${p.projectName}" as soon as we have your business details. It takes about 3 to 5 minutes, and you can skip anything you don't have:

${p.intakeUrl}

Our 72-hour target starts once we have your info. ${p.last ? "This is our last automatic reminder. If you have questions, reply to this email or call " + CONTACT_PHONE_DISPLAY + "." : "Questions? Reply to this email or call " + CONTACT_PHONE_DISPLAY + "."}${statusLine(p)}`,
  }),
  test_email: () => ({
    subject: "Test email from Patient Creations",
    body: "This is a test. If you can read this, your site can send email to customers.",
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
