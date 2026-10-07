// The current client sites on /examples. Card data only, safe in the browser: the four restaurant sites open from our own
// /showcase/<name> pages (their source addresses live in showcaseUpstream.mjs, server-side); the other three are public domains.
// Descriptions are factual: no results, ratings or claims.

export interface ShowcaseSite {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  /** Our own /showcase page (same tab), or the site's real address (new tab). */
  href: string;
  external: boolean;
  /** The site's own share/hero image, or null for a typography-only card. */
  image: string | null;
  /** Used only when there is no image. */
  mark: string;
}

export const SHOWCASE_SITES: ShowcaseSite[] = [
  { slug: "franks-alley", name: "Frank's Alley", kind: "Restaurant · Columbus, GA", blurb: "NY street food, with the menu, a hero film and order links.", href: "/showcase/franks-alley", external: false, image: "/showcase/franks-alley/assets/hero-poster.webp", mark: "FA" },
  { slug: "red8-kitchen-columbus", name: "Red 8 Kitchen", kind: "Restaurant · Columbus, GA", blurb: "Ramen and Asian favorites, with online ordering through Toast.", href: "/showcase/red8-kitchen-columbus", external: false, image: "/showcase/red8-kitchen-columbus/assets/hero-poster.webp", mark: "R8" },
  { slug: "breakfastology-cafe", name: "Breakfastology Cafe", kind: "Cafe · Columbus, GA", blurb: "Breakfast and brunch, with menu, hours and directions.", href: "/showcase/breakfastology-cafe", external: false, image: "/showcase/breakfastology-cafe/assets/world/hero-poster.webp", mark: "BC" },
  { slug: "kickin-bites-columbus", name: "Kickin Bites", kind: "Restaurant · Columbus, GA", blurb: "Smash burgers and wings, with the menu and order links.", href: "/showcase/kickin-bites-columbus", external: false, image: "/showcase/kickin-bites-columbus/assets/poster.webp", mark: "KB" },
  { slug: "fitformelite", name: "FitForm Elite", kind: "Fitness app", blurb: "AI training plans, form coaching and nutrition tracking.", href: "https://www.fitformelite.com", external: true, image: null, mark: "FF" },
  { slug: "otistheprophet", name: "Prophet O", kind: "Spiritual counsel", blurb: "A service site for spiritual counsel and booking.", href: "https://www.otistheprophet.com", external: true, image: "https://otistheprophet.com/assets/social-share.jpg", mark: "PO" },
  { slug: "gonaturalwithpriscillia", name: "Go Natural with Priscillia", kind: "Herbal wellness shop", blurb: "Herbal products and consultations, with worldwide delivery.", href: "https://www.gonaturalwithpriscillia.com", external: true, image: "https://gonaturalwithpriscillia.com/images/long-lasting-herb.jpg", mark: "GN" },
];
