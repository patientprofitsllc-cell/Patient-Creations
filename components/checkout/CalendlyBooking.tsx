"use client";

import Script from "next/script";
import { CALENDLY_URL } from "@/lib/config/calendly";

// Prefilling name/email means the Calendly invite that lands in Trenton's
// calendar already carries the same identity as the order in the CRM, so
// the two are easy to match up without asking the customer twice.
export function CalendlyBooking({ name, email }: { name: string; email: string }) {
  const prefillUrl = `${CALENDLY_URL}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&hide_gdpr_banner=1`;

  return (
    <div className="glass-panel mt-10 rounded-2xl p-6 text-left">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Kickoff Call</p>
      <h2 className="mt-2 font-display text-2xl text-ice">Grab a time on Trenton&apos;s calendar</h2>
      <p className="mt-2 text-sm text-ice/50">
        A quick 30-minute call to lock in scope and answer questions before the agents start building.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl">
        <div className="calendly-inline-widget" data-url={prefillUrl} style={{ minWidth: "280px", height: "700px" }} />
      </div>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
    </div>
  );
}
