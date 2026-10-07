// SERVER ONLY. Where each showcased client site is really hosted. Visitors never see these addresses: the pages are served
// from /showcase/<name>/ on our own domain (app/showcase) and the images, video and fonts are passed through by
// next.config.mjs. Keep this file out of anything a browser loads (cards use lib/site/showcaseSites.ts, which has no hosts).

/** @type {Record<string, string>} */
export const UPSTREAM = {
  "franks-alley": "franks-alley.higgsfield.app",
  "red8-kitchen-columbus": "red8-kitchen-columbus.higgsfield.app",
  "breakfastology-cafe": "breakfastology-cafe.higgsfield.app",
  "kickin-bites-columbus": "kickin-bites-columbus.higgsfield.app",
};
