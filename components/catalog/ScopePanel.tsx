import { scopeFor } from "@/lib/site/productScopes";

/**
 * What a build includes and does not include, with what the higher tiers add. Renders nothing for
 * a product that has no written scope. Everything comes from lib/site/productScopes.ts.
 */
export function ScopePanel({ slug, open = false, className = "" }: { slug: string; open?: boolean; className?: string }) {
  const scope = scopeFor(slug);
  if (!scope) return null;
  return (
    <details open={open} className={`w-full text-left ${className}`}>
      <summary className="flex min-h-[44px] cursor-pointer items-center justify-center text-sm text-ice/70 hover:text-gold">What is included</summary>
      <ul className="mt-2 space-y-1.5">
        {scope.includes.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
            <span aria-hidden className="mt-0.5 text-gold">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      {scope.tierAdds && (
        <div className="mt-4 space-y-2">
          {(["Signature", "Flagship"] as const).map((tier) => (
            <p key={tier} className="text-xs text-ice/60">
              <span className="text-gold/80">{tier} adds:</span> {scope.tierAdds![tier].join("; ")}.
            </p>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ice/40">Not included</p>
      <ul className="mt-2 space-y-1">
        {scope.notIncluded.map((item) => (
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
