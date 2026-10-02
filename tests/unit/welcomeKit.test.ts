import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { renderTemplate } from "@/lib/email/templates";
import { CALENDLY_URL, kickoffUrlFor, needsKickoff } from "@/lib/config/calendly";
import { ONBOARDING_KIT_URL } from "@/lib/config/onboarding";

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
    const kit = readFileSync(join(process.cwd(), "public/welcome-kit/index.html"), "utf8");
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
    expect(kit).not.toMatch(/3 months on website plans/);
  });
});
