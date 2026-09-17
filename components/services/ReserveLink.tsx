"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Reads ?ref= client-side so the parent /services page never touches
// searchParams itself — that's what let the page opt into full static
// rendering + ISR instead of being forced dynamic on every request.
export function ReserveLink({ slug }: { slug: string }) {
  const params = useSearchParams();
  const ref = params.get("ref");
  const href = `/checkout?product=${slug}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;

  return (
    <Link
      href={href}
      className="mt-6 rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-center text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
    >
      Reserve this build
    </Link>
  );
}
