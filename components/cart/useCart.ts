"use client";

import { useCallback, useEffect, useState } from "react";
import { CART_EVENT, readCart, type CartItem } from "@/lib/cart/store";

export interface QuotedItem {
  slug: string;
  name: string;
  line: string;
  unit: string | null;
  priceCents: number;
  from: boolean;
}

/** The cart on this device, with live names and prices. Re-reads whenever the cart changes anywhere on the page. */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [quoted, setQuoted] = useState<QuotedItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setItems(readCart());
    read();
    setReady(true);
    window.addEventListener(CART_EVENT, read);
    window.addEventListener("storage", read); // another tab
    return () => {
      window.removeEventListener(CART_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const key = items.map((i) => i.slug).join(",");
  useEffect(() => {
    if (!key) {
      setQuoted([]);
      return;
    }
    let live = true;
    fetch(`/api/cart/quote?slugs=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d: { items?: QuotedItem[] }) => {
        if (live) setQuoted(key.split(",").map((s) => d.items?.find((q) => q.slug === s)).filter((q): q is QuotedItem => Boolean(q)));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);

  const totalCents = quoted.reduce((sum, q) => sum + q.priceCents, 0);
  const anyFrom = quoted.some((q) => q.from);
  const oldest = items.reduce<string | null>((o, i) => (!o || i.addedAt < o ? i.addedAt : o), null);
  return { ready, items, quoted, count: items.length, totalCents, anyFrom, oldest, has: useCallback((slug: string) => items.some((i) => i.slug === slug), [items]) };
}
