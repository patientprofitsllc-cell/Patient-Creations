import { describe, expect, it } from "vitest";
import { pageSignals } from "@/lib/universe/pageSignals";

// The reader must not accuse a page of a problem it does not have. These cases come from a real page: the free audit form,
// which has a clear submit button ("See what we found"), a second small form, and two anti-spam trap fields that no visitor sees.

const AUDIT_FORM = `<html lang="en"><head><title>Audit</title></head><body><main><h1>See what could improve</h1>
<form class="mt-10" noValidate="">
  <label>Business name<input required name="businessName"/></label>
  <label>Website<input name="website"/></label>
  <label>Industry<select name="industry"><option>a</option></select></label>
  <label>Location<input name="city"/></label>
  <label>Email<input type="email" name="email"/></label>
  <label>Phone<input type="tel" name="phone"/></label>
  <fieldset><input type="radio" name="goal" value="a"/><input type="radio" name="goal" value="b"/></fieldset>
  <fieldset><input type="checkbox" name="channels"/><input type="checkbox" name="channels2"/></fieldset>
  <div aria-hidden="true" class="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input tabindex="-1" autoComplete="off" name="company_url"/></label></div>
  <label><input type="checkbox" required name="consent"/>Prepare my audit</label>
  <button type="submit" class="btn">See what we found</button>
</form>
<form><div aria-hidden="true"><input tabindex="-1" name="company_url"/></div><label for="q">Ask</label><input id="q" name="q"/><button type="submit">Ask</button></form>
</main></body></html>`;

describe("reading a page without accusing it", () => {
  it("counts a submit button as a call to action, whatever it says", () => {
    const p = pageSignals(AUDIT_FORM);
    expect(p.submitButtons).toBe(2);
    expect(p.ctaCount).toBeGreaterThanOrEqual(1);
    expect(pageSignals("<html><body><form><input name=a><button type=submit>Go</button></form></body></html>").ctaCount).toBe(1);
    expect(pageSignals(`<html><body><input type="submit" value="Send it"/></body></html>`).ctaCount).toBe(1);
  });

  it("does not count anti-spam trap fields, checkboxes, or radio choices as fields a visitor must fill in", () => {
    const p = pageSignals(AUDIT_FORM);
    expect(p.formCount).toBe(2);
    // name, website, industry, location, email, phone: six real fields in the longest form.
    expect(p.inputCount).toBe(6);
  });

  it("reports the longest single form, not every field on the page added together", () => {
    const many = `<form>${'<input name="x"/>'.repeat(4)}</form><form>${'<input name="y"/>'.repeat(3)}</form>`;
    expect(pageSignals(many).inputCount).toBe(4);
  });

  it("still finds a page with really no call to action, and a really long form", () => {
    expect(pageSignals("<html><body><h1>Hello</h1><p>Just words.</p></body></html>").ctaCount).toBe(0);
    const long = `<form>${'<input name="f"/>'.repeat(8)}<button type="submit">Send</button></form>`;
    expect(pageSignals(long).inputCount).toBe(8);
  });

  it("counts links and buttons that ask for action by their words", () => {
    const p = pageSignals(`<a href="/x">Book a call</a><a href="/y">Read our story</a><button type="button">Get started</button>`);
    expect(p.ctaCount).toBe(2);
  });

  it("reads the basics correctly", () => {
    const p = pageSignals(`<html lang="en"><head><title>Hi</title><meta name="viewport" content="x"></head><body><nav><a href="/a">A</a><a href="/b">B</a></nav><h1>One</h1><img src="/i.png" alt="pic" width="1" height="1"><p>Call (555) 123-4567 for $49.</p></body></html>`);
    expect([p.title, p.h1Count, p.viewport, p.lang, p.navLinks, p.imageCount, p.imagesMissingAlt, p.phoneText, p.priceMentions]).toEqual(["Hi", 1, true, true, 2, 1, 0, true, 1]);
  });
});
