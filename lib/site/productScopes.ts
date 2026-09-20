// What each build includes and does not include, stated once. The service cards, the checkout
// page, and the product rows in the database all read from here, so a customer is told the
// same thing everywhere, and so we can be held to exactly what is written.
//
// Pure text: safe to use in the browser, the seed script, and tests. Revision rounds here match
// the `revisionLimit` on each product in prisma/seed.ts (a test keeps them in step).

export interface ProductScope {
  /** The one line shown as the product's description. */
  summary: string;
  includes: string[];
  notIncluded: string[];
  /** What the higher tiers add on top of the base tier, by tier name. */
  tierAdds?: { Signature: string[]; Flagship: string[] };
}

export const PRODUCT_SCOPES: Record<string, ProductScope> = {
  site: {
    summary: "A multi-page website with a cinematic motion hero, built around your business.",
    includes: [
      "Up to 5 pages (for example Home, About, Services, Gallery or Work, and Contact)",
      "A cinematic looping hero on your home page",
      "Layout made for phones first, and fast on slow connections",
      "Website copy written from the facts you give us",
      "A contact form that emails you each enquiry",
      "Basic search setup: page titles, descriptions, and headings",
      "2 revision rounds",
      "Deployed live, or delivered ready to publish on your own hosting",
    ],
    notIncluded: [
      "An online store or booking system",
      "Logo or brand design (the Brand Kit add-on covers it)",
      "Ongoing hosting or updates (the Website Care Plan covers updates)",
      "Custom software features",
      "Any promise about search rankings or sales",
    ],
    tierAdds: {
      Signature: ["Up to 8 pages", "A gallery, blog, or portfolio section", "A booking or scheduling link connected"],
      Flagship: ["Up to 12 pages", "Cinematic motion sections on more than one page", "A short strategy call before we start"],
    },
  },
  saas: {
    summary: "A working web app for one core workflow, built to launch.",
    includes: [
      "One core workflow, fully working (for example bookings, quotes, a client portal, or an internal tool)",
      "Up to 8 screens, made to work on phones and computers",
      "Email sign-in and user accounts",
      "One payment setup with Stripe (one-time or monthly)",
      "One AI feature, using your own AI provider account",
      "An admin view so you can see users and activity",
      "Deployed on accounts you own, with the source code handed over to you",
      "3 revision rounds",
    ],
    notIncluded: [
      "Native iPhone or Android apps",
      "More than one core workflow",
      "Integrations beyond payments and the one AI feature (quoted separately)",
      "Moving data in from an old system",
      "Ongoing hosting, maintenance, or support",
      "Usage costs charged by your hosting, payment, or AI providers",
    ],
    tierAdds: {
      Signature: ["Up to 15 screens", "Up to 3 integrations", "Two user roles (for example customer and staff)"],
      Flagship: ["Up to 25 screens", "Up to 5 integrations", "Three user roles", "A written technical handover and one training call"],
    },
  },
  agents: {
    summary: "Up to 3 AI agents working together on one business process, with your approval where it matters.",
    includes: [
      "A written map of the process we are automating",
      "Up to 3 AI agents, each with one clear job",
      "Connections to up to 3 of the tools you already use (for example email, a calendar, a spreadsheet, or a CRM)",
      "A human approval step before anything is sent to a customer or money is involved",
      "Testing on your real examples before it goes live",
      "A written guide and one walkthrough call",
      "3 revision rounds",
    ],
    notIncluded: [
      "Agents that act on their own with money or customer messages",
      "More than one business process (quoted separately)",
      "Usage costs for AI and tool accounts, which you pay directly",
      "Ongoing monitoring or tuning after handover",
      "Any promise of time saved or results",
    ],
    tierAdds: {
      Signature: ["Up to 5 agents and 5 connected tools"],
      Flagship: ["Up to 8 agents and 8 connected tools", "Two business processes"],
    },
  },
  "payments-setup": {
    summary: "Start taking card payments on your website or app through Stripe.",
    includes: [
      "Stripe connected to your site or app (one-time payments, or one monthly subscription)",
      "Up to 3 products or prices set up",
      "A full test run in test mode before going live",
      "Payment confirmation and failed payment handling",
      "A short guide to your Stripe dashboard",
      "1 revision round",
    ],
    notIncluded: [
      "Sales tax or legal advice",
      "Other payment processors",
      "Custom invoicing, marketplaces, or payouts to other people",
      "Stripe's own fees, which you pay directly",
      "Handling disputes or chargebacks for you",
    ],
    tierAdds: {
      Signature: ["Up to 10 products, coupons, and a customer billing portal"],
      Flagship: ["Up to 25 products, several subscription plans, and custom confirmation pages"],
    },
  },
  "lead-engine": {
    summary: "A system to capture new leads and send them straight to you.",
    includes: [
      "One landing page for one offer",
      "A lead form that emails you each new lead at once",
      "A simple follow up sequence of up to 3 emails to each lead",
      "Every lead saved in a spreadsheet you own",
      "Tracking so you can see which link each lead came from",
      "2 revision rounds",
    ],
    notIncluded: [
      "Ad spend, or running ads for you",
      "Buying or scraping lead lists",
      "Any promise of how many leads you will get, or how good they are",
      "Text message follow up (it needs a separate messaging setup)",
      "Ongoing management",
    ],
    tierAdds: {
      Signature: ["Up to 2 landing pages", "Up to 5 follow up emails", "A booking calendar link"],
      Flagship: ["Up to 3 landing pages", "Up to 8 follow up emails", "A booking calendar link"],
    },
  },
  "automation-add-on": {
    summary: "Connect your build to lead routing and email automation.",
    includes: ["Up to 2 automations (for example a new lead alert plus a welcome email)", "Testing and a short written guide", "1 revision round"],
    notIncluded: ["Ongoing monitoring", "Subscriptions for the tools involved", "More than 2 automations (quoted separately)"],
  },
  "rental-listing-film": {
    summary: "A cinematic video tour of your rental, made with AI from your listing photos.",
    includes: [
      "1 video, up to 45 seconds, delivered wide and vertical",
      "Made with AI from the photos and details you send",
      "A caption and headline options written for you",
      "1 revision round",
    ],
    notIncluded: ["Filming on location or real drone footage", "Music rights or licensed music", "Any promise of bookings"],
  },
};

export const SCOPED_SLUGS = Object.keys(PRODUCT_SCOPES);

export function scopeFor(slug: string): ProductScope | undefined {
  return PRODUCT_SCOPES[slug];
}
