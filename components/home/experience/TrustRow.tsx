import { Stagger } from "@/components/motion/Reveal";
import { BNPL, SPECIAL_CARE_MONTHS, usd } from "@/lib/pricing/catalog";

/**
 * What makes buying safe, stated only where it's true: every line here is a rule the site and the Terms already keep.
 */
export function TrustRow({ revisionsWebsiteSpecial, bnpl }: { revisionsWebsiteSpecial: number; bnpl: boolean }) {
  const items = [
    { title: "See it before it goes live", body: "A private preview to approve first." },
    { title: `${revisionsWebsiteSpecial} revision round${revisionsWebsiteSpecial === 1 ? "" : "s"} included`, body: "Tell us what to change. We change it." },
    { title: `${SPECIAL_CARE_MONTHS} months of care included`, body: "Small updates handled, on the Website Special." },
    bnpl
      ? { title: "Pay over time", body: `Klarna or Afterpay on orders of ${usd(BNPL.minCents)} or more.` }
      : { title: "Secure checkout", body: "Card payments through Stripe. We never see your card." },
  ];
  return (
    <section aria-label="Why it's safe to start" className="border-y border-white/5 bg-white/[0.02]">
      <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-5 px-5 py-8 sm:px-6 md:grid-cols-4" step={80}>
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-ice">{it.title}</p>
              <p className="text-xs text-ice/50">{it.body}</p>
            </div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}
