// "Leave an honest review, get a Business Card for $5." Every customer who reviews a delivered project gets one
// single-use code, whatever their rating says: the reward never depends on the review being positive (FTC 16 CFR 465)
// and is never tied to a Google review (Google bans incentives). Reviews shown on the site carry a disclosure.
//
// The code takes one card down to REWARD_CARD_CENTS on a Business Card order (shipping is still charged on top), is checked on the server at checkout,
// and is used up when that order is paid (see completeOrder). Stored in AppSetting, so no migration is needed.
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

import { REWARD_CARD_CENTS } from "./rewardPrice";
export { REWARD_CARD_CENTS };
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const key = (code: string) => `review_reward:${code}`;
const byProject = (projectId: string) => `review_reward_project:${projectId}`;

export const isReviewRewardCode = (code: string | null | undefined) => /^CARD5-[A-Z2-9]{8}$/.test((code ?? "").trim().toUpperCase());

function newCode() {
  return "CARD5-" + Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** The project's reward code, issued once on its first review. Returns the same code if it was already issued. */
export async function issueReviewReward(projectId: string, customerId: string): Promise<string> {
  const existing = await db.appSetting.findUnique({ where: { key: byProject(projectId) } });
  if (existing) return existing.value;
  const code = newCode();
  await db.appSetting.create({ data: { key: key(code), value: JSON.stringify({ projectId, customerId, at: new Date().toISOString(), usedAt: null }) } });
  await db.appSetting.create({ data: { key: byProject(projectId), value: code } });
  return code;
}

export async function rewardForProject(projectId: string): Promise<{ code: string; used: boolean } | null> {
  const row = await db.appSetting.findUnique({ where: { key: byProject(projectId) } });
  if (!row) return null;
  const data = await readReward(row.value);
  return data ? { code: row.value, used: Boolean(data.usedAt) } : null;
}

async function readReward(code: string) {
  const row = await db.appSetting.findUnique({ where: { key: key(code) } });
  if (!row) return null;
  try {
    return JSON.parse(row.value) as { projectId: string; customerId: string; usedAt: string | null };
  } catch {
    return null;
  }
}

/**
 * What the code takes off: one card brought down to $5. Zero unless the order is a Business Card order (the caller
 * passes the price of one card) and the code is real and unused.
 */
export async function resolveReviewReward(code: string, subtotalCents: number, cardUnitCents: number | undefined): Promise<number> {
  const c = code.trim().toUpperCase();
  if (!isReviewRewardCode(c) || !cardUnitCents || cardUnitCents <= REWARD_CARD_CENTS) return 0;
  const data = await readReward(c);
  if (!data || data.usedAt) return 0;
  return Math.max(0, Math.min(subtotalCents, cardUnitCents - REWARD_CARD_CENTS));
}

/** Uses up the code when the order it was applied to is paid. Only the first use counts. */
export async function consumeReviewReward(code: string | null | undefined, now = new Date()): Promise<boolean> {
  const c = (code ?? "").trim().toUpperCase();
  if (!isReviewRewardCode(c)) return false;
  const data = await readReward(c);
  if (!data || data.usedAt) return false;
  await db.appSetting.update({ where: { key: key(c) }, data: { value: JSON.stringify({ ...data, usedAt: now.toISOString() }) } });
  return true;
}
