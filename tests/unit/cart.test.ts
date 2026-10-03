import { beforeEach, describe, expect, it, vi } from "vitest";

// The cart: only real products that check out on their own, one of each, remembered per account from the session only.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ settings: [] as { key: string; value: string }[], session: null as Row | null }));
vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    appSetting: {
      findUnique: async ({ where }: Row) => h.settings.find((s) => s.key === where.key) ?? null,
      upsert: async ({ where, create, update }: Row) => {
        const s = h.settings.find((x) => x.key === where.key);
        if (s) Object.assign(s, update);
        else h.settings.push({ ...create });
      },
    },
    product: { findMany: async () => [{ slug: "website-special", name: "Website Special", priceCents: 125_000, active: true, variants: [] }] },
  },
}));

import { CARTABLE_SLUGS, MAX_CART_ITEMS, isCartable, mergeCarts, normalise } from "@/lib/cart/store";
import { GET as quote } from "@/app/api/cart/quote/route";
import { GET, PUT } from "@/app/api/cart/route";
import { NextRequest } from "next/server";

beforeEach(() => {
  h.settings = [];
  h.session = null;
});

describe("what can go in the cart", () => {
  it("only products that check out on their own: not monthly plans, not made-up slugs", () => {
    expect(isCartable("website-special")).toBe(true);
    expect(isCartable("nfc-cards")).toBe(true);
    expect(isCartable("ads-monthly-300")).toBe(false);
    expect(isCartable("care-plan")).toBe(false);
    expect(isCartable("free-stuff")).toBe(false);
  });

  it("keeps one of each, drops junk, and caps the size", () => {
    const at = "2026-10-03T00:00:00.000Z";
    expect(normalise([{ slug: "website-special", addedAt: at }, { slug: "website-special", addedAt: at }, { slug: "nope" }, 42, null]).map((i) => i.slug)).toEqual(["website-special"]);
    expect(normalise("not a list")).toEqual([]);
    expect(normalise([...CARTABLE_SLUGS, ...CARTABLE_SLUGS]).length).toBeLessThanOrEqual(MAX_CART_ITEMS);
  });

  it("merges this device's cart with the account's without doubling anything", () => {
    const a = normalise(["website-special", "nfc-cards"]);
    const b = normalise(["nfc-cards", "ugc-ad-special"]);
    expect(mergeCarts(a, b).map((i) => i.slug)).toEqual(["website-special", "nfc-cards", "ugc-ad-special"]);
  });
});

describe("the cart's server side", () => {
  it("prices only real cart products, live from the product rows", async () => {
    const res = await quote(new NextRequest("http://x/api/cart/quote?slugs=website-special,hacked,ads-monthly-300"));
    const d = await res.json();
    expect(d.items.map((i: Row) => i.slug)).toEqual(["website-special"]);
    expect(d.items[0].priceCents).toBe(125_000);
  });

  it("remembers a cart only for the signed-in customer, under their own id from the session", async () => {
    expect((await GET()).status).toBe(401);
    expect((await PUT(new NextRequest("http://x/api/cart", { method: "PUT", body: JSON.stringify({ items: ["website-special"] }) }))).status).toBe(401);
    h.session = { user: { id: "u1" } };
    await PUT(new NextRequest("http://x/api/cart", { method: "PUT", body: JSON.stringify({ items: ["website-special", "junk"] }) }));
    expect(h.settings.map((s) => s.key)).toEqual(["cart:u1"]);
    const d = await (await GET()).json();
    expect(d.items.map((i: Row) => i.slug)).toEqual(["website-special"]);
  });
});
