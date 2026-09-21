import { db } from "@/lib/db";
import { INDUSTRIES } from "@/lib/site/industries";
import { auditWebsite } from "@/lib/prospects/audit";
import { normalizeWebUrl } from "@/lib/prospects/net";
import { isBeforeSaleKey } from "@/lib/crm/pipeline";
import { PRICE_CENTS } from "@/lib/pricing/catalog";

export const PROSPECT_STATUSES = ["NEW", "AUDITED", "CONTACTED", "REPLIED", "CALL_BOOKED", "WON", "LOST", "DO_NOT_CONTACT"] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

/** Statuses where no more outreach should happen. */
export const CLOSED_STATUSES: ProspectStatus[] = ["WON", "LOST", "DO_NOT_CONTACT"];

export interface ProspectInput {
  businessName: string;
  industry?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  source?: string | null;
}

const clean = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  return t ? t : null;
};

/** One identity per business: its website's host if it has one, otherwise name and city. */
export function dedupeKeyFor(p: Pick<ProspectInput, "businessName" | "city" | "website">): string {
  const url = normalizeWebUrl(p.website);
  if (url) return url.hostname.replace(/^www\./, "").toLowerCase();
  return `${p.businessName.trim().toLowerCase().replace(/\s+/g, " ")}|${(p.city ?? "").trim().toLowerCase()}`;
}

/** An industry slug from a slug, plural name, or singular name. Null if unrecognized. */
export function industrySlugFor(value: string | null | undefined): string | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  const hit = INDUSTRIES.find((i) => i.slug === v || i.name.toLowerCase() === v || i.singular.toLowerCase() === v);
  return hit?.slug ?? null;
}

/** Splits one CSV line, honoring double quotes. */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

/**
 * One business per line: name, industry, city, phone, email, website. A header
 * line (starting with "name" or "business") is skipped. Bad lines are reported, not guessed at.
 */
export function parseImport(text: string): { rows: ProspectInput[]; errors: string[] } {
  const rows: ProspectInput[] = [];
  const errors: string[] = [];
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const cells = splitCsvLine(line);
      if (i === 0 && /^(name|business)/i.test(cells[0] ?? "")) return;
      const [businessName, industry, city, phone, email, website] = cells;
      if (!businessName) return void errors.push(`Line ${i + 1}: no business name`);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return void errors.push(`Line ${i + 1} (${businessName}): "${email}" isn't a valid email`);
      if (website && !normalizeWebUrl(website)) return void errors.push(`Line ${i + 1} (${businessName}): "${website}" isn't a valid website address`);
      rows.push({ businessName, industry, city, phone, email, website, source: "import" });
    });
  return { rows, errors };
}

export async function createProspect(input: ProspectInput): Promise<{ id: string; duplicate: boolean }> {
  const businessName = input.businessName.trim().slice(0, 120);
  if (!businessName) throw new Error("A business name is required");
  const key = dedupeKeyFor({ businessName, city: input.city, website: input.website });
  const existing = await db.prospect.findUnique({ where: { dedupeKey: key }, select: { id: true } });
  if (existing) return { id: existing.id, duplicate: true };

  const website = normalizeWebUrl(input.website)?.toString() ?? null;
  const created = await db.prospect.create({
    data: {
      dedupeKey: key,
      businessName,
      industry: industrySlugFor(input.industry),
      city: clean(input.city)?.slice(0, 80) ?? null,
      phone: clean(input.phone)?.slice(0, 40) ?? null,
      email: clean(input.email)?.toLowerCase().slice(0, 120) ?? null,
      website,
      source: clean(input.source)?.slice(0, 40) ?? "manual",
    },
  });
  return { id: created.id, duplicate: false };
}

export async function importProspects(text: string) {
  const { rows, errors } = parseImport(text);
  let created = 0;
  let duplicates = 0;
  for (const row of rows.slice(0, 500)) {
    const r = await createProspect(row);
    if (r.duplicate) duplicates++;
    else created++;
  }
  return { created, duplicates, errors, truncated: rows.length > 500 };
}

export interface ProspectPatch {
  status?: ProspectStatus;
  nextFollowUpAt?: Date | null;
  note?: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  /** The sales pipeline. null clears a field. */
  stage?: string | null;
  valueCents?: number | null;
  probability?: number | null;
  productInterest?: string | null;
  nextAction?: string | null;
  /** True records that you just talked to them. */
  logContact?: boolean;
}

/** Applies a person's edit. "Do not contact" is final: it clears any follow-up. */
export async function updateProspect(id: string, patch: ProspectPatch) {
  const row = await db.prospect.findUnique({ where: { id } });
  if (!row) return null;

  const data: Record<string, unknown> = {};
  if (patch.status) {
    if (!(PROSPECT_STATUSES as readonly string[]).includes(patch.status)) throw new Error("Unknown status");
    if (row.status === "DO_NOT_CONTACT" && patch.status !== "DO_NOT_CONTACT") throw new Error("This business asked not to be contacted, so its status can't be changed");
    data.status = patch.status;
    if (CLOSED_STATUSES.includes(patch.status)) data.nextFollowUpAt = null;
    if (patch.status === "CONTACTED" && !row.contactedAt) data.contactedAt = new Date();
  }
  if (patch.nextFollowUpAt !== undefined && !(data.status && CLOSED_STATUSES.includes(data.status as ProspectStatus))) {
    if (row.status === "DO_NOT_CONTACT") throw new Error("This business asked not to be contacted");
    data.nextFollowUpAt = patch.nextFollowUpAt;
  }
  if (patch.stage !== undefined) {
    if (patch.stage !== null && !isBeforeSaleKey(patch.stage)) throw new Error("Unknown sales stage");
    if (row.status === "DO_NOT_CONTACT") throw new Error("This business asked not to be contacted, so its stage can't be changed");
    data.stage = patch.stage;
  }
  if (patch.valueCents !== undefined) {
    if (patch.valueCents !== null && (!Number.isInteger(patch.valueCents) || patch.valueCents < 0 || patch.valueCents > 100_000_000)) throw new Error("Unknown value");
    data.valueCents = patch.valueCents;
  }
  if (patch.probability !== undefined) {
    if (patch.probability !== null && (!Number.isInteger(patch.probability) || patch.probability < 0 || patch.probability > 100)) throw new Error("Unknown chance");
    data.probability = patch.probability;
  }
  if (patch.productInterest !== undefined) {
    if (patch.productInterest !== null && !(patch.productInterest in PRICE_CENTS)) throw new Error("Unknown product");
    data.productInterest = patch.productInterest;
  }
  if (patch.nextAction !== undefined) data.nextAction = clean(patch.nextAction)?.slice(0, 200) ?? null;
  if (patch.logContact && row.status !== "DO_NOT_CONTACT") data.lastContactAt = new Date();
  if (patch.phone !== undefined) data.phone = clean(patch.phone)?.slice(0, 40) ?? null;
  if (patch.email !== undefined) data.email = clean(patch.email)?.toLowerCase().slice(0, 120) ?? null;
  if (patch.website !== undefined) data.website = normalizeWebUrl(patch.website)?.toString() ?? null;
  if (patch.note?.trim()) {
    const stamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    data.notes = `${row.notes ? row.notes + "\n" : ""}[${stamp}] ${patch.note.trim().slice(0, 500)}`;
  }
  return db.prospect.update({ where: { id }, data });
}

/** Records that outreach was sent by hand, and schedules the follow-up. */
export async function markContacted(id: string, followUpDays = 3) {
  const row = await db.prospect.findUnique({ where: { id } });
  if (!row) return null;
  if (row.status === "DO_NOT_CONTACT") throw new Error("This business asked not to be contacted");
  if (CLOSED_STATUSES.includes(row.status as ProspectStatus)) throw new Error("This prospect is already closed");
  const days = Math.min(30, Math.max(1, Math.round(followUpDays)));
  return db.prospect.update({
    where: { id },
    data: {
      status: row.status === "NEW" || row.status === "AUDITED" || row.status === "CONTACTED" ? "CONTACTED" : row.status,
      contactedAt: row.contactedAt ?? new Date(),
      lastContactAt: new Date(),
      nextFollowUpAt: new Date(Date.now() + days * 86_400_000),
    },
  });
}

/** Checks the prospect's website and saves the result. A NEW prospect becomes AUDITED. */
export async function runProspectAudit(id: string) {
  const row = await db.prospect.findUnique({ where: { id } });
  if (!row) return null;
  const audit = await auditWebsite(row.website);
  return db.prospect.update({
    where: { id },
    data: { auditJson: JSON.stringify(audit), auditedAt: new Date(), status: row.status === "NEW" ? "AUDITED" : row.status },
  });
}

/** Prospects whose follow-up date has arrived and who are still open. */
export async function dueFollowUps(now = new Date()) {
  return db.prospect.findMany({
    where: { nextFollowUpAt: { lte: now }, status: { notIn: CLOSED_STATUSES } },
    orderBy: { nextFollowUpAt: "asc" },
    take: 100,
  });
}

export async function prospectStats() {
  const [byStatus, audited, contacted, total] = await Promise.all([
    db.prospect.groupBy({ by: ["status"], _count: { _all: true } }),
    db.prospect.count({ where: { auditedAt: { not: null } } }),
    db.prospect.count({ where: { contactedAt: { not: null } } }),
    db.prospect.count(),
  ]);
  const count = (s: ProspectStatus) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  return {
    total,
    audited,
    contacted,
    replied: count("REPLIED") + count("CALL_BOOKED") + count("WON"),
    callsBooked: count("CALL_BOOKED") + count("WON"),
    won: count("WON"),
    lost: count("LOST"),
    doNotContact: count("DO_NOT_CONTACT"),
    byStatus: Object.fromEntries(PROSPECT_STATUSES.map((s) => [s, count(s)])) as Record<ProspectStatus, number>,
  };
}

/**
 * A customer just paid: any prospect with the same email has become a customer. Marks it won, and clears its follow-up.
 * A business that asked not to be contacted stays that way. Never throws: a CRM tidy-up must not hold up an order.
 */
export async function markProspectWon(email: string | null | undefined): Promise<number> {
  const e = (email ?? "").trim().toLowerCase();
  if (!e) return 0;
  try {
    const r = await db.prospect.updateMany({ where: { email: e, status: { notIn: ["WON", "DO_NOT_CONTACT"] } }, data: { status: "WON", nextFollowUpAt: null } });
    return r.count;
  } catch (err) {
    console.error("marking prospect won failed", err);
    return 0;
  }
}
