import { DEPOSIT, usd } from "@/lib/pricing/catalog";

// Deposits for big builds. Pure, so the rules are tested directly and the checkout page and the server use the same ones.

export interface DepositQuote {
  /** Can this order be started with a deposit? */
  eligible: boolean;
  percent: number;
  /** What is due now. The whole total when a deposit is not available. */
  depositCents: number;
  /** What is invoiced later. 0 when a deposit is not available. */
  balanceCents: number;
  /** Why not, in words a customer can read. */
  reason?: string;
}

export function quoteDeposit(totalCents: number, opts: { shippingCents?: number } = {}): DepositQuote {
  const full = { eligible: false, percent: DEPOSIT.percent, depositCents: totalCents, balanceCents: 0 };
  if ((opts.shippingCents ?? 0) > 0) return { ...full, reason: "Orders that ship physical goods are paid in full." };
  if (totalCents < DEPOSIT.minOrderCents) return { ...full, reason: "A deposit is available on larger builds." };
  const depositCents = Math.round((totalCents * DEPOSIT.percent) / 100);
  return { eligible: true, percent: DEPOSIT.percent, depositCents, balanceCents: totalCents - depositCents };
}

/** What has actually been collected on an order: everything except the balance still owed. Reports use this, never the bare total. */
export const collectedCents = (o: { totalCents: number; balanceDueCents: number }) => Math.max(0, o.totalCents - o.balanceDueCents);

/** The single Stripe line for a deposit, so the card is charged exactly the deposit. The rest is invoiced when the build is ready. */
export function depositLineItems(input: { productNames: string[]; depositCents: number; balanceCents: number }) {
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `Deposit (${DEPOSIT.percent}%): ${input.productNames.join(", ")}`.slice(0, 250),
          description: `The remaining ${usd(input.balanceCents)} is invoiced and due before your final files are released.`,
        },
        unit_amount: input.depositCents,
      },
      quantity: 1,
    },
  ];
}
