import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { AUDIT_AGENT_SYSTEM, auditReplyIsSafe, parseAuditModelReply, ruleBasedAuditReply } from "@/lib/agents/auditAgentLogic";
import { answerAuditQuestion } from "@/lib/agents/auditAgent";
import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, usd } from "@/lib/pricing/catalog";
import { CONTACT_PHONE_DISPLAY } from "@/lib/config/site";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const FEE = usd(AUDIT_FEE_CENTS);
const ask = (q: string) => ruleBasedAuditReply(q);

describe("the Audit Agent answers what people actually ask", () => {
  it("explains what the audit contains, in the three labeled parts, and what it does not include", () => {
    for (const q of ["What do I get?", "what does the audit include", "what will you look at on my site"]) {
      const r = ask(q);
      expect(r.intent, q).toBe("what");
      expect(r.reply).toMatch(/Observed/);
      expect(r.reply).toMatch(/Recommended/);
      expect(r.reply).toMatch(/Estimated/);
      expect(r.reply).toMatch(/does not include traffic, rankings, or ad results/);
    }
  });

  it("answers 'why isn't it free' and 'is it worth it' with the free preview, the credit, and an honest reason for the fee", () => {
    for (const q of ["Why isn't it free?", "why do you charge", "is it worth $19", "how much is it"]) {
      const r = ask(q);
      expect(["price", "worth"], q).toContain(r.intent);
      expect(r.reply, q).toContain(FEE);
      expect(r.reply, q).toMatch(/free preview/);
      expect(r.reply, q).toMatch(/comes back as a credit/);
      expect(r.reply, q).toMatch(/costs you nothing extra/);
    }
  });

  it("explains the credit: one time, the code, the coupon box, the days, and that it is not cash", () => {
    const r = ask("How does the credit work?");
    expect(r.intent).toBe("credit");
    expect(r.reply).toContain(`within ${AUDIT_CREDIT_DAYS} days`);
    expect(r.reply).toMatch(/one-time code/);
    expect(r.reply).toMatch(/coupon box/);
    expect(r.reply).toMatch(/not returned as cash/);
  });

  it("is straight about refunds: not cash, all sales final, but the fee is credited and a preview comes first", () => {
    const r = ask("can I get a refund?");
    expect(r.intent).toBe("refund");
    expect(r.reply).toMatch(/not refunded as cash/);
    expect(r.reply).toMatch(/all sales are final/);
    expect(r.reply).toMatch(/free preview/);
  });

  it("answers timing, privacy, having no website, and products", () => {
    expect(ask("how long does it take?").reply).toMatch(/about a minute/);
    expect(ask("is my data safe?").reply).toMatch(/we do not sell your information/);
    expect(ask("I don't have a website, can I still do this?").intent).toBe("nosite");
    expect(ask("what do you sell?").reply).toMatch(/NFC review cards/);
  });

  it("will not promise customers, rankings, or sales, and says so plainly", () => {
    for (const q of ["will this get me more customers?", "can you guarantee results", "will it help my SEO ranking"]) {
      const r = ask(q);
      expect(r.reply, q).toMatch(/will not promise|nobody honestly can|no guarantee/i);
      expect(r.reply, q).not.toMatch(/you will get more|guaranteed to/i);
    }
  });

  it("hands a request for a person straight over, with the real phone number, and asks for an email to reach them", () => {
    const r = ask("can I talk to a real person?");
    expect(r.intent).toBe("human");
    expect(r.escalate).toBe(true);
    expect(r.reply).toContain(CONTACT_PHONE_DISPLAY);
  });

  it("says it is not sure, instead of guessing, and hands off to a person", () => {
    const r = ask("do you do taxes for my LLC in Ohio");
    expect(r.intent).toBe("unsure");
    expect(r.escalate).toBe(true);
    expect(r.reply).toMatch(/not sure I can answer it well/);
  });

  it("greets and thanks like a person, and offers next questions", () => {
    expect(ask("hi").intent).toBe("greeting");
    expect(ask("thanks!").intent).toBe("thanks");
    expect(ask("hi").suggestions.length).toBeGreaterThan(1);
  });
});

describe("how it sells, honestly", () => {
  const every = ["what do I get", "why isn't it free", "how does the credit work", "how long", "is it worth it", "what do you look at", "refund?", "talk to a person", "will it get me customers", "hello", "asdf qwer"].map(ask);

  it("never calls the audit free (only the preview is), and never invents pressure", () => {
    for (const r of every) {
      expect(r.reply).not.toMatch(/\bfree audit\b|\baudit is free\b|\bfor free\b/i);
      expect(r.reply).not.toMatch(/limited time|act now|last chance|hurry|only \d+ (left|spots)|expires (today|tonight)|\d+ (other )?(people|businesses|owners) (are|have|just)/i);
      expect(r.reply).not.toMatch(/testimonial|customers love|rated \d/i);
    }
  });

  it("uses only dollar amounts we really charge, no dashes, and short answers", () => {
    for (const r of every) {
      expect(auditReplyIsSafe(r.reply), r.reply).toBe(true);
      expect(r.reply).not.toMatch(/[—–]/);
      expect(r.reply.length).toBeLessThan(700);
      expect(r.suggestions.length).toBeLessThanOrEqual(4);
    }
  });

  it("gives every price answer the risk reversal: the preview first, the credit after", () => {
    for (const q of ["why isn't it free", "is it worth it", "what does it cost"]) {
      const t = ask(q).reply;
      expect(t.indexOf("free preview")).toBeGreaterThanOrEqual(0);
      expect(t.indexOf("credit")).toBeGreaterThan(t.indexOf("free preview"));
    }
  });
});

describe("the model, when one is switched on, cannot go off script", () => {
  it("throws away a reply with a price we do not charge, a promise, false urgency, or a free audit", () => {
    expect(auditReplyIsSafe(`The audit is ${FEE} and comes back as a credit.`)).toBe(true);
    expect(auditReplyIsSafe("The audit is $5 today.")).toBe(false);
    expect(auditReplyIsSafe("We guarantee you will get more customers.")).toBe(false);
    expect(auditReplyIsSafe("We cannot guarantee results, and nobody can.")).toBe(true);
    expect(auditReplyIsSafe("Only 3 spots left, act now!")).toBe(false);
    expect(auditReplyIsSafe("Your free audit is ready.")).toBe(false);
    expect(auditReplyIsSafe("It works — really.")).toBe(false);
    expect(auditReplyIsSafe("x".repeat(701))).toBe(false);
    expect(auditReplyIsSafe("")).toBe(false);
  });

  it("only accepts a reply in the exact form asked for", () => {
    expect(parseAuditModelReply('{"reply":"Hello","escalate":false}')).toEqual({ reply: "Hello", escalate: false });
    expect(parseAuditModelReply("no json")).toBeNull();
    expect(parseAuditModelReply('{"reply":1,"escalate":false}')).toBeNull();
    expect(parseAuditModelReply('{"reply":"  ","escalate":false}')).toBeNull();
  });

  it("gives the model only facts we can stand behind, and forbids invented pressure and promises", () => {
    expect(AUDIT_AGENT_SYSTEM).toContain(FEE);
    expect(AUDIT_AGENT_SYSTEM).toMatch(/Never invent scarcity, deadlines, testimonials, statistics, or prices/);
    expect(AUDIT_AGENT_SYSTEM).toMatch(/Never say the audit is free/);
    expect(AUDIT_AGENT_SYSTEM).toMatch(/untrusted data/);
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.AI_ENABLED;
  });

  it("with no model configured, always answers from the rules; and money, refunds, privacy, and people are never left to a model", async () => {
    const a = await answerAuditQuestion("What do I get?");
    expect(a.intent).toBe("what");
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.AI_ENABLED = "true";
    for (const q of ["why isn't it free", "refund?", "credit code", "is my data safe", "talk to someone"]) {
      const r = await answerAuditQuestion(q);
      expect(r).toEqual(ruleBasedAuditReply(q));
    }
  });
});

describe("the endpoint and the chat", () => {
  it("rate limits, limits length, has a bot field, and keeps nothing unless the visitor leaves an email", () => {
    const route = read("app/api/audit/agent/route.ts");
    expect(route).toContain("rateLimit(`audit-agent:");
    expect(route).toContain("max(400)");
    expect(route).toContain("company_url");
    expect(route).toContain("if (email && rateLimit(");
    expect(route).toContain('source: "audit-inquiry"');
    expect(route).toContain("DO_NOT_CONTACT");
    expect(route).toContain(".slice(0, 300)");
  });

  it("is on the audit page, works with a keyboard and a screen reader, and offers tappable questions", () => {
    expect(read("app/audit/page.tsx")).toContain("<AuditAgentChat />");
    const chat = read("components/audit/AuditAgentChat.tsx");
    expect(chat).toContain('aria-live="polite"');
    expect(chat).toContain("Ask a question about the audit");
    expect(chat).toContain("min-h-[44px]");
    expect(chat).toContain("Have someone reply");
  });
});
