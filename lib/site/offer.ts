// The acquisition offer and the copy that surrounds it. Price is never here:
// it is read from the product row (slug below), so changing it in the database
// changes it everywhere at once.
export const OFFER_SLUG = "starter-website";
export const OFFER_NAME = "Quick Business Website";
export const OFFER_CHECKOUT_HREF = `/checkout?product=${OFFER_SLUG}`;

export const OFFER_INCLUDES = [
  "Custom one-page design",
  "Mobile optimization",
  "Business-specific copy",
  "Services and products section",
  "Contact information",
  "Call and text button",
  "Social links",
  "Map and location",
  "Basic SEO setup",
  "Deployed live",
  "One revision",
];

export const TRUST_ITEMS = [
  "One-page business website",
  "Mobile optimized",
  "SEO-ready foundation",
  "72-hour target delivery",
  "One revision included",
];

// Honest timing language: a target, tied to when we have what we need.
export const DELIVERY_NOTE =
  "72-hour target delivery once we have your business info. It can take longer if we're waiting on you or something outside our control delays it.";

export const PROBLEMS = [
  "You don't have a website yet",
  "Your website looks outdated",
  "Your site doesn't work well on phones",
  "Customers can't find your hours, prices, or location",
  "There's no clear call or text button",
  "There's no way to book or ask for a quote",
  "Your first impression is costing you trust",
  "Your social media is doing all the work",
];

export const BUSINESS_TYPES = [
  "Barbershop",
  "Beauty salon",
  "Restaurant or food",
  "Contractor",
  "Pressure washing",
  "Landscaping",
  "Auto detailing",
  "Real estate",
  "Photography",
  "Personal training or fitness",
  "Cleaning company",
  "Local retail",
  "Other",
];

export const WEBSITE_GOALS: { value: string; label: string }[] = [
  { value: "CALL", label: "Call me" },
  { value: "TEXT", label: "Text me" },
  { value: "BOOK", label: "Book an appointment" },
  { value: "QUOTE", label: "Request a quote" },
  { value: "VISIT", label: "Visit my location" },
  { value: "BUY", label: "Buy something" },
  { value: "FORM", label: "Fill out a form" },
  { value: "OTHER", label: "Something else" },
];

// Price is passed in (already formatted) so the copy always matches the live product row.
export function getFaqs(price: string) {
  return [
  {
    q: `What's included in the ${price} website?`,
    a: "A custom one-page website with your services or products, contact details, a call and text button, social links, a map, basic SEO setup, and deployment so it's live, plus one revision. It's built around your business, not a template with your name dropped in.",
  },
  {
    q: "How long does it take?",
    a: "Our target is 72 hours once we have your business information. That's a target, not a guarantee: it can take longer if we're waiting on details from you or something outside our control gets in the way. You'll see progress on your private project page the whole time.",
  },
  {
    q: "What do I need to give you?",
    a: "The basics: your business name, what you do, your phone number, and your hours. It helps to have your services, prices, social links, a logo, and a few photos, but you can skip anything you don't have. The intake takes about 3 to 5 minutes.",
  },
  {
    q: "How do revisions work?",
    a: `You'll get a private preview before anything goes live. The ${price} website includes one reasonable revision round: tell us what you'd like changed and we'll update it. If you'd like more changes after that, we'll quote them separately.`,
  },
  {
    q: "Do I need a domain? What about hosting?",
    a: "If you already own a domain, tell us and we'll help you connect it. If you don't, we'll help you choose one. We deploy your site live at launch. Ongoing hosting, updates, and monitoring after that are separate; ask us and we'll walk you through the options.",
  },
  {
    q: "Will this get me to the top of Google?",
    a: "We set up the basic search foundations (page title, description, headings, and mobile speed) so Google can understand your site. Nobody can guarantee rankings, and we won't promise them.",
  },
  {
    q: "Can I add more later, like ads or online booking?",
    a: "Yes. Once you're live we can help with search visibility, short video ads, lead capture, and automation. It's all optional and priced separately, and none of it is required to get your website.",
  },
  {
    q: "What happens after I pay?",
    a: "You'll get a private project link and a short intake to fill in. Once we have your information, we build, check, and send you a private preview. You approve it or request your revision, and then we launch it.",
  },
];
}
