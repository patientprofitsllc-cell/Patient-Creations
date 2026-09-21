import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { NFC_ADDON_SLUG, includedCardCount } from "@/lib/payments/nfcAddon";
import { rateLimit } from "@/lib/security/rateLimit";
import { ORDER_KEY_SHAPE, orderAccessOk } from "@/lib/orders/accessKey";

// The only design that ships in two colors and needs the choice captured
// here — checkout itself never asks, so this is the one place we learn it.
const COLOR_CHOICE_SLUG = "nfc-google-review";

const intakeSchema = z
  .object({
    orderId: z.string().min(1).max(60),
    // The private key from the confirmation link. An order id alone is not enough.
    k: z.string().regex(ORDER_KEY_SHAPE),
    socialMediaPage: z.string().trim().max(500).optional(),
    nfcContent: z.string().trim().min(1).max(500),
    targetLink: z.string().trim().min(1).max(500),
    cardColor: z.enum(["black", "white"]).optional(),
    phone: z.string().trim().min(1).max(50),
    email: z.string().trim().email(),
  });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`nfc-intake:${ip}`, 30, 60_000).allowed) return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });

  const body = intakeSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const { orderId, k, ...answers } = body.data;

  // A wrong order id and a wrong key look exactly the same, so this cannot be used to find out which orders exist.
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order || !orderAccessOk(order.accessToken, k)) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!["PENDING", "PAID"].includes(order.status)) return NextResponse.json({ error: "This order can no longer take card specs." }, { status: 409 });
  const primaryItem = order.items[0];
  // Google Review cards can be anywhere in the order (a mixed pack has one line per design).
  const googleReviewQty = order.items
    .filter((i) => i.product.slug === COLOR_CHOICE_SLUG)
    .reduce((sum, i) => sum + i.quantity, 0);
  // Eligible either as a standalone card order (primary item is Merch) or as
  // a bundled card add-on on a service build.
  const isEligible =
    primaryItem?.product.category === "Merch" ||
    includedCardCount(primaryItem?.product.slug) > 0 ||
    order.items.some((i) => i.product.slug === NFC_ADDON_SLUG);
  if (!isEligible) {
    return NextResponse.json({ error: "This order doesn't take card specs" }, { status: 400 });
  }
  if (googleReviewQty > 0 && !answers.cardColor) {
    return NextResponse.json({ error: "Please choose a card color" }, { status: 400 });
  }

  const existing = await db.nfcIntake.findUnique({ where: { orderId } });

  const intake = await db.nfcIntake.upsert({
    where: { orderId },
    create: { orderId, ...answers },
    update: answers,
  });

  // Decrement the matching color bucket the first time we learn it — not on
  // every edit, or re-saving the form after a typo fix would double-count.
  if (!existing && googleReviewQty > 0 && answers.cardColor) {
    const sku = `nfc-google-review-${answers.cardColor}`;
    const inventoryItem = await db.inventoryItem.findUnique({ where: { sku } });
    if (inventoryItem) {
      await db.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantityOnHand: Math.max(0, inventoryItem.quantityOnHand - googleReviewQty) },
      });
    }
  }

  await logEvent("nfc_intake.submitted", "Order", orderId, {});

  return NextResponse.json({ ok: true });
}
