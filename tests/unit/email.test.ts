import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { emailCreate, notifCount, notifCreate } = vi.hoisted(() => ({ emailCreate: vi.fn(), notifCount: vi.fn(), notifCreate: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { emailEvent: { create: emailCreate }, notification: { count: notifCount, create: notifCreate } },
}));

import { emailBodyToHtml, sendEmail } from "@/lib/email/provider";
import { MAX_REMINDERS, reminderBlockedReason } from "@/lib/reminders/intake";

const saved = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };
beforeEach(() => {
  emailCreate.mockReset();
  notifCount.mockReset().mockResolvedValue(0);
  notifCreate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (saved.key === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = saved.key;
  if (saved.from === undefined) delete process.env.EMAIL_FROM;
  else process.env.EMAIL_FROM = saved.from;
});

describe("emailBodyToHtml", () => {
  it("makes paragraphs and line breaks", () => {
    expect(emailBodyToHtml("One\nTwo\n\nThree")).toBe('<p style="margin:0 0 14px">One<br>Two</p><p style="margin:0 0 14px">Three</p>');
  });

  it("links web addresses and keeps trailing punctuation out of the link", () => {
    const html = emailBodyToHtml("Open https://patientcreations.com/intake/abc123. Then reply (https://x.com/y).");
    expect(html).toContain('<a href="https://patientcreations.com/intake/abc123">https://patientcreations.com/intake/abc123</a>.');
    expect(html).toContain('<a href="https://x.com/y">https://x.com/y</a>).');
  });

  it("escapes markup so nothing in the text can inject HTML", () => {
    const html = emailBodyToHtml('Hi <script>alert(1)</script> & "you"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });
});

describe("sendEmail", () => {
  it("in console mode reports success and records it as SENT", async () => {
    delete process.env.RESEND_API_KEY;
    const r = await sendEmail("a@b.com", "test_email", {});
    expect(r).toMatchObject({ ok: true, provider: "console" });
    expect(emailCreate.mock.calls[0][0].data).toMatchObject({ toEmail: "a@b.com", template: "test_email", status: "SENT" });
  });

  it("sends real email as text plus HTML, from the configured address", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "hello@patientcreations.com";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await sendEmail("a@b.com", "intake_reminder", { projectName: "Ace", intakeUrl: "https://patientcreations.com/intake/x", last: false });
    expect(r.ok).toBe(true);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.from).toBe("hello@patientcreations.com");
    expect(sent.reply_to).toBe("patientprofitsllc@gmail.com"); // replies reach the owner's inbox
    expect(sent.text).toContain("https://patientcreations.com/intake/x");
    expect(sent.html).toContain('<a href="https://patientcreations.com/intake/x">');
  });

  it("does NOT report success when the email service rejects the message", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"message":"The domain is not verified"}', { status: 403 })));
    const r = await sendEmail("a@b.com", "test_email", {});
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/403.*not verified/);
    expect(emailCreate.mock.calls[0][0].data.status).toBe("FAILED");
    expect(notifCreate).toHaveBeenCalledTimes(1);
    expect(notifCreate.mock.calls[0][0].data.title).toBe("Email failed to send");
  });

  it("never throws, even on a network failure, so an order can't break over an email", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(sendEmail("a@b.com", "test_email", {})).resolves.toMatchObject({ ok: false, error: "network down" });
  });

  it("tells the team about a failure at most once an hour", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    notifCount.mockResolvedValue(1); // one already raised in the last hour
    await sendEmail("a@b.com", "test_email", {});
    expect(notifCreate).not.toHaveBeenCalled();
    expect(emailCreate.mock.calls[0][0].data.status).toBe("FAILED");
  });

  it("still returns the result if recording the outcome itself fails", async () => {
    delete process.env.RESEND_API_KEY;
    emailCreate.mockRejectedValueOnce(new Error("db down"));
    await expect(sendEmail("a@b.com", "test_email", {})).resolves.toMatchObject({ ok: true });
  });
});

describe("reminderBlockedReason", () => {
  const now = new Date("2026-09-20T12:00:00Z");
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

  it("waits a day after payment before the first reminder", () => {
    expect(reminderBlockedReason({ reminderCount: 0, lastReminderAt: null, paidAt: hoursAgo(3) }, now)).toMatch(/Only just paid/);
    expect(reminderBlockedReason({ reminderCount: 0, lastReminderAt: null, paidAt: hoursAgo(25) }, now)).toBeNull();
  });

  it("leaves a day between reminders", () => {
    expect(reminderBlockedReason({ reminderCount: 1, lastReminderAt: hoursAgo(5), paidAt: hoursAgo(100) }, now)).toMatch(/Reminded recently/);
    expect(reminderBlockedReason({ reminderCount: 1, lastReminderAt: hoursAgo(25), paidAt: hoursAgo(100) }, now)).toBeNull();
  });

  it("stops after the cap", () => {
    expect(MAX_REMINDERS).toBe(3);
    expect(reminderBlockedReason({ reminderCount: 3, lastReminderAt: hoursAgo(100), paidAt: hoursAgo(200) }, now)).toMatch(/phone call/);
  });
});
