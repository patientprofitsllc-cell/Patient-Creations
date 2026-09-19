import { describe, expect, it, vi } from "vitest";
import { buildOrderAlert, sendSms, smsConfig, type OrderAlertFacts } from "@/lib/alerts/ownerAlerts";

const facts: OrderAlertFacts = {
  kind: "paid",
  totalCents: 30000,
  productNames: ["Quick Business Website"],
  businessName: "Joe's Cuts",
  paymentMethod: "stripe",
  source: "google:spring",
  returnVisitorOffer: false,
  adminUrl: "https://patientcreations.com/admin/dashboard",
};

describe("buildOrderAlert", () => {
  it("writes a short text with the amount, what was bought, who, how they paid, and where to look", () => {
    const { sms } = buildOrderAlert(facts);
    expect(sms).toContain("NEW PAID ORDER");
    expect(sms).toContain("$300.00");
    expect(sms).toContain("Quick Business Website");
    expect(sms).toContain("(Joe's Cuts)");
    expect(sms).toContain("Card");
    expect(sms).toContain("from google:spring");
    expect(sms).toContain("https://patientcreations.com/admin/dashboard");
    expect(sms.length).toBeLessThanOrEqual(320);
  });

  it("says plainly when the money has not arrived yet", () => {
    const a = buildOrderAlert({ ...facts, kind: "awaiting_payment", paymentMethod: "zelle" });
    expect(a.sms).toContain("awaiting payment");
    expect(a.sms).toContain("Zelle");
    expect(a.body).toMatch(/not confirmed yet/);
    expect(a.subject).toContain("awaiting payment");
  });

  it("mentions the return-visitor offer when it was used", () => {
    expect(buildOrderAlert({ ...facts, returnVisitorOffer: true }).sms).toContain("5% return offer used");
    expect(buildOrderAlert(facts).sms).not.toContain("return offer");
  });

  it("keeps the text plain ASCII on one line, however odd the customer's input", () => {
    const { sms } = buildOrderAlert({ ...facts, businessName: "Café ☃\nLine two‮", productNames: ["A".repeat(200)] });
    expect(sms).toMatch(/^[\x20-\x7E]+$/);
    expect(sms.length).toBeLessThanOrEqual(320);
  });
});

describe("smsConfig", () => {
  const base = { TWILIO_ACCOUNT_SID: "AC123", TWILIO_AUTH_TOKEN: "tok", TWILIO_FROM_NUMBER: "+15550001111", OWNER_ALERT_PHONE: "+15550002222" } as unknown as NodeJS.ProcessEnv;

  it("is off unless every Twilio value is set", () => {
    expect(smsConfig({} as NodeJS.ProcessEnv)).toBeNull();
    expect(smsConfig({ ...base, TWILIO_AUTH_TOKEN: "" } as NodeJS.ProcessEnv)).toBeNull();
    expect(smsConfig({ ...base, TWILIO_FROM_NUMBER: "" } as NodeJS.ProcessEnv)).toBeNull();
  });

  it("rejects numbers that are not in +country format", () => {
    expect(smsConfig({ ...base, OWNER_ALERT_PHONE: "555-000-2222" } as NodeJS.ProcessEnv)).toBeNull();
    expect(smsConfig({ ...base, TWILIO_FROM_NUMBER: "5550001111" } as NodeJS.ProcessEnv)).toBeNull();
  });

  it("is on when complete", () => {
    expect(smsConfig(base)).toEqual({ accountSid: "AC123", authToken: "tok", from: "+15550001111", to: "+15550002222" });
  });
});

describe("sendSms", () => {
  const cfg = { accountSid: "AC123", authToken: "tok", from: "+15550001111", to: "+15550002222" };

  it("sends one authenticated form request to Twilio", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 201 }));
    const r = await sendSms(cfg, "hello", fetchMock as unknown as typeof fetch);
    expect(r).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Basic ${Buffer.from("AC123:tok").toString("base64")}`);
    const form = new URLSearchParams(init.body as string);
    expect(form.get("To")).toBe("+15550002222");
    expect(form.get("From")).toBe("+15550001111");
    expect(form.get("Body")).toBe("hello");
  });

  it("reports a rejected send instead of pretending it worked", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: "Unverified number" }), { status: 400 }));
    const r = await sendSms(cfg, "hi", fetchMock as unknown as typeof fetch);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/400.*Unverified number/);
  });

  it("reports a network failure and never throws", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await sendSms(cfg, "hi", fetchMock as unknown as typeof fetch)).toEqual({ ok: false, error: "offline" });
  });
});
