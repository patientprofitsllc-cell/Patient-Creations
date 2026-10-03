"use client";

import Link from "next/link";
import { useEffect } from "react";
import { gaEvent } from "@/lib/analytics/ga";
import { removeFromCart } from "@/lib/cart/store";
import { usd } from "@/lib/pricing/catalog";
import { useCart } from "./useCart";

/** Everything saved to buy, at live prices. Each item checks out through its own checkout, where tiers and extras are chosen. */
export function CartPage() {
  const { ready, count, quoted, totalCents, anyFrom } = useCart();
  useEffect(() => {
    if (ready && count) gaEvent("view_cart", { items: count, value: totalCents / 100, currency: "USD" });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <div className="h-64" />;
  if (count === 0)
    return (
      <div className="rounded-2xl border border-white/10 bg-pc-panel p-10 text-center">
        <p className="text-2xl font-light">Your cart is empty.</p>
        <p className="mt-2 text-pc-mute">Add anything from the price list and it&apos;ll wait here, even if you leave and come back later.</p>
        <Link href="/#products" className="mt-6 inline-flex min-h-[52px] items-center rounded-xl bg-pc-sand px-6 font-semibold text-pc-ink">
          See products and prices
        </Link>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <ul className="space-y-4">
        {quoted.map((q) => (
          <li key={q.slug} className="rounded-2xl border border-white/10 bg-pc-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl">{q.name}</p>
                <p className="mt-1 text-sm text-pc-mute">{q.line}</p>
              </div>
              <p className="whitespace-nowrap text-right">
                {q.from && <span className="block text-xs text-pc-mute">from</span>}
                <span className="text-2xl font-light">{usd(q.priceCents)}</span>
                {q.unit && <span className="block text-xs text-pc-mute">{q.unit}</span>}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/checkout?product=${q.slug}`}
                onClick={() => gaEvent("begin_checkout_from_cart", { item_id: q.slug })}
                className="inline-flex min-h-[48px] items-center rounded-xl bg-pc-sand px-5 text-sm font-semibold text-pc-ink"
              >
                Check out this item →
              </Link>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(q.slug);
                  gaEvent("remove_from_cart", { item_id: q.slug });
                }}
                className="min-h-[48px] px-3 text-sm text-pc-mute hover:text-pc-cream"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="rounded-2xl border border-pc-sand/40 bg-pc-panel p-6 lg:sticky lg:top-28">
        <p className="text-xs uppercase tracking-[0.2em] text-pc-sand">Still in your cart</p>
        <p className="mt-2 text-5xl font-light tracking-tight">
          {anyFrom && <span className="text-lg text-pc-mute">from </span>}
          {usd(totalCents)}
        </p>
        <p className="mt-1 text-sm text-pc-mute">
          {count} {count === 1 ? "item" : "items"} not checked out yet
        </p>
        <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-pc-mute">
          <li>• Each item checks out on its own, so you can pick its tier and extras.</li>
          <li>• Paid items leave your cart. The rest waits for you, on this device and in your account.</li>
          <li>• Prices are live, so what you see is what checkout charges.</li>
        </ul>
        {quoted[0] && (
          <Link href={`/checkout?product=${quoted[0].slug}`} className="cta-primary mt-6 flex min-h-[56px] items-center justify-center rounded-xl bg-pc-sand font-semibold text-pc-ink">
            Start with {quoted[0].name} →
          </Link>
        )}
      </aside>
    </div>
  );
}
