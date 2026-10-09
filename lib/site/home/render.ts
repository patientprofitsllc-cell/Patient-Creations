import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, PRICE_CENTS, bundleSeparatelyCents, usd } from "@/lib/pricing/catalog";
import { CONTACT_EMAIL, CONTACT_PHONE_DIGITS, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { REWARD_CARD_CENTS } from "@/lib/reviews/rewardPrice";
import type { LivePrices } from "@/lib/site/faq";

// Fills the homepage's slots (lib/site/home/home.html):
//   {{slot}}      text, such as a price: every price comes from the live rows, falling back to the price list, so the
//                 homepage never disagrees with the price list or checkout;
//   <!--{{slot}}-->  a block of HTML built here from the database and config (reviews, FAQ, contact, industry links).

export function homeValues(live: LivePrices): Record<string, string> {
  const cents = (slug: keyof typeof PRICE_CENTS) => live[slug] ?? PRICE_CENTS[slug];
  const separately = bundleSeparatelyCents({
    website: cents("website-special"),
    cinematicAd: cents("cinematic-ad-special"),
    ugcAd: cents("ugc-ad-special"),
    card: cents("nfc-cards"),
  });
  return {
    "nfc-cards": usd(cents("nfc-cards")),
    "website-special": usd(cents("website-special")),
    "ugc-ad-special": usd(cents("ugc-ad-special")),
    "all-in-one-bundle": usd(cents("all-in-one-bundle")),
    "bundle-separately": usd(separately),
    "bundle-savings": usd(Math.max(0, separately - cents("all-in-one-bundle"))),
    "growth-audit": usd(AUDIT_FEE_CENTS),
    "audit-days": String(AUDIT_CREDIT_DAYS),
  };
}

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export interface HomeReview {
  rating: number;
  testimonial: string | null;
  text: string | null;
}

export interface HomeBlockData {
  /** Reviews customers allowed us to publish, newest first (the caller filters canPublish and rating). */
  reviews: HomeReview[];
  faqs: { q: string; a: string }[];
  industries: { slug: string; name: string }[];
}

/** The HTML blocks. Every piece of text is escaped: reviews are written by customers. */
export function homeBlocks({ reviews, faqs, industries }: HomeBlockData): Record<string, string> {
  // Reviews: only real ones, and the section is absent until one exists. Nothing here is ever written by us.
  const shown = reviews
    .map((r) => ({ rating: Math.max(1, Math.min(5, Math.round(r.rating))), quote: (r.testimonial ?? r.text ?? "").trim() }))
    .filter((r) => r.rating >= 4 && r.quote)
    .slice(0, 3);
  const proof = shown.length
    ? `<section class="proof" id="reviews" aria-labelledby="proof-title">
      <p class="kicker">From our customers</p>
      <h2 id="proof-title">In their <em>own words.</em></h2>
      <ul class="quotes">${shown
        .map(
          (r) => `
        <li><figure><p class="stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}<span aria-hidden="true">${"★".repeat(5 - r.rating)}</span></p><blockquote>&ldquo;${esc(r.quote)}&rdquo;</blockquote><figcaption>Verified customer</figcaption></figure></li>`,
        )
        .join("")}
      </ul>
      <p class="note">Customers who leave a review, good or bad, can get one Business Card for ${usd(REWARD_CARD_CENTS)} (plus shipping and tax) as a thank-you.</p>
    </section>`
    : "";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const faq = faqs.length
    ? `<section class="faq" id="faq" aria-labelledby="faq-title">
      <script type="application/ld+json">${JSON.stringify(faqLd).replaceAll("<", "\\u003c")}</script>
      <p class="kicker">FAQ</p>
      <h2 id="faq-title">Questions, <em>answered.</em></h2>
      <div class="faq-list">${faqs.map((f) => `
        <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
      </div>
      <p class="more"><a href="/faq">See every question</a></p>
    </section>`
    : "";

  const contact = `<div class="footer-contact">
      <p>Questions or a Business Card? Call or text Patient Profits LLC.</p>
      <a href="tel:${CONTACT_PHONE_DIGITS}">${esc(CONTACT_PHONE_DISPLAY)}</a> · <a href="sms:${CONTACT_PHONE_DIGITS}">Send a text</a> · <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>
    </div>`;

  const industriesBlock = `<nav class="footer-links" aria-labelledby="industries-title">
      <h2 id="industries-title">Websites for</h2>
      ${industries.map((i) => `<a href="/websites/${encodeURIComponent(i.slug)}">${esc(i.name)}</a>`).join("\n      ")}
      <a href="/websites">All industries</a>
    </nav>`;

  return { proof, faq, contact, industries: industriesBlock };
}

/**
 * Fills the HTML blocks and the text slots in one pass, so text that arrives in a block (a review) is never read as a
 * slot. A slot with no value throws, so a page with a blank price or a missing section is never served.
 */
export function renderHome(html: string, values: Record<string, string>, blocks: Record<string, string> = {}): string {
  const has = (o: Record<string, string>, k: string) => Object.prototype.hasOwnProperty.call(o, k);
  return html.replace(/<!--\{\{([a-z-]+)\}\}-->|\{\{([a-z-]+)\}\}/g, (_, block: string | undefined, key: string | undefined) => {
    if (block) {
      if (!has(blocks, block)) throw new Error(`homepage: no block for <!--{{${block}}}-->`);
      return blocks[block];
    }
    if (!has(values, key!)) throw new Error(`homepage: no value for {{${key}}}`);
    return values[key!];
  });
}
