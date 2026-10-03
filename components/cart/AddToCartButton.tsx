"use client";

import Link from "next/link";
import { gaEvent } from "@/lib/analytics/ga";
import { addToCart, isCartable } from "@/lib/cart/store";
import { useCart } from "./useCart";

/** Saves a product to the cart (or, once it's there, links to the cart). Renders nothing for products that can't go in it. */
export function AddToCartButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { ready, has } = useCart();
  if (!isCartable(slug)) return null;
  // Until the cart has been read from this device, hold the space (same height) so the button never flashes the wrong state.
  if (!ready) return <span aria-hidden className={`inline-block min-h-[44px] ${className}`} />;
  if (has(slug))
    return (
      <Link href="/cart" className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm text-pc-sand underline-offset-4 hover:underline ${className}`}>
        ✓ In your cart · View
      </Link>
    );
  return (
    <button
      type="button"
      onClick={() => {
        addToCart(slug);
        gaEvent("add_to_cart", { item_id: slug });
      }}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-pc-cream transition hover:border-pc-sand hover:text-pc-sand active:scale-[0.98] ${className}`}
    >
      + Add to cart
    </button>
  );
}
