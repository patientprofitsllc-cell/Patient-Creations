// Client-safe (no db import): the single list of NFC card designs, shared by
// the homepage picker, the mix-and-match checkout grid, and server validation.
export const CARD_MIX_PACK_SLUG = "nfc-cards";

export const CARD_DESIGNS: { slug: string; name: string }[] = [
  { slug: "nfc-google-review", name: "Google Review" },
  { slug: "nfc-youtube", name: "YouTube" },
  { slug: "nfc-custom-menu", name: "Custom Menu" },
  { slug: "nfc-whatsapp", name: "WhatsApp" },
  { slug: "nfc-instagram", name: "Instagram" },
  { slug: "nfc-tiktok", name: "TikTok" },
  { slug: "nfc-wifi", name: "WiFi" },
];

export const CARD_DESIGN_SLUGS = CARD_DESIGNS.map((d) => d.slug);
