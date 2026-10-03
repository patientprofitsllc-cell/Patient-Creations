// The design concepts on /examples: full one-page websites, each with its own brand, type, palette and photography, made
// to show the standard of work we deliver. They are concepts, not customer sites: the businesses are invented, the page
// says so, and there are no reviews, ratings or results on them. /examples only appears while there are enough of them to
// look like a portfolio (SHOW_EXAMPLES); everything else (the old wireframe samples) redirects to its industry page.
//
// Photography: generated for these concepts and served from the image host through Next's image optimiser (see
// next.config.mjs remotePatterns). Pure data: safe in the browser, the server and tests.

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FkWSa3GVMBCZmq6h3uM5YfOKE8";
const img = (file: string) => `${CDN}/${file}`;

export interface ConceptImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Concept {
  /** Also the URL: /examples/<slug>. Kept equal to the industry slug so /websites/<slug> pairs with it. */
  slug: "barbers" | "restaurants" | "local-retail";
  industry: string;
  /** The invented business the concept is designed for. */
  brand: string;
  monogram: string;
  kicker: string;
  headline: [string, string];
  intro: string;
  cta: string;
  nav: string[];
  hero: ConceptImage;
  gallery: [ConceptImage, ConceptImage];
  offerTitle: string;
  offers: { name: string; note: string; detail: string }[];
  storyTitle: string;
  story: string;
  visit: { label: string; value: string }[];
  /** What this concept shows a business owner about the design choices. */
  notes: string[];
  theme: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
    /** "serif" headlines use the italic accent face; "sans" stays light and tight. */
    display: "serif" | "sans";
  };
}

export const CONCEPTS: Concept[] = [
  {
    slug: "barbers",
    industry: "Barbershop",
    brand: "Ironwood Barber Co.",
    monogram: "IB",
    kicker: "Est. for the neighborhood",
    headline: ["Sharp cuts.", "Lasting impressions."],
    intro: "Classic cuts, hot-towel shaves and clean fades, booked in two taps. Walk in sharp, walk out sharper.",
    cta: "Book a chair",
    nav: ["Services", "The shop", "Visit"],
    hero: { src: img("hf_20261003_155655_185f1399-10f7-47b1-9763-8bcbde4eb189.png"), alt: "A warm, wood-and-brass barbershop interior with leather chairs", width: 1344, height: 752 },
    gallery: [
      { src: img("hf_20261003_155656_d3ad97a1-577e-43d0-9a89-169b9a47e960.png"), alt: "A barber lining up a fade with a straight razor", width: 896, height: 1120 },
      { src: img("hf_20261003_155656_4a677e1b-d276-4da4-ae9a-ffe38584e7a2.png"), alt: "Barber tools laid out on walnut", width: 896, height: 1120 },
    ],
    offerTitle: "The menu",
    offers: [
      { name: "Signature cut", note: "45 min", detail: "Consultation, cut, hot towel and style." },
      { name: "Skin fade", note: "45 min", detail: "Seamless blend, razor line-up." },
      { name: "Hot-towel shave", note: "30 min", detail: "Pre-shave oil, straight razor, cold finish." },
      { name: "Cut and beard", note: "60 min", detail: "The full refresh, shaped and lined." },
    ],
    storyTitle: "A chair worth coming back to.",
    story: "Three chairs, no rush. Every cut starts with a conversation and ends with a hot towel. Book online, or walk in and we'll fit you in.",
    visit: [
      { label: "Hours", value: "Tue to Sat · 9 to 7" },
      { label: "Find us", value: "Main Street, downtown" },
      { label: "Booking", value: "Online, any time" },
    ],
    notes: ["Book button in the first screen and in the header", "Services read like a menu, with times", "Dark, warm palette that matches the shop"],
    theme: { bg: "#0f1210", surface: "#171c18", text: "#efe9df", muted: "#a59f93", accent: "#c79a5b", accentText: "#14110c", display: "serif" },
  },
  {
    slug: "restaurants",
    industry: "Restaurant",
    brand: "Ember & Vine",
    monogram: "E&V",
    kicker: "Wood-fired kitchen · Wine bar",
    headline: ["Good food.", "Great company."],
    intro: "Seasonal plates from the wood oven, a short list of honest wines, and a table that's always worth the wait.",
    cta: "Reserve a table",
    nav: ["Menu", "The room", "Visit"],
    hero: { src: img("hf_20261003_155655_a21f61b2-14a8-4eab-93f3-f557c77a4066.png"), alt: "A wood-fired roast chicken with vegetables, bread and red wine by candlelight", width: 1344, height: 752 },
    gallery: [
      { src: img("hf_20261003_155656_96f5227c-ee68-4c84-b040-0a1142248c33.png"), alt: "A warm terracotta dining room with an open kitchen", width: 896, height: 1120 },
      { src: img("hf_20261003_155656_c800bb78-7acb-4a6a-9cab-8e8b5f1d0051.png"), alt: "A chef plating handmade pasta", width: 896, height: 1120 },
    ],
    offerTitle: "From the oven",
    offers: [
      { name: "Half roast chicken", note: "Signature", detail: "Herb butter, charred greens, pan jus." },
      { name: "Hand-cut pappardelle", note: "Made daily", detail: "Slow ragù, aged parmesan." },
      { name: "Wood-fired vegetables", note: "Seasonal", detail: "Whatever the market brought in." },
      { name: "Olive oil cake", note: "To finish", detail: "Citrus, crème fraîche." },
    ],
    storyTitle: "Pull up a chair.",
    story: "A small room with a big oven. We cook what's good this week, pour wines we'd drink ourselves, and keep a few tables for walk-ins every night.",
    visit: [
      { label: "Dinner", value: "Wed to Sun · 5 to 10" },
      { label: "Find us", value: "On the corner of Oak & 3rd" },
      { label: "Parties", value: "Private dining for up to 20" },
    ],
    notes: ["Food photography leads, because that's what sells a table", "Reserve button stays in reach on every phone", "Menu highlights instead of a hard-to-read PDF"],
    theme: { bg: "#1a120d", surface: "#24180f", text: "#f6ede2", muted: "#bba893", accent: "#d9784a", accentText: "#1a0f08", display: "serif" },
  },
  {
    slug: "local-retail",
    industry: "Local shop",
    brand: "Wren & Co. Goods",
    monogram: "W&C",
    kicker: "Local · Original · Handmade",
    headline: ["Something", "worth discovering."],
    intro: "Ceramics, linen and small-batch goods from makers we know by name. Stop by, or shop the shelf online.",
    cta: "Shop the shelf",
    nav: ["Collections", "Makers", "Visit"],
    hero: { src: img("hf_20261003_155656_fd3b1ac5-f57d-4f59-930a-1795c9255b01.png"), alt: "A calm boutique with ceramics and plants on oak shelves", width: 1344, height: 752 },
    gallery: [
      { src: img("hf_20261003_155656_6d882673-757e-4c04-9ad2-4f1bafcaa683.png"), alt: "Handmade stoneware mugs and a vase on an oak shelf", width: 896, height: 1120 },
      { src: img("hf_20261003_155657_75337e6f-6f7c-42a6-bd86-2e5884d780dc.png"), alt: "A green shopfront on a tree-lined street", width: 896, height: 1120 },
    ],
    offerTitle: "On the shelf",
    offers: [
      { name: "Stoneware", note: "Handmade", detail: "Mugs, bowls and vases from local potters." },
      { name: "Linen", note: "Small batch", detail: "Napkins, throws and aprons." },
      { name: "Candles", note: "Hand-poured", detail: "Soy wax, cotton wicks." },
      { name: "Gift boxes", note: "Made to order", detail: "Wrapped and ready to give." },
    ],
    storyTitle: "Made by people, not factories.",
    story: "Every piece in the shop has a maker behind it. We tell their stories on the shelf and online, so you know exactly where your things come from.",
    visit: [
      { label: "Open", value: "Daily · 10 to 6" },
      { label: "Find us", value: "Elm Street, in the old bakery" },
      { label: "Pickup", value: "Order online, collect in store" },
    ],
    notes: ["Product photography in soft daylight to match the shop", "Shop and Visit side by side for online and walk-in buyers", "Maker stories that give people a reason to buy local"],
    theme: { bg: "#eef0e8", surface: "#e2e6d9", text: "#232a1f", muted: "#5d6655", accent: "#3f5a3a", accentText: "#f3f1ea", display: "sans" },
  },
];

/** /examples is only shown (and linked) while it has a full set of finished concepts. */
export const SHOW_EXAMPLES = CONCEPTS.length >= 3;

export const getConcept = (slug: string) => CONCEPTS.find((c) => c.slug === slug);
