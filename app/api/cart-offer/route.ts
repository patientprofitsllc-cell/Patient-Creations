import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCartOffer } from "@/lib/funnel/cartRecovery";
import { rateLimit } from "@/lib/security/rateLimit";

const NO_STORE = { "Cache-Control": "no-store" };
const schema = z.object({ visitorId: z.string().regex(/^[a-f0-9]{8,32}$/) });

// The Cart Recovery Agent's decision: does this visitor get the 5% return offer right now?
// The answer is a signed, expiring offer; nothing here changes a price by itself.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`cart-offer:${ip}`, 30, 60_000).allowed) return NextResponse.json({ offer: null }, { headers: NO_STORE });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ offer: null }, { headers: NO_STORE });

  try {
    return NextResponse.json({ offer: await evaluateCartOffer(body.data.visitorId) }, { headers: NO_STORE });
  } catch (err) {
    console.error("cart offer failed", err);
    return NextResponse.json({ offer: null }, { headers: NO_STORE });
  }
}
