"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usd } from "@/lib/pricing/catalog";
import { CartSync } from "./CartSync";
import { useCart } from "./useCart";

const SEEN_KEY = "pc-cart-seen";
const AWAY_MS = 30 * 60_000;

/**
 * The cart in the header: a bag with how many items are waiting and what they come to. When someone comes back to the
 * site with items still in their cart, it reminds them once per visit: what's left and how much.
 */
export function CartButton() {
  const { ready, count, totalCents, anyFrom, quoted } = useCart();
  const [welcome, setWelcome] = useState(false);
  // When the visitor was last here, read once before this visit overwrites it.
  const [lastSeen] = useState(() => {
    try {
      return Number(localStorage.getItem(SEEN_KEY) ?? 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (!ready || count === 0 || quoted.length === 0) return;
    try {
      const last = lastSeen;
      const shown = sessionStorage.getItem("pc-cart-welcomed") === "1";
      if (!shown && last && Date.now() - last > AWAY_MS && !location.pathname.startsWith("/cart") && !location.pathname.startsWith("/checkout")) {
        setWelcome(true);
        sessionStorage.setItem("pc-cart-welcomed", "1");
      }
    } catch {
      /* storage blocked */
    }
  }, [ready, count, quoted.length, lastSeen]);

  // Remember when the visitor was last here, so the reminder only greets real return visits.
  useEffect(() => {
    const mark = () => {
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    };
    mark();
    window.addEventListener("pagehide", mark);
    return () => window.removeEventListener("pagehide", mark);
  }, []);

  const total = `${anyFrom ? "from " : ""}${usd(totalCents)}`;
  return (
    <>
      <CartSync />
      {count > 0 && (
        <Link href="/cart" aria-label={`Cart: ${count} ${count === 1 ? "item" : "items"}, ${total}`} className="relative inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-pc-cream hover:text-pc-sand">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="absolute -right-0.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pc-sand px-1 text-[0.7rem] font-bold text-pc-ink">{count}</span>
          {quoted.length > 0 && <span className="hidden text-sm xl:inline">{total}</span>}
        </Link>
      )}
      {welcome && (
        <div role="status" className="fixed inset-x-3 top-[4.5rem] z-50 mx-auto max-w-md rounded-2xl border border-pc-sand/40 bg-pc-panel/95 p-4 text-pc-cream shadow-2xl shadow-black/50 backdrop-blur sm:right-6 sm:left-auto">
          <p className="text-sm">
            Welcome back. You still have <b>{count} {count === 1 ? "item" : "items"}</b> in your cart, <b className="text-pc-sand">{total}</b> you haven&apos;t checked out yet.
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/cart" onClick={() => setWelcome(false)} className="inline-flex min-h-[44px] items-center rounded-lg bg-pc-sand px-4 text-sm font-semibold text-pc-ink">
              View my cart
            </Link>
            <button type="button" onClick={() => setWelcome(false)} className="min-h-[44px] px-3 text-sm text-pc-mute hover:text-pc-cream">
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
