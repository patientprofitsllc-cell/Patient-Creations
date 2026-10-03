import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// "Leave an honest review, get a Business Card for $5": the reward never depends on the rating, works once, only on a
// card order, and never touches shipping.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ settings: [] as { key: string; value: string }[] }));
vi.mock("@/lib/db", () => ({
  db: {
    appSetting: {
      findUnique: async ({ where }: Row) => h.settings.find((s) => s.key === where.key) ?? null,
      create: async ({ data }: Row) => void h.settings.push({ ...data }),
      update: async ({ where, data }: Row) => Object.assign(h.settings.find((s) => s.key === where.key)!, data),
    },
  },
}));

import { REWARD_CARD_CENTS, consumeReviewReward, isReviewRewardCode, issueReviewReward, resolveReviewReward, rewardForProject } from "@/lib/reviews/reward";

beforeEach(() => {
  h.settings = [];
});

describe("the review thank-you", () => {
  it("issues one code per reviewed project, and the same code if they edit their review", async () => {
    const a = await issueReviewReward("p1", "c1");
    expect(isReviewRewardCode(a)).toBe(true);
    expect(await issueReviewReward("p1", "c1")).toBe(a);
    expect(await issueReviewReward("p2", "c1")).not.toBe(a);
    expect(await rewardForProject("p1")).toEqual({ code: a, used: false });
  });

  it("brings one card to $5 on a card order, and is worth nothing on anything else", async () => {
    const code = await issueReviewReward("p1", "c1");
    expect(REWARD_CARD_CENTS).toBe(500);
    expect(await resolveReviewReward(code, 6_000, 2_000)).toBe(1_500);
    expect(await resolveReviewReward(code, 125_000, undefined)).toBe(0);
    expect(await resolveReviewReward("CARD5-AAAAAAAA", 6_000, 2_000)).toBe(0);
  });

  it("works once: after the order is paid the code is used up", async () => {
    const code = await issueReviewReward("p1", "c1");
    expect(await consumeReviewReward(code)).toBe(true);
    expect(await consumeReviewReward(code)).toBe(false);
    expect(await resolveReviewReward(code, 6_000, 2_000)).toBe(0);
  });

  it("is given for every review whatever the rating, and the site discloses it next to reviews", () => {
    const route = readFileSync(join(process.cwd(), "app/api/portal/reviews/route.ts"), "utf8");
    expect(route).toContain("const rewardCode = await issueReviewReward(project.id, project.customerId);");
    expect(route).not.toMatch(/rating\s*>=?\s*[45][\s\S]{0,80}issueReviewReward/);
    expect(readFileSync(join(process.cwd(), "components/home/experience/Proof.tsx"), "utf8")).toContain("good or bad, can get one Business Card");
  });

  it("only discounts the card: shipping is added after the discount", () => {
    const pricing = readFileSync(join(process.cwd(), "lib/payments/pricing.ts"), "utf8");
    expect(pricing).toMatch(/Math\.max\(0, subtotalCents - discountCents \+ shipping\.cents\)/);
  });
});
