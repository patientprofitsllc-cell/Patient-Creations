// What one ad from the per-ad specials includes, stated once. The homepage card, the product
// rows in the database, and the All-in-One bundle all read from here, so they can't drift.
// Pure text: safe to use in the browser, the seed script, and tests.

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

export const BUNDLE_ITEMS = ["A Quick Business Website", "2 Cinematic Ads", "2 UGC Ads (3 hook variations each)", "3 NFC cards of your choice"];
export const BUNDLE_DESCRIPTION =
  "Everything to launch: a Starter Website, 2 Cinematic Ads, 2 UGC Ads (each with 3 opening-hook variations), and 3 NFC cards of your choice, for one fixed price.";

// Worded as what is set up, not as a result: nobody can promise customers.
export const LEAD_ENGINE_DESCRIPTION = "A system to capture new leads and send them straight to you.";
