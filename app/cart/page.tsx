import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = { title: "Your cart", robots: { index: false, follow: false } };

export default function Cart() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-screen bg-pc-bg pb-24 pt-32 text-pc-cream">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">Your cart</p>
          <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] sm:text-5xl">
            Saved for <i className="font-accent text-pc-sand">your next move.</i>
          </h1>
          <div className="mt-10">
            <CartPage />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
