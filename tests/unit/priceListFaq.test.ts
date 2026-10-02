import { describe, expect, it } from "vitest";
import { BUNDLE_SEPARATELY_CENTS, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { PRICE_LIST, PRICE_LIST_SLUGS } from "@/lib/site/priceList";
import { faqGroups, topFaqs } from "@/lib/site/faq";

describe("the price list", () => {
  it("lists every product once, each priced in the catalog, in groups with their own anchors", () => {
    expect(new Set(PRICE_LIST_SLUGS).size).toBe(PRICE_LIST_SLUGS.length);
    for (const slug of PRICE_LIST_SLUGS) expect(PRICE_CENTS, slug).toHaveProperty([slug]);
    const ids = PRICE_LIST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(["websites", "ads", "business-cards"]));
  });

  it("names the new website offer and leaves the retired one out", () => {
    expect(PRICE_LIST_SLUGS).toContain("website-special");
    expect(PRICE_LIST_SLUGS).not.toContain("starter-website" as never);
  });
});

describe("the FAQ", () => {
  const all = (bnpl: boolean) => faqGroups({ bnpl }).flatMap((g) => g.faqs);

  it("answers from the price list, including the bundle's real saving", () => {
    const bundle = all(false).find((f) => f.q.startsWith("What's in the All-in-One"))!;
    expect(bundle.a).toContain(usd(PRICE_CENTS["all-in-one-bundle"]));
    expect(bundle.a).toContain(usd(BUNDLE_SEPARATELY_CENTS - PRICE_CENTS["all-in-one-bundle"]));
    expect(all(false).find((f) => f.q.startsWith("What's included in the"))!.q).toContain(usd(PRICE_CENTS["website-special"]));
  });

  it("only mentions pay-later when it is switched on", () => {
    const pay = (bnpl: boolean) => all(bnpl).find((f) => f.q === "How do I pay?")!.a;
    expect(pay(false)).not.toMatch(/Klarna|Afterpay/);
    expect(pay(true)).toMatch(/Klarna or Afterpay/);
  });

  it("promises no results, and every question is unique", () => {
    const qs = all(true).map((f) => f.q);
    expect(new Set(qs).size).toBe(qs.length);
    for (const f of all(true)) expect(f.a, f.q).not.toMatch(/guarantee(d)? (results|sales|rankings)|we promise/i);
  });

  it("shows the most common few on the homepage, all of them real answers", () => {
    const top = topFaqs({ bnpl: false });
    expect(top.length).toBe(7);
    for (const f of top) expect(all(false)).toContainEqual(f);
  });
});
