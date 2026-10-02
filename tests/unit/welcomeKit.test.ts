import { describe, expect, it } from "vitest";
import { renderTemplate } from "@/lib/email/templates";
import { CALENDLY_URL, kickoffUrlFor } from "@/lib/config/calendly";
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
});
