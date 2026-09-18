import Image from "next/image";
import Link from "next/link";
import { NfcOrderPicker } from "@/components/cinematic/NfcOrderPicker";
import { SPECIAL_FRAME, money } from "./specialFrame";

const NFC_SHOWCASE = [
  { name: "Google Review", slug: "nfc-google-review", src: "/assets/nfc-cards/google-review.jpeg" },
  { name: "YouTube", slug: "nfc-youtube", src: "/assets/nfc-cards/youtube.jpeg" },
  { name: "Custom Menu", slug: "nfc-custom-menu", src: "/assets/nfc-cards/menu.jpeg" },
  { name: "WhatsApp", slug: "nfc-whatsapp", src: "/assets/nfc-cards/whatsapp.jpeg" },
  { name: "Instagram", slug: "nfc-instagram", src: "/assets/nfc-cards/instagram.jpeg" },
  { name: "TikTok", slug: "nfc-tiktok", src: "/assets/nfc-cards/tiktok.jpeg" },
  { name: "WiFi", slug: "nfc-wifi", src: "/assets/nfc-cards/wifi.jpeg" },
];

export function NfcShowcase({ priceCents }: { priceCents: number }) {
  return (
    <section id="nfc" className="mx-auto max-w-4xl scroll-mt-24 px-6 pt-16">
      <div className={`${SPECIAL_FRAME} p-6 sm:p-10`}>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-gold/70">Real cards, real designs</p>
        <p className="mx-auto mb-6 mt-2 max-w-md text-center text-sm text-ice/50">
          Tap a design to order that exact card, or pick one below.
        </p>
        <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-7">
          {NFC_SHOWCASE.map((card) => (
            <Link
              key={card.slug}
              href={`/checkout?product=${card.slug}`}
              className="group block transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-xl border border-gold/20 bg-white p-1 shadow-lg shadow-black/40">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                  <Image
                    src={card.src}
                    alt={`${card.name} NFC card`}
                    fill
                    sizes="(max-width: 640px) 25vw, 120px"
                    quality={90}
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-ice/50 transition group-hover:text-gold">
                {card.name}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-gold/20 pt-8 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Merch</p>
            <h3 className="mt-2 font-display text-2xl text-ice">NFC Cards, {money(priceCents)} each — setup included</h3>
            <p className="mt-2 max-w-sm text-sm text-ice/50">
              Tap-to-share smart cards. A phone tap opens your contact info, socials, or booking link. The $25 setup
              fee is already folded into the price.
            </p>
          </div>
          <NfcOrderPicker />
        </div>
      </div>
    </section>
  );
}
