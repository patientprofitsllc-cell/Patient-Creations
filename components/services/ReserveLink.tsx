"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CARD_CTA_CLASS } from "@/components/home/specialFrame";

// Reads ?ref= client-side so the parent /services page never touches
// searchParams itself — that's what let the page opt into full static
// rendering + ISR instead of being forced dynamic on every request.
export function ReserveLink({ slug }: { slug: string }) {
  const params = useSearchParams();
  const ref = params.get("ref");
  const href = `/checkout?product=${slug}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;

  return (
    <Link href={href} className={CARD_CTA_CLASS}>
      Reserve this build
    </Link>
  );
}
