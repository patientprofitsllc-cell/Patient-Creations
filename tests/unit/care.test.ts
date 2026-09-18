import { describe, expect, it } from "vitest";
import { invoiceSubscriptionId, mapStripeStatus, periodEndOf } from "@/lib/care/events";
import { CARE_PLAN_INCLUDES, CARE_PLAN_NOT_INCLUDED, LIVE_CARE_STATUSES } from "@/lib/site/carePlan";

describe("mapStripeStatus", () => {
  it("treats paid and trial states as active", () => {
    expect(mapStripeStatus("active")).toBe("ACTIVE");
    expect(mapStripeStatus("trialing")).toBe("ACTIVE");
  });

  it("treats payment trouble as past due", () => {
    expect(mapStripeStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeStatus("unpaid")).toBe("PAST_DUE");
  });

  it("treats ended subscriptions as canceled", () => {
    expect(mapStripeStatus("canceled")).toBe("CANCELED");
    expect(mapStripeStatus("incomplete_expired")).toBe("CANCELED");
  });

  it("ignores states it shouldn't act on, such as a checkout that hasn't been paid", () => {
    expect(mapStripeStatus("incomplete")).toBeNull();
    expect(mapStripeStatus("paused")).toBeNull();
    expect(mapStripeStatus("something_new")).toBeNull();
  });
});

describe("periodEndOf", () => {
  it("reads the period end from the subscription", () => {
    expect(periodEndOf({ id: "s", status: "active", current_period_end: 1_800_000_000 })?.getTime()).toBe(1_800_000_000_000);
  });

  it("falls back to the subscription item, where newer Stripe API versions put it", () => {
    expect(periodEndOf({ id: "s", status: "active", items: { data: [{ current_period_end: 1_800_000_500 }] } })?.getTime()).toBe(1_800_000_500_000);
  });

  it("returns null when there is none", () => {
    expect(periodEndOf({ id: "s", status: "active" })).toBeNull();
  });
});

describe("care plan wording", () => {
  it("never promises things that don't exist yet", () => {
    const text = CARE_PLAN_INCLUDES.join(" ").toLowerCase();
    expect(text).not.toMatch(/uptime|monitor|backup|seo|ranking|guarantee/);
  });

  it("states what is not included, including ranking promises", () => {
    expect(CARE_PLAN_NOT_INCLUDED.join(" ").toLowerCase()).toContain("ranking");
  });

  it("counts both paid and retrying plans as having a plan", () => {
    expect([...LIVE_CARE_STATUSES]).toEqual(["ACTIVE", "PAST_DUE"]);
  });
});

describe("invoiceSubscriptionId", () => {
  it("reads the older invoice shape", () => {
    expect(invoiceSubscriptionId({ subscription: "sub_old" })).toBe("sub_old");
    expect(invoiceSubscriptionId({ subscription: { id: "sub_obj" } })).toBe("sub_obj");
  });

  it("reads the newer invoice shape, where the subscription moved under parent", () => {
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: "sub_new" } } })).toBe("sub_new");
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: "sub_new2" } } } })).toBe("sub_new2");
  });

  it("returns null for a one-time invoice with no subscription", () => {
    expect(invoiceSubscriptionId({})).toBeNull();
    expect(invoiceSubscriptionId({ parent: null })).toBeNull();
    expect(invoiceSubscriptionId({ parent: { subscription_details: null } })).toBeNull();
  });
});
