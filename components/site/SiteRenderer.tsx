import type { CSSProperties } from "react";
import type { SampleSite } from "@/lib/site/industries";

// Picks black or white text for a button so it stays readable on any accent color.
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? "#111111" : "#ffffff";
}

const CTA_HINT: Record<SampleSite["ctaKind"], string> = {
  call: "Tap to call",
  text: "Tap to text",
  book: "Opens your booking link",
  quote: "Opens a quote request",
  visit: "Opens directions",
};

/**
 * Renders a full one-page business site from structured content plus design
 * tokens (colors, type, radius). The same renderer serves the public sample
 * designs today and customer previews later, so one component library can
 * produce many different-looking sites without redesigning each from scratch.
 * Buttons here are inert on purpose: samples aren't real businesses.
 */
export function SiteRenderer({ site }: { site: SampleSite }) {
  const t = site.tokens;
  const headingFont = t.heading === "serif" ? "var(--font-display), Georgia, serif" : "var(--font-body), system-ui, sans-serif";
  const bodyFont = "var(--font-body), system-ui, sans-serif";
  const onAccent = readableOn(t.accent);
  const line = `${t.muted}33`;

  const root: CSSProperties = { background: t.bg, color: t.text, fontFamily: bodyFont };
  const button: CSSProperties = {
    background: t.accent,
    color: onAccent,
    borderRadius: t.radius,
    fontFamily: bodyFont,
  };
  const card: CSSProperties = { background: t.surface, borderRadius: t.radius, border: `1px solid ${line}` };

  return (
    <div style={root} className="overflow-hidden">
      <div style={{ borderBottom: `1px solid ${line}` }} className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <span style={{ fontFamily: headingFont }} className="text-lg font-semibold sm:text-xl">
          {site.businessName}
        </span>
        <span style={button} className="hidden px-4 py-2 text-sm font-semibold sm:inline-block">
          {site.ctaLabel}
        </span>
      </div>

      <section className="px-5 py-14 text-center sm:px-8 sm:py-20">
        <h1 style={{ fontFamily: headingFont }} className="mx-auto max-w-2xl text-4xl leading-tight sm:text-5xl">
          {site.tagline}
        </h1>
        <p style={{ color: t.muted }} className="mx-auto mt-4 max-w-xl text-base sm:text-lg">
          {site.about}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <span style={button} className="inline-block px-7 py-3 text-sm font-semibold">
            {site.ctaLabel}
          </span>
          <span style={{ color: t.text, border: `1px solid ${line}`, borderRadius: t.radius }} className="inline-block px-7 py-3 text-sm">
            {site.phone}
          </span>
        </div>
        <p style={{ color: t.muted }} className="mt-3 text-xs">
          {CTA_HINT[site.ctaKind]}
        </p>
      </section>

      <section className="px-5 pb-14 sm:px-8">
        <h2 style={{ fontFamily: headingFont }} className="mb-6 text-center text-2xl sm:text-3xl">
          Services
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {site.services.map((s) => (
            <div key={s.name} style={card} className="p-5">
              <p style={{ fontFamily: headingFont }} className="text-lg">
                {s.name}
              </p>
              <p style={{ color: t.muted }} className="mt-1 text-sm">
                {s.blurb}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: t.surface }} className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {site.highlights.map((h) => (
            <div key={h}>
              <span style={{ background: t.accent }} className="mx-auto mb-3 block h-1 w-10 rounded-full" />
              <p className="text-sm font-semibold">{h}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div style={card} className="mx-auto grid max-w-3xl grid-cols-1 gap-6 p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <p style={{ color: t.muted }} className="text-xs uppercase tracking-wide">
              Hours
            </p>
            <p className="mt-1 text-sm">{site.hours}</p>
          </div>
          <div>
            <p style={{ color: t.muted }} className="text-xs uppercase tracking-wide">
              Location
            </p>
            <p className="mt-1 text-sm">{site.address}</p>
          </div>
          <div>
            <p style={{ color: t.muted }} className="text-xs uppercase tracking-wide">
              Phone
            </p>
            <p className="mt-1 text-sm">{site.phone}</p>
          </div>
        </div>
      </section>

      <div style={{ borderTop: `1px solid ${line}`, color: t.muted }} className="px-5 py-6 text-center text-xs sm:px-8">
        {site.businessName} · Sample design
      </div>
    </div>
  );
}
