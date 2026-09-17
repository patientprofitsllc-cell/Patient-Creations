import type { PaymentMethod } from "@/lib/types";

// Client-safe — no @/lib/db import. Only "stripe" is a live, automatic
// charge; the other nine are manual-collection methods Trenton reaches out
// to complete himself, tracked via Order.paymentMethod and surfaced in the
// admin CRM (see app/admin/dashboard/page.tsx).
export const PAYMENT_METHODS: { key: PaymentMethod; label: string; blurb: string; live: boolean }[] = [
  { key: "stripe", label: "Credit / Debit Card", blurb: "Instant, automatic. Production starts right away.", live: true },
  { key: "zelle", label: "Zelle", blurb: "Trenton sends Zelle instructions.", live: false },
  { key: "apple_pay", label: "Apple Pay", blurb: "Trenton sends an Apple Pay request.", live: false },
];

export function paymentMethodLabel(key: string) {
  return PAYMENT_METHODS.find((m) => m.key === key)?.label ?? key;
}
