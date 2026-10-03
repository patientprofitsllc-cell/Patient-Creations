// The visitor's cart: product slugs they've saved to buy. Kept in this browser (so it's there next visit, signed in or
// not) and, for signed-in customers, mirrored to their account by CartSync, so it follows them to another device.
// Prices are never stored here: they're read live from the product rows (see /api/cart/quote), so the cart always shows
// what checkout will charge. Each item checks out through its own normal checkout.
import { PRICE_LIST } from "@/lib/site/priceList";

export const CART_KEY = "pc-cart-v1";
export const CART_EVENT = "pc-cart";
export const MAX_CART_ITEMS = 20;

export interface CartItem {
  slug: string;
  addedAt: string;
}

/** Only products that check out on their own can go in the cart (not monthly plans, which have their own pages). */
export const CARTABLE_SLUGS: string[] = PRICE_LIST.flatMap((g) => g.items.filter((i) => !i.href).map((i) => i.slug));
export const isCartable = (slug: string) => CARTABLE_SLUGS.includes(slug);

/** Keeps only real, cartable, unique slugs, newest first, capped. Pure: used for local and account copies alike. */
export function normalise(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const out: CartItem[] = [];
  for (const it of items) {
    const slug = typeof it === "string" ? it : (it as CartItem | null)?.slug;
    if (typeof slug !== "string" || !isCartable(slug) || seen.has(slug)) continue;
    seen.add(slug);
    const at = typeof it === "object" && it && typeof (it as CartItem).addedAt === "string" ? (it as CartItem).addedAt : new Date().toISOString();
    out.push({ slug, addedAt: at });
  }
  return out.slice(0, MAX_CART_ITEMS);
}

/** Merges two carts (this device and the account), keeping one of each product. */
export const mergeCarts = (a: CartItem[], b: CartItem[]) => normalise([...a, ...b]);

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readCart(): CartItem[] {
  try {
    return normalise(JSON.parse(storage()?.getItem(CART_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[], { sync = true } = {}) {
  const clean = normalise(items);
  try {
    storage()?.setItem(CART_KEY, JSON.stringify(clean));
  } catch {
    /* storage blocked: the cart lives for this page only */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { sync } }));
  return clean;
}

export const addToCart = (slug: string) => writeCart([{ slug, addedAt: new Date().toISOString() }, ...readCart()]);
export const removeFromCart = (slug: string) => writeCart(readCart().filter((i) => i.slug !== slug));
export const removeManyFromCart = (slugs: string[]) => writeCart(readCart().filter((i) => !slugs.includes(i.slug)));
export const inCart = (slug: string) => readCart().some((i) => i.slug === slug);
