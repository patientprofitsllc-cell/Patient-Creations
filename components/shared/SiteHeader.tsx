"use client";

import { useState } from "react";
import Link from "next/link";

import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

const NAV = [
  { href: "/audit", label: "Growth Audit" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/monthly-ads", label: "Monthly Ads" },
  { href: "/services", label: "Services" },
  { href: "/agents", label: "Agent Network" },
  { href: "/guided-app-tour", label: "Guided Tour" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-obsidian/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
        {/* Stacked on phones so the name never wraps mid-phrase; one line from tablet up. */}
        <Link href="/" className="py-1 leading-tight tracking-wide text-ice" onClick={() => setOpen(false)}>
          <span className="block text-sm font-semibold text-gold sm:inline">Patient Profits LLC</span>
          <span className="block text-xs text-ice/50 sm:ml-2 sm:inline sm:text-sm sm:font-semibold sm:text-ice/40">
            <span aria-hidden className="hidden sm:inline">· </span>Patient Creations
          </span>
        </Link>
        <nav className="hidden items-center gap-8 whitespace-nowrap text-sm tracking-wide text-ice/70 xl:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/portal/dashboard" className="hidden text-sm text-ice/70 hover:text-gold sm:block">
            Portal
          </Link>
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="hidden rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 py-2 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110 sm:block"
          >
            Build my website
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-ice xl:hidden"
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 top-0 h-px w-4 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-px w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-px w-4 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-obsidian px-6 py-4 text-sm xl:hidden">
          <ul className="space-y-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-2 text-ice/80 hover:text-gold" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/portal/dashboard" className="block py-2 text-ice/80 hover:text-gold" onClick={() => setOpen(false)}>
                Portal
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href={OFFER_CHECKOUT_HREF}
                onClick={() => setOpen(false)}
                className="block rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 py-3 text-center font-semibold text-obsidian"
              >
                Build my website
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
