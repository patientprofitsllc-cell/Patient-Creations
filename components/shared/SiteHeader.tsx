"use client";

import { useState } from "react";
import Link from "next/link";

import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

// Kept short on purpose: products, the one recurring plan, proof, answers, and advice. Everything else is in the footer.
const NAV = [
  { href: "/pricing", label: "Products & Prices" },
  { href: "/monthly-ads", label: "Monthly Ads" },
  { href: "/examples", label: "Examples" },
  { href: "/faq", label: "FAQ" },
  { href: "/audit", label: "Growth Audit" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.07] bg-pc-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <Link href="/" aria-label="Patient Creations, home" className="flex items-center gap-2 py-1 text-pc-cream" onClick={() => setOpen(false)}>
          <span aria-hidden className="relative font-accent text-[2.1rem] leading-none text-pc-sand">
            pc<span className="absolute -right-2.5 -top-1 text-sm">✦</span>
          </span>
          <span className="ml-2 text-[0.95rem] leading-[1.05] tracking-tight">
            patient
            <br />
            creations.
          </span>
        </Link>
        <nav className="hidden items-center gap-8 whitespace-nowrap text-sm tracking-wide text-ice/70 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-pc-sand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/portal/dashboard" className="hidden text-sm text-ice/70 hover:text-pc-sand sm:block">
            Portal
          </Link>
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-pc-sand px-4 text-sm font-semibold text-pc-ink transition hover:brightness-110 active:scale-[0.97]"
          >
            Start a project
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center text-pc-cream lg:hidden"
          >
            <span className="relative block h-2.5 w-7">
              <span className={`absolute left-0 top-0 h-px w-7 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-2.5 h-px w-7 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-pc-bg px-6 py-4 text-sm lg:hidden">
          <ul className="space-y-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-2 text-ice/80 hover:text-pc-sand" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/portal/dashboard" className="block py-2 text-ice/80 hover:text-pc-sand" onClick={() => setOpen(false)}>
                Portal
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href={OFFER_CHECKOUT_HREF}
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-pc-sand px-5 py-3 text-center font-semibold text-pc-ink"
              >
                Start a project
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
