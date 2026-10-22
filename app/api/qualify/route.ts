import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { createProspect } from "@/lib/prospects/service";
import { BUDGETS, NEEDS, TIMELINES, isBudget, isNeed, isSerious, isTimeline, productFor } from "@/lib/site/fitQualifier";
import { signVanessaToken, vanessaUrl } from "@/lib/site/vanessaAccess";

// The homepage's "See if we're a fit" form. It never uses AI credits: it decides with the plain rules in
// lib/site/fitQualifier.ts, saves the person as a new lead in the CRM (nothing is ever sent to them automatically), and
// hands serious ones a private two-hour link to talk with Vanessa. Everyone else is pointed to the free next steps.

const NO_STORE = { "Cache-Control": "no-store" };
const FORM_LINK_SECONDS = 2 * 60 * 60;

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  business: z.string().trim().min(1).max(120),
  need: z.string().refine(isNeed),
  budget: z.string().refine(isBudget),
  timeline: z.string().refine(isTimeline),
  website: z.string().max(200).optional(), // a hidden field real people never fill in
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`qualify-ip:${ip}`, 6, 10 * 60_000).allowed) {
    return NextResponse.json({ error: "Too many tries. Please wait a few minutes." }, { status: 429, headers: NO_STORE });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your answers and try again." }, { status: 400, headers: NO_STORE });
  const b = parsed.data;
  if (b.website) return NextResponse.json({ qualified: false, next: [] }, { headers: NO_STORE }); // a bot: look like success, do nothing

  const need = b.need as (typeof NEEDS)[number]["id"];
  const budget = b.budget as (typeof BUDGETS)[number]["id"];
  const timeline = b.timeline as (typeof TIMELINES)[number]["id"];
  const serious = isSerious({ need, budget, timeline });

  // Save the lead. A problem here must never stop the visitor from moving on.
  const saveLead = async () => {
    try {
      const { id } = await createProspect({ businessName: b.business, email: b.email, source: "website-fit-form" });
      const label = (list: readonly { id: string; label: string }[], v: string) => list.find((x) => x.id === v)?.label ?? v;
      await db.prospect.update({
        where: { id },
        data: {
          stage: "NEW_LEAD",
          productInterest: productFor(need),
          nextAction: serious ? "Review Vanessa's notes, then follow up" : "Low-touch: sent free next steps",
          notes: `Contact: ${b.name}. Wants: ${label(NEEDS, need)}. Budget: ${label(BUDGETS, budget)}. Timeline: ${label(TIMELINES, timeline)}. Fit form: ${serious ? "serious, offered Vanessa" : "not yet, sent free next steps"}.`,
        },
      });
    } catch (e) {
      console.warn("fit form: could not save the lead,", e instanceof Error ? e.message : e);
    }
  };
  // A slow database must never keep a visitor waiting: give saving the lead a few seconds, then move on.
  await Promise.race([saveLead(), new Promise<void>((resolve) => setTimeout(resolve, 4000))]);

  if (!serious) {
    return NextResponse.json({ qualified: false, need, next: need === "cards" ? ["cards", "pricing"] : ["audit", "pricing", "examples"] }, { headers: NO_STORE });
  }
  let link: string | null = null;
  try {
    const base = process.env.APP_BASE_URL || new URL(req.url).origin;
    link = vanessaUrl(base, signVanessaToken("form", FORM_LINK_SECONDS));
  } catch (e) {
    console.warn("fit form: could not make a Vanessa link,", e instanceof Error ? e.message : e);
  }
  return NextResponse.json({ qualified: Boolean(link), link, need, next: ["audit", "pricing"] }, { headers: NO_STORE });
}
