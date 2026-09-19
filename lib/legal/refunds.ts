import { COMPANY, LEGAL_EFFECTIVE_DATE, POLICY, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

export const refundsDoc: LegalDoc = {
  slug: "refunds",
  title: "Refund and Cancellation Policy",
  description: `${C.legalName}'s policy on refunds, returns, cancellations, and payment disputes: all sales are final.`,
  summary: [
    `All sales are final. We do not offer refunds, returns, exchanges, or credits once you have paid, except where the law requires it or we agree in writing.`,
    `You can cancel the monthly Website Care Plan at any time. It stops future charges and takes effect at the end of the period you have paid for.`,
  ],
  sections: [
    {
      id: "final",
      title: "1. All sales are final",
      callout: `ALL SALES ARE FINAL. NO REFUNDS, RETURNS, EXCHANGES, OR CREDITS.`,
      body: [
        `Everything we sell is made to order for you. As soon as an order is paid, and for websites as soon as we have your information, we set aside time and start work that we cannot get back. For that reason, and because you review and approve what we deliver, we do not give refunds or accept returns once payment has been made.`,
        `By placing an order and checking the agreement box at checkout, you confirm that you have read this policy and agree to it. This policy is part of our Terms of Service.`,
      ],
    },
    {
      id: "digital",
      title: "2. Websites, creative work, software, and consultations",
      body: [
        `For websites, video, ads, software, automation, brand work, consultations, and optional extras:`,
        {
          list: [
            "No refunds are given after payment, whether or not you have finished your intake or reviewed the work.",
            "Changing your mind, not using the work, not finishing your intake, not responding to us, or being unhappy with a business result are not reasons for a refund.",
            "Your order includes the number of revision rounds stated for it. If you want changes beyond that, or after you approve, they are additional work.",
            "Deposits and consultation fees are non-refundable. Where a product description says a fee is credited toward a later build, the credit applies only as described there and has no cash value.",
            "If a delivery target passes, that is not a reason for a refund. Targets are goals, and timelines depend on you as well.",
          ],
        },
      ],
    },
    {
      id: "physical",
      title: "3. NFC cards and physical products",
      body: [
        `These are personalized and programmed for you, so we do not accept returns or exchanges. If an item arrives damaged, or does not work as described, email ${C.email} within ${POLICY.defectClaimDays} days of delivery with your order details and clear photos. We will decide in our discretion whether to repair, replace, or otherwise remedy it. Shipping charges are not refundable. Problems caused by a phone, case, or app that does not support NFC, by a wrong address, or by wear or misuse are not defects.`,
      ],
    },
    {
      id: "care-plan",
      title: "4. Website Care Plan and other subscriptions",
      body: [
        `You may cancel at any time using "Manage billing" on your project page, or by emailing ${C.email}. Cancelling stops future charges and takes effect at the end of the billing period you have already paid for; you keep the plan until then. We do not refund or prorate any period that has been billed, including a partial month. If a payment fails we may retry it and may pause the plan until it is paid.`,
        `The 3-Month Maintenance extra is a one-time payment, does not renew, and is not refundable.`,
      ],
    },
    {
      id: "our-discretion",
      title: "5. When we may choose to help",
      body: [
        `If we are unable to deliver what you ordered for reasons that are our fault, we will first try to fix it, for example by redoing the work. If that is not possible, we may, at our sole discretion, offer a credit, a partial refund, or a full refund of what you paid for the part we did not deliver. If we cancel your order before delivering it (see Section 3 of the Terms), we will refund what you paid for the undelivered part.`,
        `Any goodwill remedy we offer in one case does not create a right to the same remedy in another, and is not an admission of fault.`,
      ],
    },
    {
      id: "disputes",
      title: "6. Payment disputes and chargebacks",
      body: [
        `Please contact us first at ${C.email} if you have a problem or do not recognize a charge. We reply quickly and can often solve it. Opening a chargeback or payment dispute for a charge covered by this policy, or for work we delivered, breaches our Terms. We will give the card issuer or payment provider our records, including your agreement to this policy, your messages, previews, and approvals with their dates and times, delivery and shipping records, and access logs, and we may suspend services while a dispute is open. See Section 23 of the Terms.`,
      ],
    },
    {
      id: "payment-methods",
      title: "7. Payment methods",
      body: [
        `Payments made by Zelle, Apple Pay request, or other direct methods are collected directly and may be irreversible. This policy applies to them in the same way as it does to card payments.`,
      ],
    },
    {
      id: "law",
      title: "8. Your legal rights",
      body: [
        `This policy does not take away any right you have under a law that cannot be waived. If a law that applies to you requires a refund or cancellation right, that right applies to the extent the law requires it.`,
      ],
    },
    {
      id: "contact",
      title: "9. Questions",
      body: [`Email ${C.email} or call ${C.phone}, and include your order details. This policy is effective ${LEGAL_EFFECTIVE_DATE}.`],
    },
  ],
};
