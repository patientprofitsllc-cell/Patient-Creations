import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import ReactDOMServer from "react-dom/server";
import * as ReactNS from "react";
import { createElement } from "react";
import { ThankYouCard, type ThankYouKind } from "@/components/checkout/ThankYouCard";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { TARGET_HOURS } from "@/lib/tracking/tracker";

(globalThis as { React?: unknown }).React = ReactNS;

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const render = (el: ReturnType<typeof createElement>) => ReactDOMServer.renderToStaticMarkup(el);
const KINDS: ThankYouKind[] = ["website", "cards", "project"];

describe("the post-purchase walkthrough leaves nothing to guess", () => {
  it("lays out every step in order, with who it's waiting on, for every kind of order", () => {
    for (const kind of KINDS) {
      const html = render(createElement(ThankYouCard, { kind, turnaround: "5-7 business days", revisionLimit: 2 }));
      expect(html, kind).toContain("Your turn");
      expect(html, kind).toContain("We handle this");
      expect(html, kind).toContain("How you&#x27;ll know it&#x27;s done");
      // Six ordered steps: the numbered badges 1 through 6.
      for (let n = 1; n <= 6; n++) expect(html, `${kind} step ${n}`).toContain(`>${n}<`);
    }
  });

  it("states the real website target, from the same constant the live status page uses, never a typed-in number", () => {
    const html = render(createElement(ThankYouCard, { kind: "website", turnaround: "72 hours", revisionLimit: 1 }));
    expect(html).toContain(`${TARGET_HOURS} hours`);
    // The component source must render the shared constant, not a hardcoded "72" string.
    const src = read("components/checkout/ThankYouCard.tsx");
    expect(src).toContain("${TARGET_HOURS} hours");
  });

  it("states the real delivery window for cards and project orders, taken from the order, not invented", () => {
    const cards = render(createElement(ThankYouCard, { kind: "cards", turnaround: "5-7 business days", revisionLimit: 0 }));
    expect(cards).toContain("5-7 business days");
    const project = render(createElement(ThankYouCard, { kind: "project", turnaround: "4-8 weeks", revisionLimit: 3 }));
    expect(project).toContain("4-8 weeks");
    // A session-style product (no day count) reads as a timeline, matching the site-wide deliveryLine wording.
    const session = render(createElement(ThankYouCard, { kind: "project", turnaround: "60 minutes", revisionLimit: 0 }));
    expect(session).toContain("Timeline: 60 minutes");
  });

  it("states the real revision count for the product bought, singular and plural worded correctly", () => {
    expect(render(createElement(ThankYouCard, { kind: "website", turnaround: "72 hours", revisionLimit: 1 }))).toContain("1 round of revisions");
    expect(render(createElement(ThankYouCard, { kind: "website", turnaround: "72 hours", revisionLimit: 2 }))).toContain("2 rounds of revisions");
    expect(render(createElement(ThankYouCard, { kind: "project", turnaround: "1-2 weeks", revisionLimit: 0 }))).toContain("include a revision round");
  });

  it("tells a cards customer their cards are final once made, when there is no revision round, instead of staying silent", () => {
    const html = render(createElement(ThankYouCard, { kind: "cards", turnaround: "5-7 business days", revisionLimit: 0 }));
    expect(html).toMatch(/final|double-check/i);
    expect(html).toContain("Message us before we start");
  });

  it("gives a real way to reach a person, using the one site-wide phone and email, on every kind", () => {
    for (const kind of KINDS) {
      const html = render(createElement(ThankYouCard, { kind, turnaround: "1-2 weeks", revisionLimit: 1 }));
      expect(html, kind).toContain(CONTACT_EMAIL);
      expect(html, kind).toContain(CONTACT_PHONE_DISPLAY);
    }
  });

  it("never breaks when turnaround or revisionLimit aren't passed", () => {
    for (const kind of KINDS) expect(() => render(createElement(ThankYouCard, { kind }))).not.toThrow();
  });

  it("is wired into the confirmation page with the order's real turnaround and revision count, not a guess", () => {
    const src = read("app/checkout/success/page.tsx");
    expect(src).toContain("<PurchaseJourney");
    expect(src).toContain("<ThankYouCard");
    expect(src).toMatch(/turnaround=\{order\.items\[0\]\?\.product\.turnaround/);
    expect(src).toMatch(/revisionLimit=\{order\.items\[0\]\?\.product\.revisionLimit/);
  });
});
