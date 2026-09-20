// The voice guide's script: every line the guide can speak, one per page or product, plus two chat lines.
// This is the "prompt list". The audio is recorded once from these exact words (never generated live), so the
// timing of every line is known before a visitor arrives.
//
// Rules the tests enforce, so a recording can never go stale or say something untrue:
//   - no digits, dollar signs, or percent signs: prices, counts, and times change, and a recording cannot;
//     the screen always shows the real numbers
//   - no promised results, no tool or vendor names, no dashes used as punctuation
//   - every product that can be sold, and every public page, has a line
//   - a recording is only used while the words it was made from are unchanged (see manifest textSha)

export type CueKind = "page" | "product" | "chat";

export interface CueDef {
  id: string;
  kind: CueKind;
  /** Where it plays, in plain words, for the printed script. */
  when: string;
  /** Exactly what is spoken. */
  text: string;
}

export const VOICE_SCRIPT: readonly CueDef[] = [
  // Pages
  {
    id: "home",
    kind: "page",
    when: "Home page",
    text: "Welcome to Patient Creations. We build cinematic websites, ads, and AI tools for small businesses. Look around, and tap any card to see what it includes.",
  },
  {
    id: "services",
    kind: "page",
    when: "Services page",
    text: "This is everything we build, from a simple website to full AI systems. Each card lists what is included and what is not, so there are no surprises.",
  },
  {
    id: "pricing",
    kind: "page",
    when: "Pricing page",
    text: "Here is how our pricing works. Every price is shown up front, and each optional extra says exactly what it adds.",
  },
  {
    id: "monthly-ads",
    kind: "page",
    when: "Monthly Ads page",
    text: "Monthly Ads gives you a fresh batch of ads every month. Pick the plan that fits, and you can cancel any time.",
  },
  {
    id: "showcase",
    kind: "page",
    when: "Gallery, Examples, and Websites pages",
    text: "Here are examples of our work. Browse them for ideas, and picture how they could look for your business.",
  },
  {
    id: "checkout",
    kind: "page",
    when: "Checkout, for a product without its own line",
    text: "You are almost done. Check your order, add any extras you like, and pay securely.",
  },
  {
    id: "success",
    kind: "page",
    when: "Order confirmation page",
    text: "Thank you. Your order is in. Follow the next step on screen, and we will take it from there.",
  },

  // Products (spoken on the checkout page for that product, and on the Monthly Ads start page)
  {
    id: "site",
    kind: "product",
    when: "Cinematic AI Website",
    text: "The Cinematic AI Website is a multi page site with a motion hero, built around your business. Pick the tier that fits.",
  },
  {
    id: "saas",
    kind: "product",
    when: "AI Software and App",
    text: "AI Software turns your idea into a working app. What is included, and what each tier adds, is listed on screen.",
  },
  {
    id: "agents",
    kind: "product",
    when: "Multi Agent System, and the Agents page",
    text: "The Multi Agent System builds a team of AI helpers that work together on your tasks. What is included is listed on screen.",
  },
  {
    id: "ad",
    kind: "product",
    when: "Cinematic Ad",
    text: "The Cinematic Ad is a short, scroll stopping video made for social media, in the tier you choose.",
  },
  {
    id: "rental-listing-film",
    kind: "product",
    when: "Rental Listing Film",
    text: "The Rental Listing Film is a cinematic video tour of your rental, made with AI from your listing photos.",
  },
  {
    id: "lead-engine",
    kind: "product",
    when: "Lead Engine",
    text: "The Lead Engine is built to help you capture new leads. See exactly what is included, and what is not, on screen.",
  },
  {
    id: "payments-setup",
    kind: "product",
    when: "Payments Setup",
    text: "Payments Setup gets you ready to take payments online. The steps we handle are listed on screen.",
  },
  {
    id: "basic-package",
    kind: "product",
    when: "Basic Package",
    text: "The Basic Package gives you drone style videos of your building and storefront, made with AI from your photos, plus NFC cards.",
  },
  {
    id: "starter-website",
    kind: "product",
    when: "Quick Business Website",
    text: "The Quick Business Website is a one page site with your services, contact details, and a call button, built from your own words.",
  },
  {
    id: "strategy-session",
    kind: "product",
    when: "Strategy Session",
    text: "The Strategy Session is a live call to map out what to build first for your business.",
  },
  {
    id: "custom-build",
    kind: "product",
    when: "Custom Build Consultation",
    text: "The Custom Build Consultation is a call about anything beyond our menu, and the fee is credited toward the build.",
  },
  {
    id: "cinematic-ad-special",
    kind: "product",
    when: "Cinematic Ad Special",
    text: "The Cinematic Ad Special is one polished video ad for a single product or offer, at a special price.",
  },
  {
    id: "ugc-ad-special",
    kind: "product",
    when: "UGC Ad Special",
    text: "The UGC Ad Special is a creator style ad with an AI presenter, with a few opening hooks for you to test.",
  },
  {
    id: "all-in-one-bundle",
    kind: "product",
    when: "All in One Launch Bundle",
    text: "The All in One Launch Bundle packs a website, ads, and NFC cards into one fixed price, so you can launch everything at once.",
  },
  {
    id: "nfc-cards",
    kind: "product",
    when: "NFC cards, every design",
    text: "NFC cards let a customer tap their phone to open your review page, menu, or link. You pick your designs after checkout.",
  },
  {
    id: "ads-plan",
    kind: "product",
    when: "Monthly Ads plan, on the start page",
    text: "You are starting a Monthly Ads plan. After you pay, you fill in a short brief, and we make your ads from it.",
  },

  // Chat, on a customer's private project page
  {
    id: "chat-welcome",
    kind: "chat",
    when: "Private project page, when it opens",
    text: "This is your project page. Ask me about progress or timing, and I will pass anything else to our team.",
  },
  {
    id: "chat-reply",
    kind: "chat",
    when: "Private project page, when a new reply arrives",
    text: "You have a new reply on your project page.",
  },
];

export const CUE_IDS: readonly string[] = VOICE_SCRIPT.map((c) => c.id);

export const cueById = (id: string): CueDef | undefined => VOICE_SCRIPT.find((c) => c.id === id);
