// Automatic shipping calculator for physical Merch orders (NFC cards).
// Domestic US only. Tiered on quantity against real USPS flat-rate box
// sizes so the box a given order actually ships in is named up front —
// no guessed flat fee, no surprise at checkout.
export interface ShippingQuote {
  cents: number;
  boxLabel: string;
}

const US_SHIPPING_TIERS: { maxQty: number; boxLabel: string; cents: number }[] = [
  { maxQty: 2, boxLabel: "Padded mailer (USPS Ground Advantage)", cents: 495 },
  { maxQty: 10, boxLabel: "USPS Small Flat Rate Box", cents: 895 },
  { maxQty: 25, boxLabel: "USPS Medium Flat Rate Box", cents: 1495 },
  { maxQty: 100, boxLabel: "USPS Large Flat Rate Box", cents: 2195 },
];

export function calculateShippingCents(quantity: number): ShippingQuote {
  const tier = US_SHIPPING_TIERS.find((t) => quantity <= t.maxQty) ?? US_SHIPPING_TIERS[US_SHIPPING_TIERS.length - 1];
  return { cents: tier.cents, boxLabel: tier.boxLabel };
}
