// SERVER ONLY. Where each example site is really hosted. Visitors never see these addresses or the business names: the pages are
// served from /showcase/<name>/ on our own domain (app/showcase), names are replaced in the page text on the way
// (lib/site/showcaseTransform.ts), and the images, video and fonts are passed through by next.config.mjs. Keep this file out of
// anything a browser loads (cards use lib/site/showcaseSites.ts, which has neither).

/** @type {Record<string, string>} */
export const UPSTREAM = {
  "restaurant-1": "franks-alley.higgsfield.app",
  "restaurant-2": "red8-kitchen-columbus.higgsfield.app",
  "restaurant-3": "breakfastology-cafe.higgsfield.app",
  "restaurant-4": "kickin-bites-columbus.higgsfield.app",
};

/** The business names to replace in each page's text, with what each is replaced by. */
/** @type {Record<string, string[]>} */
export const NAMES = {
  "restaurant-1": ["Frank's Alley", "Frank's"],
  "restaurant-2": ["Red 8 Kitchen", "Red 8"],
  "restaurant-3": ["Breakfastology Cafe", "Breakfastology"],
  "restaurant-4": ["Kickin Bites", "Kickin' Bites"],
};
export const GENERIC_NAME = "Your Restaurant";
