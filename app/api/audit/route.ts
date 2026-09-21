import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { normalizeWebUrl } from "@/lib/prospects/net";
import { createProspect, industrySlugFor } from "@/lib/prospects/service";
import { AUDIT_CHANNELS, AUDIT_GOALS, buildGrowthAudit, type ProductFacts } from "@/lib/audit/growthAudit";
import { readSite } from "@/lib/audit/diagnosis";
import { auditTeaser, createAuditRequest, startAuditCheckout } from "@/lib/audit/paid";
import { AD_PLANS } from "@/lib/ads/plans";
import { AUDIT_FEE_CENTS, PRICE_CENTS } from "@/lib/pricing/catalog";
import { trackFunnel } from "@/lib/analytics/funnel";

// Asking for a Growth Audit. Anyone can call this, so it is defended in layers: a per-address and per-email rate
// limit, a hidden field only a bot fills in, strict length limits, and a website check that refuses private and
// internal addresses (lib/prospects/net.ts). It reads one public page, once. The visitor gets a free teaser
// (real counts, no findings) and a link to pay; the full report unlocks when the fee is paid.

const schema = z.object({
  businessName: z.string().trim().min(2).max(120),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  industry: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  goal: z.enum(AUDIT_GOALS.map((g) => g.value) as [string, ...string[]]),
  channels: z.array(z.enum(AUDIT_CHANNELS as unknown as [string, ...string[]])).max(AUDIT_CHANNELS.length),
  consent: z.literal(true),
  // A real visitor never sees or fills this field.
  company_url: z.string().max(200).optional(),
});

const FACT_SLUGS = ["starter-website", "nfc-cards", "ugc-ad-special", "lead-engine", "strategy-session", "all-in-one-bundle"] as const;

async function loadFacts(): Promise<Record<string, ProductFacts>> {
  const rows = await db.product.findMany({ where: { slug: { in: [...FACT_SLUGS] }, active: true }, select: { slug: true, name: true, priceCents: true, turnaround: true } });
  const facts: Record<string, ProductFacts> = {};
  for (const slug of FACT_SLUGS) {
    const row = rows.find((r) => r.slug === slug);
    facts[slug] = row ? { slug, name: row.name, priceCents: row.priceCents, turnaround: row.turnaround } : { slug, name: slug, priceCents: PRICE_CENTS[slug], turnaround: null };
  }
  const starter = AD_PLANS[0];
  facts[starter.slug] = { slug: starter.slug, name: starter.name, priceCents: PRICE_CENTS["ads-monthly-300"], turnaround: `${starter.deliveryBusinessDays} business days` };
  return facts;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`audit:ip:${ip}`, 10, 3_600_000).allowed) {
    return NextResponse.json({ error: "You have asked for a lot of audits. Please try again in an hour, or email us." }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const consent = parsed.error.issues.some((i) => i.path[0] === "consent");
    return NextResponse.json({ error: consent ? "Please tick the box so we can send you the audit." : "Please check the form: a business name, a valid email, and your goal are needed." }, { status: 400 });
  }
  const input = parsed.data;
  if (input.company_url) return new NextResponse(null, { status: 204 }); // a bot; say nothing
  if (!rateLimit(`audit:email:${input.email}`, 5, 86_400_000).allowed) {
    return NextResponse.json({ error: "We already started audits for that email today. Check your inbox, or reply to our email." }, { status: 429 });
  }

  const website = input.website ? normalizeWebUrl(input.website) : null;
  if (input.website && !website) {
    return NextResponse.json({ error: "That website address does not look right. Try the address as it appears in your browser, or leave it blank." }, { status: 400 });
  }

  const [{ site, facts: siteFacts }, facts] = await Promise.all([readSite(website?.toString() ?? null), loadFacts()]);
  const auditInput = { businessName: input.businessName, website: website?.toString() ?? null, industry: input.industry || null, city: input.city || null, email: input.email, phone: input.phone || null, goal: input.goal as never, channels: input.channels as never };
  const report = buildGrowthAudit(auditInput, site, facts);

  // Into the same pipeline the owner already works: the prospect list. Not "audited" until the audit is paid for.
  let prospectId: string | null = null;
  try {
    const p = await createProspect({ businessName: input.businessName, industry: industrySlugFor(input.industry), city: input.city, phone: input.phone, email: input.email, website: website?.toString() ?? null, source: "growth-audit" });
    prospectId = p.id;
    const existing = await db.prospect.findUnique({ where: { id: p.id }, select: { email: true, phone: true, notes: true } });
    const note = `Growth audit requested ${new Date().toISOString().slice(0, 10)} (not paid yet): goal ${input.goal}; channels ${input.channels.join(", ") || "none given"}.`;
    await db.prospect.update({
      where: { id: p.id },
      data: {
        ...(existing && !existing.email ? { email: input.email } : {}),
        ...(existing && !existing.phone && input.phone ? { phone: input.phone.slice(0, 40) } : {}),
        notes: [existing?.notes, note].filter(Boolean).join("\n").slice(-1500),
      },
    });
  } catch (err) {
    console.error("growth audit: could not save the lead", err);
  }

  const request = await createAuditRequest({ input: auditInput, report, prospectId, site, facts: siteFacts });
  await trackFunnel("lead_submitted", { source: "growth-audit" });
  const checkout = await startAuditCheckout(request.id);

  return NextResponse.json({
    ok: true,
    token: request.token,
    feeCents: AUDIT_FEE_CENTS,
    teaser: auditTeaser(report),
    checkoutUrl: checkout.ok ? checkout.url : null,
    paid: checkout.ok ? Boolean(checkout.paid) : false,
    notice: checkout.ok ? null : checkout.error,
  });
}
