import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { renderTemplate } from "@/lib/email/templates";
import { CALENDLY_URL, kickoffUrlFor, needsKickoff } from "@/lib/config/calendly";
import { ONBOARDING_KIT_URL } from "@/lib/config/onboarding";
import { BNPL, BUNDLE_SEPARATELY_CENTS, DEPOSIT, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import KIT from "@/lib/site/welcomeKit/kit.html?raw";
import { kitValues, renderKit, type KitRow } from "@/lib/site/welcomeKit/render";

describe("post-purchase welcome kit", () => {
  it("sends the kit link with every purchase confirmation", () => {
    const site = renderTemplate("purchase_confirmation", { projectName: "Site", intakeUrl: "https://x/intake/1", kitUrl: ONBOARDING_KIT_URL });
    const build = renderTemplate("purchase_confirmation", { projectName: "Build", kitUrl: ONBOARDING_KIT_URL });
    expect(site.body).toContain(ONBOARDING_KIT_URL);
    expect(build.body).toContain(ONBOARDING_KIT_URL);
  });

  it("adds the kickoff booking link only when one is given", () => {
    const url = kickoffUrlFor("Ana Ruiz", "ana@example.com");
    expect(url.startsWith(`${CALENDLY_URL}?`)).toBe(true);
    expect(url).toContain("email=ana%40example.com");
    expect(renderTemplate("purchase_confirmation", { projectName: "B", kickoffUrl: url }).body).toContain(url);
    expect(renderTemplate("purchase_confirmation", { projectName: "B" }).body).not.toContain("calendly.com");
  });

  it("sends the kickoff link only to the builds the kit says start with a call", () => {
    for (const slug of ["site", "lead-engine", "agents", "saas"]) expect(needsKickoff([slug]), slug).toBe(true);
    for (const slug of ["website-special", "all-in-one-bundle", "ugc-ad-special", "cinematic-ad-special", "nfc-cards", "strategy-session"]) {
      expect(needsKickoff([slug]), slug).toBe(false);
    }
    expect(needsKickoff(["site", "nfc-card-addon"])).toBe(true);
  });

  it("keeps the kit's agreement page in line with the Terms of Service", () => {
    const kit = renderKit(KIT, kitValues([]));
    const agreement = kit.slice(kit.indexOf('aria-label="3. Contract and Scope"'), kit.indexOf('aria-label="4. Onboarding Form"'));
    // Disputes go to arbitration (Terms 26 and 27), not straight to a county court.
    expect(agreement).toMatch(/binding individual arbitration/);
    expect(agreement).not.toMatch(/courts serving/i);
    // The Terms give a license to the finished work; they don't transfer ownership of it.
    expect(agreement).toMatch(/perpetual license/);
    expect(agreement).not.toMatch(/Client owns the final/);
    // Ending a project never implies a refund of what was paid.
    expect(agreement).not.toMatch(/7 days&#39; written notice|7 days' written notice/);
    expect(agreement).toMatch(/the Terms control/);
    // Only the Website Special and the bundle include care months.
    expect(kit).not.toMatch(/months on website plans/);
  });
});

describe("the welcome kit shows the same prices and terms as the site", () => {
  it("has no price, contact detail, or policy number typed into its template, only placeholders", () => {
    // $0 is the sample invoice's blank line, not a price.
    expect((KIT.match(/\$[0-9][0-9,]*/g) ?? []).filter((a) => a !== "$0")).toEqual([]);
    expect(KIT).not.toContain(CONTACT_EMAIL);
    expect(KIT).not.toContain(CONTACT_PHONE_DISPLAY);
    expect(KIT).not.toMatch(/\b\d+ to \d+ (weeks|business days)\b|\b72 hours\b/);
  });

  it("fills every placeholder from the price list when the database has no rows", () => {
    const html = renderKit(KIT, kitValues([]));
    expect(html).not.toMatch(/\{\{/);
    for (const cents of [PRICE_CENTS["website-special"], PRICE_CENTS["all-in-one-bundle"], PRICE_CENTS["care-plan"], PRICE_CENTS["strategy-session"], BUNDLE_SEPARATELY_CENTS, BUNDLE_SEPARATELY_CENTS - PRICE_CENTS["all-in-one-bundle"], DEPOSIT.overCents, BNPL.minCents]) {
      expect(html).toContain(usd(cents));
    }
    expect(html).toContain(CONTACT_EMAIL);
    expect(html).toContain("Website Special 72 hours, Cinematic AI Website 2 to 3 weeks, single ads 5 to 7 business days.");
  });

  it("follows the live product rows, the same ones checkout charges", () => {
    const rows: KitRow[] = [
      { slug: "all-in-one-bundle", priceCents: 259_900, revisionLimit: 3, turnaround: "3-4 weeks" },
      { slug: "website-special", priceCents: 135_000, revisionLimit: 2, turnaround: "96 hours" },
    ];
    const html = renderKit(KIT, kitValues(rows));
    expect(html).toContain("$2,599");
    expect(html).toContain("$1,350");
    expect(html).not.toContain(usd(PRICE_CENTS["all-in-one-bundle"]));
    expect(html).toContain("Revision rounds used: 0 of 3");
    expect(html).toContain("Website Special 96 hours");
    // The saving follows too: the parts at their prices, minus the bundle.
    expect(html).toContain(usd(BUNDLE_SEPARATELY_CENTS - PRICE_CENTS["website-special"] + 135_000 - 259_900));
  });

  it("refuses to render a placeholder it has no value for", () => {
    expect(() => renderKit("<p>{{noSuchThing}}</p>", kitValues([]))).toThrow(/noSuchThing/);
  });

  it("is served by the site, not as a static file that could go stale", () => {
    expect(existsSync(join(process.cwd(), "public/welcome-kit/index.html"))).toBe(false);
    expect(ONBOARDING_KIT_URL.endsWith("/welcome-kit")).toBe(true);
    const route = readFileSync(join(process.cwd(), "app/welcome-kit/route.ts"), "utf8");
    expect(route).toMatch(/revalidate = 60/);
  });
});
