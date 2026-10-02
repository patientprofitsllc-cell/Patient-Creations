import { scopeFor, scopeForTier, type ScopeTier } from "@/lib/site/productScopes";

const HIGHER: Record<ScopeTier, ("Signature" | "Flagship")[]> = { Core: ["Signature", "Flagship"], Signature: ["Flagship"], Flagship: [] };

/**
 * What a build includes and does not include. Without a tier (the /services cards), it shows the base list and what each
 * higher tier adds. With a tier (checkout), it shows exactly what that tier includes, upgraded lines in place, and only
 * what the tiers above it would add. Everything comes from lib/site/productScopes.ts.
 */
export function ScopePanel({ slug, tier, open = false, className = "" }: { slug: string; tier?: ScopeTier; open?: boolean; className?: string }) {
  const scope = scopeFor(slug);
  if (!scope) return null;
  const { includes, notIncluded } = tier ? scopeForTier(scope, tier) : scope;
  const higher = scope.tierAdds ? HIGHER[tier ?? "Core"] : [];
  return (
    <details open={open} className={`w-full text-left ${className}`}>
      <summary className="flex min-h-[44px] cursor-pointer items-center justify-center text-sm text-ice/70 hover:text-gold">
        {tier && scope.tierAdds ? `What ${tier} includes` : "What is included"}
      </summary>
      <ul className="mt-2 space-y-1.5" aria-live="polite">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
            <span aria-hidden className="mt-0.5 text-gold">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      {higher.length > 0 && (
        <div className="mt-4 space-y-2">
          {higher.map((t) => {
            // Flagship includes everything Signature adds, so when both are listed, Flagship shows only what's new.
            const lines = t === "Flagship" && higher.includes("Signature") ? scope.tierAdds![t].filter((l) => !scope.tierAdds!.Signature.includes(l)) : scope.tierAdds![t];
            const label = t === "Flagship" && higher.includes("Signature") ? "Flagship adds, on top of Signature:" : `${t} adds:`;
            return (
              <p key={t} className="text-xs text-ice/60">
                <span className="text-gold/80">{label}</span> {lines.join("; ")}.
              </p>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ice/40">Not included</p>
      <ul className="mt-2 space-y-1">
        {notIncluded.map((item) => (
          <li key={item} className="flex items-start gap-3 text-xs text-ice/60">
            <span aria-hidden className="mt-0.5 text-ice/40">
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>
    </details>
  );
}
