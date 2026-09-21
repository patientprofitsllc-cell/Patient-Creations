import { CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

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
  | "owner_audit_lead"
  | "deposit_received"
  | "partner_application_received"
  | "partner_approved"
  | "partner_declined"
  | "partner_payout_sent"
  | "invoice_issued"
  | "invoice_paid"
  | "balance_due_ready"
  | "growth_audit_ready"
  | "audit_followup_1"
  | "audit_followup_2"
  | "abandoned_checkout"
  | "checkin_7d"
  | "recommend_30d"
  | "test_email";

// Appended to every project-related email so a customer never has to
// wonder "is it done yet?" — one link, always current, no login required.
function statusLine(p: Record<string, unknown>) {
  return p.statusUrl ? `\n\nTrack real-time progress any time: ${p.statusUrl}` : "";
}

/** The legal footer every follow-up carries: who we are, where we are, and how to stop these emails. */
function footerOf(p: Record<string, unknown>): string {
  return p.footer ? `\n\n${String(p.footer)}` : "";
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
2. We make your ads from your brief. Our target is ${p.deliveryTarget ?? "about 7 to 14 business days"} from when we have it.
3. Your finished ads appear on the same page, with a download link, ready to post.

One thing that makes a real difference: a specific offer. A clear product, a clear price, and a clear next step give the ads something real to say.

Your private plan page (keep this link, it is how you reach your plan): ${p.manageUrl}`,
  }),
  owner_new_order: (p) => ({ subject: String(p.subject ?? "New order"), body: String(p.body ?? "") }),
  partner_application_received: (p) => ({
    subject: "We received your partner application",
    body: `Hi ${String(p.name ?? "")},

Thank you for applying to the Patient Creations partner program. We read every application, and we will email you once we have decided. If you have questions in the meantime, reply to this email or call ${CONTACT_PHONE_DISPLAY}.`,
  }),
  partner_approved: (p) => ({
    subject: "You are in: your Patient Creations partner link",
    body: `Hi ${String(p.name ?? "")},

Welcome to the Patient Creations partner program.

Your private dashboard (bookmark it, and do not share it): ${p.dashboardUrl}
Your partner link: ${p.link}

You earn ${p.percent}% of what a customer you refer pays on their one-time orders, for a year after their first paid order. Each commission is held for ${p.days} days in case of a refund, and it is approved once the customer's whole order is paid. Your dashboard shows every step. We pay approved commissions by hand and email you when we do.

Always say you may earn a commission when you share your link, and please do not promise results. The dashboard has ready-made words and the full rules.

Questions? Reply to this email.`,
  }),
  partner_declined: (p) => ({
    subject: "About your partner application",
    body: `Hi ${String(p.name ?? "")},

Thank you for your interest in the Patient Creations partner program. We are not able to bring you on right now. You are welcome to apply again in the future, and if you would like to talk about it, reply to this email.`,
  }),
  partner_payout_sent: (p) => ({
    subject: `Your partner payout of ${p.amount} was sent`,
    body: `Hi ${String(p.name ?? "")},

We paid ${p.amount} for ${p.count} approved commission${Number(p.count) === 1 ? "" : "s"}. How: ${p.ref}

You can see it on your dashboard: ${p.dashboardUrl}

Thank you for sending people our way.`,
  }),
  deposit_received: (p) => ({
    subject: "Deposit received. Your build has started.",
    body: `Thank you. We received your ${p.deposit} deposit, and "${p.projectName}" is now in production.

The remaining ${p.balance} is due before we release the final files or launch your site. There is nothing to do about it now. We will email you when your build is ready, and you can also pay any time at this private link: ${p.invoiceUrl}

If you have questions about your payment, reply to this email or call ${CONTACT_PHONE_DISPLAY}.${statusLine(p)}`,
  }),
  invoice_issued: (p) => ({
    subject: `Invoice ${p.number}: ${p.amount}`,
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

Here is an invoice for ${p.amount}: ${p.description}

You can pay by card at this private link: ${p.invoiceUrl}

Questions? Reply to this email or call ${CONTACT_PHONE_DISPLAY}.`,
  }),
  invoice_paid: (p) => ({
    subject: `Payment received. Thank you (${p.number})`,
    body: `Thank you. We received your payment of ${p.amount} for invoice ${p.number}: ${p.description}

${p.settled ? (p.released ? "Your order is now paid in full, and your final files have been released. Check your project page and your email for the delivery." : "Your order is now paid in full. If your build is still waiting to launch, we will take care of that next.") : "Your order total has been updated to include this work."}

Keep this email as your receipt. Questions? Reply to it or call ${CONTACT_PHONE_DISPLAY}.`,
  }),
  balance_due_ready: (p) => ({
    subject: p.beforeLaunch ? "Your preview is ready. Final payment is due before launch." : "Your build is finished. Final payment releases it.",
    body: `Good news: "${p.projectName}" is finished.

The final payment of ${p.amount} ${p.beforeLaunch ? "is due before we launch your site. You can look over your preview now and pay when you are ready" : "releases your final files as soon as it is paid, and delivery happens automatically"}. Pay by card at your private link: ${p.invoiceUrl}

Questions? Reply to this email or call ${CONTACT_PHONE_DISPLAY}.`,
  }),
  owner_audit_lead: (p) => ({ subject: String(p.subject ?? "New growth audit"), body: String(p.body ?? "") }),
  audit_followup_1: (p) => ({
    subject: "Any questions about your growth audit?",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

A couple of days ago we sent your Growth Audit for ${String(p.business ?? "your business")}.${p.top ? ` The first thing we suggested was ${String(p.top)}.` : ""}

If anything in it was unclear, or you would like to talk it through, reply to this email or call ${CONTACT_PHONE_DISPLAY}. A Strategy Session (${usd(PRICE_CENTS["strategy-session"])}) is a live call where we map out what to build first.

No pressure either way.${footerOf(p)}`,
  }),
  audit_followup_2: (p) => ({
    subject: "One last note about your audit",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

This is the last note from us about your Growth Audit, so we do not clutter your inbox. If growing ${String(p.business ?? "your business")} is on your list, we are here: reply to this email or call ${CONTACT_PHONE_DISPLAY}.

Thank you for taking a look.${footerOf(p)}`,
  }),
  abandoned_checkout: (p) => ({
    subject: "Your order is still waiting",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

You started an order for ${String(p.product ?? "a Patient Creations product")} and did not finish. It is still there if you want it:

${String(p.link ?? "")}

If something stopped you, such as a question, the price, or the timing, reply to this email and we will help. No pressure.${footerOf(p)}`,
  }),
  checkin_7d: (p) => ({
    subject: "How is everything going?",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

It has been about a week since "${String(p.project ?? "your project")}" was delivered. How is it going? If there is anything you would change, or a question we can answer, just reply to this email.${p.statusUrl ? `\n\nYour project page: ${String(p.statusUrl)}` : ""}

Thank you for trusting us with it.${footerOf(p)}`,
  }),
  recommend_30d: (p) => ({
    subject: "Here is what we recommend next",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

Thanks again for your order. Based on what you bought, these fit next. They are all optional:

${String(p.offers ?? "")}

Questions, or want to talk one through? Reply to this email or call ${CONTACT_PHONE_DISPLAY}.${footerOf(p)}`,
  }),
  growth_audit_ready: (p) => ({
    subject: "Your Growth Audit Is Ready",
    body: `Hi${p.name ? ` ${String(p.name)}` : ""},

Thank you for ordering a Patient Creations Growth Audit. Here it is.

${String(p.report ?? "")}
${p.creditCode ? `
YOUR CREDIT: ${String(p.creditAmount ?? "")} toward your first order
Code: ${String(p.creditCode)}
Enter it in the coupon box at checkout. It works once, for ${String(p.creditDays ?? 30)} days, so if you were going to buy anyway, the audit cost you nothing.
` : ""}
${p.reportUrl ? `Your private copy of this report: ${String(p.reportUrl)}\n\n` : ""}When you are ready, see what we build and what it costs: ${String(p.plansUrl ?? "")}

Questions? Reply to this email or call ${CONTACT_PHONE_DISPLAY}.

You asked for this audit, so we sent it. If you would rather not hear from us again, reply "no thanks" and we will stop.`,
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
    body: `"${p.projectName}" is live${p.liveUrl ? `: ${p.liveUrl}` : "."}${p.statusUrl ? `\n\nKeep your site running: Website Care is ${usd(PRICE_CENTS["care-plan"])} a month. Small updates are handled for you every month, so you never have to manage the site yourself. You can start it from your project page, and cancel any time.` : ""}${statusLine(p)}`,
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
