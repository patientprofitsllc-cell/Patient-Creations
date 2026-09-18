export const AD_SPECIAL_CATEGORY = "Ad Special";

// Products sold per-unit: the customer picks how many. Merch (NFC cards) and
// the ad special (Cinematic / UGC ads). Shared by the server-side pricer and
// the checkout form so both agree on which products show a quantity picker.
export function supportsQuantity(category: string): boolean {
  return category === "Merch" || category === AD_SPECIAL_CATEGORY;
}
