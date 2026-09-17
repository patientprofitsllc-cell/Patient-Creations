import { db } from "@/lib/db";
import { InventoryAdjust } from "@/components/admin/InventoryAdjust";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await db.inventoryItem.findMany({ orderBy: { label: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ice">NFC Card Inventory</h2>
        <p className="mt-2 text-sm text-ice/50">
          Physical stock on hand. Auto-decrements when an order for that design is paid — Google Review's black/white
          split is fulfilled and adjusted by hand since checkout doesn't ask which color.
        </p>
      </div>
      <div className="glass-panel divide-y divide-white/5 rounded-2xl">
        {items.map((item) => {
          const low = item.quantityOnHand <= item.lowStockThreshold;
          return (
            <div key={item.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="text-ice">{item.label}</p>
                <p className="text-xs text-ice/40">{item.sku}</p>
              </div>
              <div className="text-right">
                <p className={low ? "font-display text-2xl text-red-400" : "font-display text-2xl text-gold"}>
                  {item.quantityOnHand}
                </p>
                {low && <p className="text-xs text-red-400">Low stock</p>}
              </div>
              <InventoryAdjust itemId={item.id} />
            </div>
          );
        })}
        {items.length === 0 && <p className="p-4 text-ice/40">No inventory tracked yet. Run the seed script.</p>}
      </div>
    </div>
  );
}
