"use client";

import { useEffect } from "react";
import { removeManyFromCart } from "@/lib/cart/store";

/** On the thank-you page: takes what was just paid for out of the cart (here and in the account). */
export function CartPaid({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    if (slugs.length) removeManyFromCart(slugs);
  }, [slugs]);
  return null;
}
