"use client";

import { useEffect } from "react";
import { CART_EVENT, mergeCarts, readCart, writeCart } from "@/lib/cart/store";

/**
 * Keeps a signed-in customer's cart the same on every device: on load it merges the account's saved cart with this
 * device's, then saves every change back. For visitors who aren't signed in it does nothing (the account answers 401).
 */
export function CartSync() {
  useEffect(() => {
    let signedIn = false;
    let timer: number | undefined;
    const save = () =>
      fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: readCart() }) }).catch(() => {});

    fetch("/api/cart")
      .then(async (r) => {
        if (!r.ok) return;
        signedIn = true;
        const d = (await r.json()) as { items?: unknown };
        const merged = mergeCarts(readCart(), Array.isArray(d.items) ? (d.items as never) : []);
        writeCart(merged, { sync: false });
        save();
      })
      .catch(() => {});

    const onChange = (e: Event) => {
      if (!signedIn || (e as CustomEvent<{ sync?: boolean }>).detail?.sync === false) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(save, 400);
    };
    window.addEventListener(CART_EVENT, onChange);
    return () => window.removeEventListener(CART_EVENT, onChange);
  }, []);
  return null;
}
