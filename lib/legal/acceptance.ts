import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { LEGAL_VERSION } from "@/lib/legal/config";

/**
 * Records that someone agreed to the legal terms: which version, when, and from
 * where. This is the evidence behind the agreement (including arbitration), so a
 * failure to write it must not be silent, and it never blocks the customer's
 * order: it is logged loudly instead.
 */
export async function recordAcceptance(input: { scope: "ORDER" | "CARE_PLAN" | "AD_PLAN"; refId: string; customerId?: string | null; req: NextRequest }) {
  try {
    await db.termsAcceptance.create({
      data: {
        scope: input.scope,
        refId: input.refId,
        customerId: input.customerId ?? null,
        version: LEGAL_VERSION,
        ip: input.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
        userAgent: input.req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });
  } catch (err) {
    console.error(`COULD NOT RECORD TERMS ACCEPTANCE for ${input.scope} ${input.refId}`, err);
  }
}
