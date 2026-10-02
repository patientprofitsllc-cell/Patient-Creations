// What one ad from the per-ad specials includes, stated once. The homepage card, the product
// rows in the database, and the All-in-One bundle all read from here, so they can't drift.
// Pure text: safe to use in the browser, the seed script, and tests.

import { BUNDLE_PARTS } from "../pricing/catalog";

export type AdSpecialKind = "cinematic" | "ugc";

export const AD_SPECIAL_INCLUDES: Record<AdSpecialKind, string> = {
  cinematic: "Each ad: up to 30 seconds, delivered wide and vertical, with a caption and headline options written for you.",
  ugc: "Each ad: made with an AI presenter, up to 30 seconds, with 3 opening-hook variations to test, delivered vertical and square, with a caption and headline options.",
};

export const AD_SPECIAL_BLURB: Record<AdSpecialKind, string> = {
  cinematic: "Polished, film-style spot",
  ugc: "Creator style, 3 hook variations",
};

export const CINEMATIC_SPECIAL_DESCRIPTION = `A cinematic, scroll-stopping ad, priced per ad. Choose how many you want. ${AD_SPECIAL_INCLUDES.cinematic}`;
export const UGC_SPECIAL_DESCRIPTION = `A creator-style ad that looks like a customer made it, priced per ad. Choose how many you want. ${AD_SPECIAL_INCLUDES.ugc}`;

const P = BUNDLE_PARTS;
export const BUNDLE_ITEMS = [
  "A Website Special with 3 months of maintenance",
  `${P.cinematicAds} Cinematic Ads`,
  `${P.ugcAds} UGC Ads (3 hook variations each)`,
  `${P.cards} Business Cards of your choice`,
];
export const BUNDLE_DESCRIPTION = `Everything to launch: a Website Special with 3 months of monthly maintenance, ${P.cinematicAds} Cinematic Ads, ${P.ugcAds} UGC Ads (each with 3 opening-hook variations), and ${P.cards} Business Cards of your choice, for one fixed price.`;

