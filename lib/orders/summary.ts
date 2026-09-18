/**
 * One readable line for an order's items. Rows for the same product are merged
 * (the card add-on can be split into two priced lines) and quantities shown,
 * e.g. "Starter Website, NFC Card — Your Choice × 10".
 */
export function summarizeItems(
  items: { productId: string; quantity: number; product: { name: string } }[],
): string {
  const byProduct = new Map<string, { name: string; qty: number }>();
  for (const item of items) {
    const existing = byProduct.get(item.productId);
    if (existing) existing.qty += item.quantity;
    else byProduct.set(item.productId, { name: item.product.name, qty: item.quantity });
  }
  return Array.from(byProduct.values())
    .map((e) => (e.qty > 1 ? `${e.name} × ${e.qty}` : e.name))
    .join(", ");
}
