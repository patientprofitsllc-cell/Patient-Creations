import Link from "next/link";
import { CONTACT_PHONE_DIGITS, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-obsidian px-6 py-16 text-sm text-ice/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:justify-between">
        <div>
          <p className="font-display text-lg text-ice">
            <span className="text-gold">Patient Profits LLC</span> · Patient Creations
          </p>
          <p className="mt-1 text-xs italic text-champagne/60">The Digital Master.</p>
          <p className="mt-3 max-w-xs text-ice/40">Patient Profits LLC, Global. Build once. Own the machine.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="mb-3 text-ice/70">Studio</p>
            <ul className="space-y-2">
              <li><Link href="/services" className="hover:text-gold">Services</Link></li>
              <li><Link href="/services#pricing" className="hover:text-gold">Pricing</Link></li>
              <li><Link href="/agents" className="hover:text-gold">Agent Network</Link></li>
              <li><Link href="/gallery" className="hover:text-gold">Fleet</Link></li>
              <li><Link href="/guided-app-tour" className="hover:text-gold">Guided Tour</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-ice/70">Account</p>
            <ul className="space-y-2">
              <li><Link href="/portal/dashboard" className="hover:text-gold">Portal</Link></li>
              <li><Link href="/portal/referrals" className="hover:text-gold">Referrals</Link></li>
              <li><Link href="/auth/login" className="hover:text-gold">Sign In</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 pt-8">
        <p className="text-ice/70">Have an NFC card?</p>
        <p className="mt-1">
          Call or text Patient Profits LLC at{" "}
          <a href={`tel:${CONTACT_PHONE_DIGITS}`} className="text-gold hover:brightness-110">
            {CONTACT_PHONE_DISPLAY}
          </a>
          {" · "}
          <a href={`sms:${CONTACT_PHONE_DIGITS}`} className="text-gold hover:brightness-110">
            Send a text
          </a>
        </p>
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs text-ice/30">
        © {new Date().getFullYear()} Patient Profits LLC · Patient Creations.
      </p>
    </footer>
  );
}
