"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { computeRushFeeCents, getApplicableSpeeds } from "@/lib/payments/deliverySpeed";
import { PAYMENT_METHODS } from "@/lib/payments/paymentMethods";
import type { PaymentMethod } from "@/lib/types";

interface ProductLite {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  type: string;
  turnaround?: string | null;
}

interface VariantLite {
  id: string;
  name: string;
  priceCents: number;
}

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function CheckoutForm({
  primaryProduct,
  variants,
  orderBumps,
  activeProjectCount,
}: {
  primaryProduct: ProductLite;
  variants: VariantLite[];
  orderBumps: ProductLite[];
  activeProjectCount: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const referralCode = params.get("ref") ?? undefined;
  const initialVariant = params.get("variant") ?? undefined;

  const [variantId, setVariantId] = useState<string | undefined>(
    variants.some((v) => v.id === initialVariant) ? initialVariant : undefined,
  );
  const [deliverySpeed, setDeliverySpeed] = useState<string>("standard");
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const primaryPriceCents = selectedVariant?.priceCents ?? primaryProduct.priceCents;
  const primaryLabel = selectedVariant
    ? `${primaryProduct.name} — ${selectedVariant.name}`
    : variants.length > 0
      ? `${primaryProduct.name} — Core`
      : primaryProduct.name;

  // Only offer rush tiers that are genuinely faster than this service's own
  // normal turnaround — never a paid "rush" option that's the same speed or
  // slower than what's already included.
  const applicableSpeeds = getApplicableSpeeds(primaryProduct.turnaround);
  const rushFeeCents = computeRushFeeCents(primaryPriceCents, deliverySpeed, activeProjectCount);
  const selectedSpeed = applicableSpeeds.find((s) => s.key === deliverySpeed) ?? applicableSpeeds[0];
  const bumpCount = selectedBumps.length;
  // "Standard" varies by build complexity — use this service's own estimate
  // rather than a one-size-fits-all number. Rush tiers are a fixed, paid
  // commitment regardless of the build, so they keep their own windows.
  const displayDays = (speedKey: string) => (speedKey === "standard" ? primaryProduct.turnaround ?? "1-2 weeks" : applicableSpeeds.find((s) => s.key === speedKey)!.days);

  const bumpTotal = orderBumps.filter((b) => selectedBumps.includes(b.id)).reduce((s, b) => s + b.priceCents, 0);
  const subtotal = primaryPriceCents + bumpTotal + rushFeeCents;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [primaryProduct.id, ...selectedBumps],
          primaryVariantId: variantId,
          deliverySpeed,
          paymentMethod,
          couponCode: coupon || undefined,
          referralCode,
          account: session?.user ? undefined : { name, email, password },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Checkout failed");
        setLoading(false);
        return;
      }
      router.push(data.redirectUrl);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const detailsValid = session?.user || (name && email && password.length >= 8);
  const selectedMethod = PAYMENT_METHODS.find((m) => m.key === paymentMethod)!;

  function goToPayment() {
    if (!detailsValid) return;
    setError(null);
    setStep("payment");
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        {step === "payment" ? (
          <div className="glass-panel rounded-2xl p-6">
            <button onClick={() => setStep("details")} className="mb-4 text-xs text-ice/40 hover:text-gold">
              ← Back to build details
            </button>
            <h2 className="mb-1 text-ice">Choose how you&apos;d like to pay</h2>
            <p className="mb-4 text-xs text-ice/40">
              Card checkout via Stripe processes instantly. Every other option is collected by Trenton directly —
              he&apos;ll follow up with instructions.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    paymentMethod === m.key ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/60 hover:border-gold/40"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {m.label}
                    {m.live && <span className="text-xs text-champagne">instant</span>}
                  </span>
                  <span className="mt-1 block text-xs text-ice/40">{m.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
        <>
        {variants.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="mb-4 text-ice">Choose a tier</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setVariantId(undefined)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  !variantId ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/60 hover:border-gold/40"
                }`}
              >
                Core
                <span className="mt-1 block text-xs text-ice/40">{money(primaryProduct.priceCents)} · essential scope</span>
              </button>
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    variantId === v.id ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/60 hover:border-gold/40"
                  }`}
                >
                  {v.name}
                  <span className="mt-1 block text-xs text-ice/40">{money(v.priceCents)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {applicableSpeeds.length > 1 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-1 text-ice">Delivery speed</h2>
          <p className="mb-4 text-xs text-ice/40">
            {activeProjectCount > 0
              ? `${activeProjectCount} build${activeProjectCount === 1 ? "" : "s"} currently in production — rush pricing reflects real queue load.`
              : "The queue is clear right now — rush pricing is at its lowest."}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {applicableSpeeds.map((s) => {
              const fee = computeRushFeeCents(primaryPriceCents, s.key, activeProjectCount);
              return (
                <button
                  key={s.key}
                  onClick={() => setDeliverySpeed(s.key)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    deliverySpeed === s.key ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/60 hover:border-gold/40"
                  }`}
                >
                  {s.label}
                  <span className="mt-1 block text-xs text-ice/40">{displayDays(s.key)}</span>
                  <span className="mt-1 block text-xs text-champagne">{fee > 0 ? `+${money(fee)}` : "included"}</span>
                </button>
              );
            })}
          </div>
          {deliverySpeed === "standard" && bumpCount > 0 && (
            <p className="mt-3 text-xs text-ice/40">
              Standard timelines stretch a bit with each add-on. Pick {applicableSpeeds.slice(1).map((s) => s.label).join(", ")} to
              lock in a guaranteed window regardless of what you add.
            </p>
          )}
        </div>
        )}

        {!session?.user && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="mb-4 text-ice">Create your account</h2>
            <div className="space-y-3">
              <label htmlFor="checkout-name" className="sr-only">Full name</label>
              <input
                id="checkout-name"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
                placeholder="Full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="checkout-email" className="sr-only">Email</label>
              <input
                id="checkout-email"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
                placeholder="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="checkout-password" className="sr-only">Password (min 8 characters)</label>
              <input
                id="checkout-password"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
                placeholder="Password (min 8 characters)"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {orderBumps.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="mb-4 text-ice">Add to your build</h2>
            {applicableSpeeds.length > 1 && (
              <p className="mb-4 text-xs text-ice/40">Each add-on can extend a Standard timeline — see delivery speed above.</p>
            )}
            <div className="space-y-3">
              {orderBumps.map((bump) => (
                <label key={bump.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 p-3 hover:border-gold/30">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedBumps.includes(bump.id)}
                    onChange={(e) =>
                      setSelectedBumps((prev) => (e.target.checked ? [...prev, bump.id] : prev.filter((id) => id !== bump.id)))
                    }
                  />
                  <span className="flex-1">
                    <span className="block text-ice">{bump.name}</span>
                    <span className="block text-sm text-ice/50">{bump.description}</span>
                  </span>
                  <span className="text-champagne">{money(bump.priceCents)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-ice">Coupon</h2>
          <label htmlFor="checkout-coupon" className="sr-only">Coupon code</label>
          <input
            id="checkout-coupon"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="Coupon code (optional)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
        </div>
        </>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="glass-panel h-fit rounded-2xl p-6">
        <h2 className="mb-4 text-ice">Order summary</h2>
        <div className="space-y-2 text-sm text-ice/70">
          <div className="flex justify-between">
            <span>{primaryLabel}</span>
            <span>{money(primaryPriceCents)}</span>
          </div>
          {orderBumps
            .filter((b) => selectedBumps.includes(b.id))
            .map((b) => (
              <div key={b.id} className="flex justify-between">
                <span>{b.name}</span>
                <span>{money(b.priceCents)}</span>
              </div>
            ))}
          {rushFeeCents > 0 && (
            <div className="flex justify-between">
              <span>Rush delivery — {selectedSpeed.label}</span>
              <span>{money(rushFeeCents)}</span>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-ice/40">Estimated delivery: {displayDays(deliverySpeed)}</p>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-xl text-champagne">
          <span>Total</span>
          <span>{money(subtotal)}</span>
        </div>
        <button
          onClick={step === "details" ? goToPayment : submit}
          disabled={loading || !detailsValid}
          className="mt-6 w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? "Processing…" : step === "details" ? "Continue to payment" : `Reserve this build — pay via ${selectedMethod.label}`}
        </button>
        <p className="mt-3 text-center text-xs text-ice/30">
          {step === "payment" && !selectedMethod.live
            ? "Your project starts production once Trenton confirms your payment."
            : "Secured checkout. Your project starts production immediately after payment is verified."}
        </p>
      </div>
    </div>
  );
}
