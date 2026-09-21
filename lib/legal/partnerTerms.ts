import { PARTNER, usd } from "@/lib/pricing/catalog";
import { COMPANY, LEGAL_EFFECTIVE_DATE, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

export const partnerTermsDoc: LegalDoc = {
  slug: "partner-terms",
  title: "Partner Program Terms",
  description: `The terms for partners who send customers to ${C.brand}, including how commissions are earned, held, approved, and paid.`,
  summary: [
    `You earn a percent of what a customer you referred pays us on one-time orders, for a year after their first paid order. We hold each commission for ${PARTNER.pendingDays} days in case of a refund, approve it once the customer's whole order is paid, and pay it by hand.`,
    `We do not promise any earnings or any results, and you may not either. Always tell people you may earn a commission.`,
  ],
  sections: [
    {
      id: "program",
      title: "1. The program",
      body: [
        `These terms are between you and ${C.legalName}, doing business as ${C.brand} ("we", "us"), and apply when you apply to or take part in our partner program. They work together with our Terms of Service, Privacy Policy, Refund and Cancellation Policy, and Acceptable Use Policy, which also apply to you.`,
        `You take part as an independent business or person. Nothing here makes you our employee, agent, partner in law, joint venturer, or franchisee. You have no authority to make promises for us, to change a price, to accept payment for us, or to bind us to anything.`,
      ],
    },
    {
      id: "joining",
      title: "2. Joining and leaving",
      body: [
        `You apply through our website. We decide whether to accept you, and we may decline an application without giving a reason. We may pause or end your participation at any time, for any reason, by telling you. You may stop at any time by telling us.`,
        `Ending does not cancel commissions already earned under these terms, unless we ended it because you broke these terms or the law. Those may be withheld or reversed.`,
      ],
    },
    {
      id: "attribution",
      title: "3. Your link and your customers",
      body: [
        `Once approved, you get a personal link and a private dashboard link. A customer counts as yours if they create their account through your link, or if you registered their email address with us as a lead before they became a customer. If more than one partner could claim a customer, the first one counts. A customer who already had an account with us is not yours.`,
        `We keep the records that decide attribution, and our records are final unless there is a clear error. We may decline to serve any customer, and we may refuse or cancel any order.`,
      ],
    },
    {
      id: "commission",
      title: "4. Your commission",
      body: [
        `When a customer that counts as yours pays for a one-time order, you earn a commission of the percent we agreed with you when we approved you (${PARTNER.defaultPercent}% unless we told you otherwise) of the order total, not counting shipping or taxes. It applies to orders paid during the ${PARTNER.windowDays} days after that customer's first paid order.`,
        `Monthly plans (such as the website care plan and monthly ads), paid audits, refunded amounts, and money we do not collect do not earn a commission. Work billed later as an extra invoice does not change a commission already recorded. We may change the percent or these rules for future orders by posting a new version of these terms or by telling you.`,
        `You do not earn a commission on your own purchases, or on purchases by anyone acting for you or using your details. Such commissions are refused.`,
      ],
    },
    {
      id: "payment",
      title: "5. When you are paid",
      callout: `WE HOLD EVERY COMMISSION FOR ${PARTNER.pendingDays} DAYS AND APPROVE IT ONLY ONCE THE CUSTOMER'S WHOLE ORDER IS PAID.`,
      body: [
        `A commission starts as pending. It stays pending for ${PARTNER.pendingDays} days after the order is paid, so that a refund or a dispute has time to show up, and, if the customer paid a deposit, until they have paid the rest. Then it becomes approved. Your dashboard shows each commission and why it is still pending.`,
        `If an order is refunded, cancelled, or charged back before we pay you, the commission for it is cancelled. If it is refunded or charged back after we pay you, we may deduct it from what we owe you later.`,
        `We pay approved commissions by hand, by a method we agree with you, and we tell you when we do. We may wait until what we owe you reaches ${usd(PARTNER.minPayoutCents)}. You are responsible for your own taxes. We may ask for tax information, and we may report payments as the law requires.`,
      ],
    },
    {
      id: "promotion",
      title: "6. How you promote us",
      body: [
        `Whenever you share your link or recommend us for a reward, you must say clearly that you may earn a commission. The ready-made words in your dashboard already do this. Follow the laws that apply to endorsements, advertising, email, and text messages, including consumer protection and spam laws.`,
        {
          list: [
            "Do not promise or imply results, such as more customers, sales, rankings, or reviews. Do not quote earnings.",
            "Do not send unsolicited bulk email or text messages, buy or scrape lists, or contact people who asked you to stop.",
            "Do not pretend to be us, use our name or trademarks in a paid ad or a domain name without our written permission, or copy our site.",
            "Do not offer discounts, prices, or terms we have not published, and do not collect payments for us.",
            "Do not use fake accounts, incentives to click, or any way of making it look like customers came from you when they did not.",
          ],
        },
      ],
    },
    {
      id: "leads",
      title: "7. Leads you share with us",
      body: [
        `You may tell us about a business that might want our services by giving us its name and contact details. Only do this if the person expects to hear from us and has agreed to you sharing their details. Give us accurate details.`,
        `We contact leads ourselves and in our own way, under our Privacy Policy. We do not have to contact, serve, or accept any lead, and we do not promise you a result. Registering a lead does not create a customer of yours until they order.`,
      ],
    },
    {
      id: "data",
      title: "8. What you can see, and what you keep private",
      body: [
        `Your dashboard shows your own link, your leads, and the first names and order status of customers who count as yours, and your commissions. It does not show contact details. Keep your dashboard link private. Anyone who has it can see your dashboard and share leads in your name.`,
        `Use what you see only to work with us. Do not use it to contact our customers about anything else.`,
      ],
    },
    {
      id: "no-guarantee",
      title: "9. No promise of earnings",
      callout: `WE DO NOT PROMISE YOU ANY EARNINGS. WHAT YOU EARN DEPENDS ON WHO YOU REFER AND WHETHER THEY BUY.`,
      body: [
        `Any example we give is only an example. Many partners earn nothing. We can change our prices, products, and this program at any time.`,
      ],
    },
    {
      id: "law",
      title: "10. Everything else",
      body: [
        `Our Terms of Service apply to you, including the sections on disclaimers, limits of liability, resolving disputes by individual arbitration, and governing law (the laws of the State of ${C.governingState}). To the fullest extent the law allows, our total liability to you under this program is limited to the commissions we owe you and have not yet paid.`,
        `If any part of these terms cannot be enforced, the rest still applies. These terms take effect on ${LEGAL_EFFECTIVE_DATE}. Questions: email ${C.email}, or call ${C.phone}.`,
      ],
    },
  ],
};
