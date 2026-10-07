// The example websites on /examples. Card data only, safe in the browser. These are shown without the businesses' names:
// they open from our own /showcase/<name> pages (where the real hosting address stays server-side, see showcaseUpstream.mjs).
// Descriptions are factual: no results, ratings or claims.

export interface ShowcaseSite {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  /** Our own /showcase page. */
  href: string;
  /** The site's own hero image, served through our /showcase path. */
  image: string;
}

export const SHOWCASE_SITES: ShowcaseSite[] = [
  { slug: "restaurant-1", name: "Street food restaurant", kind: "Example website · Restaurant", blurb: "Hero film, menu and order links for a street food spot.", href: "/showcase/restaurant-1", image: "/showcase/restaurant-1/assets/hero-poster.webp" },
  { slug: "restaurant-2", name: "Ramen and Asian kitchen", kind: "Example website · Restaurant", blurb: "Menu and online ordering for a ramen and Asian favorites kitchen.", href: "/showcase/restaurant-2", image: "/showcase/restaurant-2/assets/hero-poster.webp" },
  { slug: "restaurant-3", name: "Breakfast cafe", kind: "Example website · Cafe", blurb: "Breakfast and brunch menu, hours and directions.", href: "/showcase/restaurant-3", image: "/showcase/restaurant-3/assets/world/hero-poster.webp" },
  { slug: "restaurant-4", name: "Burgers and wings", kind: "Example website · Restaurant", blurb: "Smash burgers and wings with the menu and order links.", href: "/showcase/restaurant-4", image: "/showcase/restaurant-4/assets/poster.webp" },
];
