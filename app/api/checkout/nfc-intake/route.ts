import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { NFC_ADDON_SLUG } from "@/lib/payments/nfcAddon";

// The only design that ships in two colors and needs the choice captured
// here — checkout itself never asks, so this is the one place we learn it.
const COLOR_CHOICE_SLUG = "nfc-google-review";

const intakeSchema = z
  .object({
    orderId: z.string().min(1),
    socialMediaPage: z.string().trim().max(500).optional(),
    nfcContent: z.string().trim().min(1).max(500),
    targetLink: z.string().trim().min(1).max(500),
    cardColor: z.enum(["black", "white"]).optional(),
    phone: z.string().trim().min(1).max(50),
    email: z.string().trim().email(),
  });

export async function POST(req: NextRequest) {
  const body = intakeSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const { orderId, ...answers } = body.data;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const primaryItem = order.items[0];
  const primaryQuantity = primaryItem?.quantity ?? 1;
  // Eligible either as a standalone card order (primary item is Merch) or as
  // a bundled card add-on on a service build.
  const isEligible = primaryItem?.product.category === "Merch" || order.items.some((i) => i.product.slug === NFC_ADDON_SLUG);
  if (!isEligible) {
    return NextResponse.json({ error: "This order doesn't take card specs" }, { status: 400 });
  }
  if (primaryItem?.product.slug === COLOR_CHOICE_SLUG && !answers.cardColor) {
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
  if (!existing && primaryItem?.product.slug === COLOR_CHOICE_SLUG && answers.cardColor) {
    const sku = `nfc-google-review-${answers.cardColor}`;
    const inventoryItem = await db.inventoryItem.findUnique({ where: { sku } });
    if (inventoryItem) {
      await db.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantityOnHand: Math.max(0, inventoryItem.quantityOnHand - primaryQuantity) },
      });
    }
  }

  await logEvent("nfc_intake.submitted", "Order", orderId, {});

  return NextResponse.json({ intake });
}
