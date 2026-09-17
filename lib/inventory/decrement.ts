import { db } from "@/lib/db";

/**
 * Decrements on-hand stock for a just-paid order's Merch line items. Only
 * touches InventoryItem rows with a matching productSlug — designs with an
 * ambiguous color split (e.g. Google Review black/white) have no productSlug
 * and are decremented by hand once admin knows which color went out.
 * Never drops a count below zero.
 */
export async function decrementInventoryForOrder(orderId: string) {
  const items = await db.orderItem.findMany({
    where: { orderId },
    include: { product: true },
  });

  for (const item of items) {
    if (item.product.category !== "Merch") continue;

    const inventoryItem = await db.inventoryItem.findFirst({ where: { productSlug: item.product.slug } });
    if (!inventoryItem) continue;

    await db.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantityOnHand: Math.max(0, inventoryItem.quantityOnHand - item.quantity) },
    });
  }
}
