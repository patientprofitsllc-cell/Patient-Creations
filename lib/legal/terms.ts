import { COMPANY, LEGAL_EFFECTIVE_DATE, POLICY, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

export const termsDoc: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  description: `The terms that apply when you use ${C.brand} or buy from ${C.legalName}, including binding arbitration, refunds, and limits of liability.`,
  summary: [
    `These terms are a contract between you and ${C.legalName}. By using this website or placing an order you agree to them.`,
    `In short: all sales are final (see the Refund and Cancellation Policy); disputes are resolved by individual binding arbitration, not in court and not as a class action (Section 27); we build what you ask for from the information you give us and make no promises about search rankings, traffic, or sales; and our liability is limited.`,
  ],
  sections: [
    {
      id: "agreement",
      title: "1. Agreement to these terms",
      callout: `IMPORTANT: These terms contain a binding arbitration clause and a class action and jury trial waiver in Section 27. They affect your legal rights. Please read them. You may opt out of arbitration within ${POLICY.arbitrationOptOutDays} days as explained there.`,
      body: [
        `These Terms of Service ("Terms") govern your access to and use of ${C.siteUrl} and any related pages, tools, private project links, emails, and services (together, the "Site" and the "Services"). They are a legal agreement between you and ${C.legalName}, doing business as ${C.brand} ("Company", "we", "us", "our").`,
        `By using the Site, creating an account, checking the box that says you agree, placing an order, or paying us, you agree to these Terms, our Privacy Policy, our Refund and Cancellation Policy, and our Acceptable Use Policy, which are part of this agreement. If you do not agree, do not use the Site or the Services.`,
        `You must be at least 18 years old and able to form a binding contract. Our Services are for business purposes. If you are using them on behalf of a company or other organization, you confirm that you have authority to bind it, and "you" includes that organization.`,
      ],
    },
    {
      id: "services",
      title: "2. Our Services",
      body: [
        `We offer websites, video and creative work, NFC cards and other physical merchandise, software and automation projects, consultations, optional extras, and a monthly website care plan. What is included in each product is described on its page and in your order at the time you buy. If anything in a description conflicts with these Terms about legal rights or liability, these Terms control.`,
        `We may change, improve, pause, or stop any product or feature at any time. Prices and descriptions can change for future orders. A change does not affect an order that has already been placed and paid, except as these Terms allow.`,
        `Unless we agree otherwise in writing, we are an independent contractor. Nothing in these Terms makes you and us partners, joint venturers, employer and employee, or agent and principal.`,
      ],
    },
    {
      id: "orders",
      title: "3. Orders, prices, and payment",
      body: [
        `Prices are in US dollars and do not include taxes, duties, or third-party charges (for example, domain registration or advertising spend) unless we say so. You agree to pay the total shown at checkout.`,
        `Card payments are processed by Stripe. We do not see or store your full card number. Other payment methods we offer (for example, Zelle or Apple Pay requests) are collected directly. Production on an order starts only after payment is confirmed. Payments made by Zelle or similar transfers may be irreversible, so make sure the details are right.`,
        `You authorize us to charge your chosen payment method for the amounts due, including recurring amounts for any subscription you start. You confirm that you are authorized to use that payment method.`,
        `We may refuse, cancel, or limit any order, including if we suspect fraud or misuse, if a product is unavailable, if there is a pricing or description error, or if fulfilling it would break the law or these Terms. If we cancel an order before delivering it, we will refund what you paid for the part we did not deliver.`,
        `If a coupon or special offer is used, its conditions apply. Offers cannot be combined unless we say so, have no cash value, and can be ended at any time.`,
      ],
    },
    {
      id: "links",
      title: "4. Accounts and private links",
      body: [
        `You are responsible for the accuracy of the details you give us and for keeping your account credentials and private links safe. Your project status, intake, and preview pages are reached through private links and do not ask for a login. Anyone who has a link can view that page and take the actions it offers, such as approving a preview. Do not share your links with anyone you do not trust.`,
        `You are responsible for everything done through your account or private links. Tell us right away at ${C.email} if you think one has been misused. We may treat any action taken through a valid link as an action taken by you.`,
      ],
    },
    {
      id: "your-content",
      title: "5. Your information and materials",
      body: [
        `We build your website and other work from the information and materials you give us, such as your business name, contact details, services, prices, hours, text, logos, photos, links, and instructions ("Your Materials"). We do not verify Your Materials and we may rely on them as given.`,
        `You promise that:`,
        {
          list: [
            "Your Materials are accurate, complete, and not misleading;",
            "you own Your Materials or have all the rights, licenses, releases, and permissions needed to give them to us and for us to use, copy, adapt, display, and publish them as part of your work, including any photos, names, likenesses, trademarks, music, and text of other people;",
            "Your Materials and your use of the finished work do not infringe or violate anyone's rights and do not break any law, regulation, or platform rule; and",
            "you hold every license, registration, insurance, and permit your business needs, and you are responsible for any legal notices, disclosures, or claims your business is required to make or is not allowed to make.",
          ],
        },
        `You give us a non-exclusive, worldwide, royalty-free license to use Your Materials to provide the Services, to keep records, and to show the finished work as described in Section 7. You are solely responsible for reviewing all work before you approve it and for making sure it is accurate and lawful for your business.`,
        `We are not responsible for the legal compliance of your business or of the content you ask us to publish. That includes accessibility laws, consumer protection and advertising rules, privacy notices and cookie consent, licensing and disclosure requirements for your profession, and industry-specific regulations.`,
      ],
    },
    {
      id: "delivery",
      title: "6. Timelines, revisions, approval, and acceptance",
      body: [
        `Any delivery time we give (including a "72-hour target") is an estimate and a goal, not a promise. Timelines depend on you giving us complete information promptly, on you responding to previews and messages, and on things outside our control. Time spent waiting for you does not count against any target. We are not liable for delay.`,
        `For a website, the usual process is: you complete an intake, we build a preview, you review it, you may request the number of revision rounds included with your order, and you approve it. A revision round is one set of change requests sent together. Requests outside the agreed scope, and any changes after approval, may be declined or quoted and charged separately.`,
        `When you approve your work, you confirm that it matches what you asked for and that you accept it as complete. We keep records of approvals, including the date and time and the private link used, and we may rely on them.`,
        `If we have told you your preview or work is ready and you have not approved it or sent change requests within ${POLICY.deemedAcceptanceDays} days, we may treat it as accepted. After acceptance, further changes are additional work.`,
        `We do not guarantee that any website, video, software, or other work will be error-free, uninterrupted, or suit a particular purpose. We will use reasonable efforts to fix a clear technical defect in what we delivered if you tell us within a reasonable time. That is our only obligation for defects, other than as these Terms and the Refund and Cancellation Policy state.`,
      ],
    },
    {
      id: "ip",
      title: "7. Ownership and license",
      body: [
        `As between you and us, you keep ownership of Your Materials. We own all right, title, and interest in the Site, our templates, layouts, components, code, designs, tools, processes, prompts, know-how, and anything we created before or apart from your order ("Our Materials"), and in all improvements to them.`,
        `Once you have paid for an order in full and the payment has not been reversed, we give you a non-exclusive, worldwide, perpetual license to use, copy, and display the finished deliverable (for example, the website files) for your own business. You may not resell, sublicense, or distribute the deliverable or Our Materials as a template, product, or service of your own, or remove our notices where we have included them.`,
        `Some deliverables include third-party materials, such as fonts, stock media, or open-source software, that are covered by their own licenses. You agree to follow those licenses.`,
        `The license in this Section ends automatically if a payment for the order is refunded, reversed, or disputed. We may keep the finished work, and unless you ask us not to in writing, show it and its public address as an example of our work.`,
        `If you send us feedback or ideas, we may use them without any obligation to you.`,
      ],
    },
    {
      id: "no-refunds",
      title: "8. All sales are final",
      callout: `ALL SALES ARE FINAL. Except where the law requires otherwise, or where we agree in writing, we do not give refunds, returns, exchanges, or credits once you have paid. Please read the Refund and Cancellation Policy, which is part of these Terms.`,
      body: [
        `Our work is custom, and we start using time and resources as soon as an order is paid and, for websites, once we have your information. For that reason, and as described in the Refund and Cancellation Policy, we do not offer refunds or returns. By placing an order you acknowledge and accept this.`,
        `Nothing in these Terms limits any right you have under a law that cannot be waived.`,
      ],
    },
    {
      id: "care-plan",
      title: "9. Website Care Plan (subscription)",
      body: [
        `The Website Care Plan is an optional monthly subscription for a website we built. It includes what is described where it is offered, currently up to ${POLICY.careUpdatesPerMonth} small updates a month (for example changes to text, hours, prices, phone number, or links), keeping your website online, and looking after your domain connection, plus handling requests through your project page. It does not include new pages, redesigns, an online store, ads, video, logo design, or any promise about search rankings. Unused updates do not roll over.`,
        `AUTOMATIC RENEWAL: When you start the plan you authorize us, through Stripe, to charge the price shown at that time every month, on the same day each month, until you cancel. The plan renews automatically each month. Taxes may apply.`,
        `You can cancel at any time using the "Manage billing" button on your project page or by emailing ${C.email}. Cancellation stops future charges and takes effect at the end of the billing period you have already paid for. We do not refund or prorate the current period or past periods.`,
        `If a payment fails, we or Stripe may retry it. We may pause updates and may take your website offline if the plan stays unpaid. We may change the price or terms of the plan with at least 30 days' notice; if you keep the plan after the change takes effect you accept it, and you may cancel before then.`,
        `After the plan ends, or if it is canceled or unpaid, we are not required to keep your website online or to keep hosting it. On request within 30 days we will give you a copy of your finished website files if you have paid for them.`,
        `If you bought a "3-Month Maintenance" extra, it covers updates and small fixes for three months from purchase on the same limits as above, is paid once, and does not renew.`,
      ],
    },
    {
      id: "merch",
      title: "10. NFC cards and physical products",
      body: [
        `NFC cards are made and programmed to order from the information you give us, so they are personalized goods. We ship within the United States only unless we agree otherwise. Delivery times are estimates. We are not responsible for carrier delays, and risk of loss passes to you when we hand the package to the carrier. Provide a complete and correct shipping address; we are not responsible for packages sent to an address you gave us in error.`,
        `We do not accept returns or exchanges of physical products. If a product arrives damaged or does not work as described, email ${C.email} within ${POLICY.defectClaimDays} days of delivery with your order details and clear photos, and we will decide, in our discretion, whether to repair, replace, or otherwise remedy it. NFC cards need a phone with NFC support and may behave differently across devices, cases, and apps, which is not a defect.`,
        `You are responsible for the content and links you ask us to put on a card, and for keeping those destinations working. Cards may be substituted with a similar design or color if a specific one is out of stock.`,
      ],
    },
    {
      id: "custom",
      title: "11. Consultations, custom builds, and creative work",
      body: [
        `For consultations, software, automation, video, advertising, and other custom work, the scope, deliverables, and timeline are those described in your order or in a written statement of work or message we both confirm. Work outside that scope is additional work and may cost more. Deposits are non-refundable and are credited only as the product description says.`,
        `We make no promise about views, leads, sales, revenue, return on ad spend, or any other business result from ads, video, or creative work. You are responsible for following the rules of any advertising or social platform where the work is used, and for the claims, offers, and disclosures it contains. Advertising accounts can be limited or suspended by the platform, and we are not responsible for that.`,
        `If you give us images, video, voices, or names of real people, you confirm you have their permission to use them for this purpose.`,
      ],
    },
    {
      id: "extras",
      title: "12. Optional extras",
      body: [
        `Optional extras, such as a brand kit, an extra revision package, a social asset pack, and maintenance, are sold as described when you add them. An extra revision package adds the number of revision rounds stated to the preview of your website and does not extend any other scope. Extras are subject to these Terms and the Refund and Cancellation Policy.`,
      ],
    },
    {
      id: "ai",
      title: "13. AI-assisted work",
      body: [
        `We may use software tools, including artificial intelligence, to help prepare wording, designs, code, and other work. Output from such tools can be inaccurate, incomplete, or similar to output created for others, and may not be protected by copyright. We review work as our process requires, but you are responsible for reviewing it before you approve it, including checking facts, claims, names, prices, and contact details.`,
        `If we use an AI provider to process what you send us, we do so as described in our Privacy Policy. We do not promise that any work is original, unique, or free from third-party claims beyond what the law requires.`,
      ],
    },
    {
      id: "no-guarantees",
      title: "14. No guarantee of results",
      body: [
        `We cannot and do not promise any result. In particular we do not promise any position in search engines or map results, any amount of website traffic, visitors, calls, leads, customers, bookings, sales, reviews, followers, or revenue, or that your website will be free of problems, always available, or compliant with any accessibility standard or law.`,
        `Basic search setup, such as page titles and descriptions, is a technical starting point. Search engines and platforms are run by others and change how they work without notice. Nothing we say is legal, tax, financial, medical, or professional advice. Talk to a qualified professional about your specific situation.`,
      ],
    },
    {
      id: "third-parties",
      title: "15. Third-party services",
      body: [
        `The Site and the Services rely on services run by others, such as payment processors, email delivery, hosting and database providers, calendar and video tools, domain registrars, advertising and social platforms, and shipping carriers. Their terms and privacy practices apply to your use of them. We are not responsible for their acts, outages, changes, or fees, and a problem with one is not a breach by us. Links to other sites are provided for convenience only.`,
      ],
    },
    {
      id: "acceptable-use",
      title: "16. Acceptable use",
      body: [
        `You must follow the Acceptable Use Policy. We may refuse, remove, or stop work on anything that we believe breaks it, breaks the law, could harm us or others, or exposes us to risk, and we may suspend or end your access. If we do that because of your breach, you are not entitled to a refund.`,
      ],
    },
    {
      id: "communications",
      title: "17. Communications",
      body: [
        `You agree that we may contact you by email and through your project page about your orders, your account, and the Services. These messages are part of the Services and you cannot opt out of them while you have an order. We may send marketing email; you can unsubscribe using the link in it or by emailing ${C.email}.`,
        `By giving us a phone number you agree that we may call or text you about your order and to answer your requests. We do not send marketing text messages without separate permission. Message and data rates may apply. Reply STOP to a text to stop further texts. If we record a call or video meeting we will tell you first.`,
      ],
    },
    {
      id: "referrals",
      title: "18. Referral program",
      body: [
        `If we offer a referral program, commissions are earned only on qualifying purchases by new customers that we have received and cleared, at the rate and on the conditions we state, and they are not earned on refunded, reversed, disputed, or fraudulent orders. Self-referrals, fake accounts, and misleading promotion are not allowed and void the commission. We may change, pause, or end the program and correct or reverse any commission at any time. Commissions are not wages or a guarantee of income, and you are responsible for your own taxes.`,
      ],
    },
    {
      id: "warranty",
      title: "19. Disclaimer of warranties",
      callout: `THE SITE AND THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE FULLEST EXTENT THE LAW ALLOWS, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTY ARISING FROM COURSE OF DEALING OR USAGE.`,
      body: [
        `We do not warrant that the Site or the Services will be uninterrupted, secure, or error-free, that defects will be corrected, or that results will be achieved. Some places do not allow some of these disclaimers, so parts of this Section may not apply to you.`,
      ],
    },
    {
      id: "liability",
      title: "20. Limitation of liability",
      callout: `TO THE FULLEST EXTENT THE LAW ALLOWS: (A) THE COMPANY AND THE COMPANY PARTIES (DEFINED IN SECTION 22) WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, CUSTOMERS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, EVEN IF TOLD THEY MIGHT OCCUR; AND (B) THE TOTAL LIABILITY OF THE COMPANY AND THE COMPANY PARTIES FOR ALL CLAIMS RELATING TO THE SITE OR THE SERVICES WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US FOR THE ORDER THAT GAVE RISE TO THE CLAIM OR ONE HUNDRED US DOLLARS ($100).`,
      body: [
        `These limits apply to every legal theory, including contract, tort (including negligence), strict liability, and statute, and even if a remedy fails of its essential purpose. They reflect the price of the Services and are a basis of our bargain. Some places do not allow certain limits, so some of them may not apply to you, and in that case our liability is limited to the smallest amount the law allows.`,
      ],
    },
    {
      id: "indemnity",
      title: "21. You will defend and reimburse us",
      body: [
        `You agree to defend, indemnify, and hold harmless the Company and the Company Parties from and against any claim, demand, loss, damage, liability, cost, and expense (including reasonable attorneys' fees) arising from or related to: Your Materials; your business and the way you use the work we deliver; your breach of these Terms or of any law or third-party right; any statement, offer, or claim on your website, ad, or card; and any dispute between you and your customers or others. We may take over the defense of any matter at your expense, and you will not settle a matter that affects us without our written consent.`,
      ],
    },
    {
      id: "company-parties",
      title: "22. Protection for the Company Parties",
      body: [
        `"Company Parties" means ${C.legalName}, its members, managers, owners, officers, employees, contractors, agents, affiliates, licensors, and service providers, and their successors and assigns. You agree that any claim you have arising from the Site or the Services is only against ${C.legalName}, and that no Company Party other than ${C.legalName} has any personal liability to you. Each Company Party may rely on and enforce Sections 14, 19, 20, 21, 22, and 27 as an intended third-party beneficiary.`,
      ],
    },
    {
      id: "disputes-card",
      title: "23. Payment disputes and chargebacks",
      body: [
        `If you have a concern about a charge, contact us first at ${C.email} so we can try to fix it quickly. You agree not to start a chargeback or payment dispute for a charge that is covered by these Terms and the Refund and Cancellation Policy, or for work we delivered, without first giving us a chance to resolve it.`,
        `If a dispute is opened, we may give the card issuer or payment provider our records, including your order, your acceptance of these Terms, messages, previews, approvals with dates and times, delivery and shipping records, and access logs. We may suspend Services and access while a dispute is open. A dispute or reversal ends the license in Section 7. To the extent the law allows, you agree to reimburse the fees and costs we reasonably incur because of a dispute that is decided in our favor or that you withdraw.`,
      ],
    },
    {
      id: "termination",
      title: "24. Suspension and termination",
      body: [
        `We may suspend or end your access to the Site and the Services at any time, with or without notice, if we believe you have broken these Terms, the law, or another person's rights, if you have not paid, or if we stop offering the Service. You may stop using the Site at any time. Ending access does not cancel amounts you owe, does not entitle you to a refund except as the Refund and Cancellation Policy says, and does not end sections that by their nature should continue, which include Sections 5, 7, 8, 13 through 15, and 19 through 30.`,
      ],
    },
    {
      id: "governing-law",
      title: "25. Governing law",
      body: [
        `These Terms and any dispute between you and us are governed by the laws of the State of ${C.governingState} and by the Federal Arbitration Act, without regard to conflict of law rules. If a court has to decide a matter that is not arbitrated, you agree that it will be decided only in the state or federal courts located in ${C.governingState}, and you consent to their personal jurisdiction and venue.`,
      ],
    },
    {
      id: "informal",
      title: "26. Try to resolve it with us first",
      body: [
        `Before starting any arbitration or court case, you must send us written notice of the dispute by email to ${C.email}. It must include your name, your contact details, the order it relates to, what happened, and what you want. We will both then work in good faith to resolve it for at least ${POLICY.informalResolutionDays} days. No arbitration or court case may be started until that period has passed.`,
      ],
    },
    {
      id: "arbitration",
      title: "27. Binding individual arbitration and class action waiver",
      callout: `PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR RIGHTS. IT REQUIRES YOU AND US TO RESOLVE DISPUTES BY BINDING ARBITRATION ON AN INDIVIDUAL BASIS. YOU AND WE ARE GIVING UP THE RIGHT TO GO TO COURT, TO HAVE A JURY DECIDE THE DISPUTE, AND TO BRING OR JOIN A CLASS ACTION OR REPRESENTATIVE ACTION.`,
      body: [
        `Agreement to arbitrate. You and the Company agree that any dispute, claim, or controversy arising out of or relating to these Terms, the Site, the Services, your orders, or our relationship, whether based on contract, tort, statute, fraud, misrepresentation, or any other theory, and whether it arose before or after you agreed to these Terms (a "Dispute"), will be resolved only by final and binding arbitration, except as stated below. This includes disputes about whether this Section applies or is enforceable, which the arbitrator decides. This agreement applies to the Company Parties, who can enforce it.`,
        `Rules and place. The arbitration will be run by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules if you are an individual, or its Commercial Arbitration Rules if you are a business, in effect when the arbitration starts, as changed by this Section. The rules and forms are at adr.org. The arbitration will be held by video conference or telephone, or, if an in-person hearing is needed, in the ${C.governingState} county where the Company has its principal place of business, unless we agree on another place. The arbitrator must follow the law and these Terms and may award the same individual relief a court could, but only to the extent needed to resolve your individual claim.`,
        `Costs. Each side pays its own filing and administrative fees as the AAA rules provide, except that we will pay any fee the AAA rules require us to pay, and where the law requires it or the arbitrator finds a claim was brought for an improper purpose, fees and costs will be allocated as the law and rules provide. Each side bears its own attorneys' fees unless the law or the arbitrator's award provides otherwise.`,
        `No class or representative actions. To the fullest extent the law allows, you and the Company may bring claims only in an individual capacity, and not as a plaintiff or class member in any class, collective, consolidated, or representative proceeding. The arbitrator may not combine more than one person's claims, and may not preside over any form of class or representative proceeding. If this waiver is found unenforceable for a claim, that claim (and only that claim) will be decided in court and not in arbitration, and stayed until the arbitration of the remaining claims ends.`,
        `No jury. If a Dispute is decided in court for any reason, you and the Company each waive, to the fullest extent the law allows, any right to a trial by jury.`,
        `Exceptions. Either of us may bring an individual claim in small claims court if it qualifies and stays there. Either of us may go to court to stop the actual or threatened misuse of intellectual property or confidential information, or to prevent unauthorized access to the Site, without starting arbitration first.`,
        `Time limit. Any Dispute must be started within ${POLICY.claimLimitYears} year after the claim arose, or it is permanently barred, to the extent the law allows a shorter period than the law would otherwise give.`,
        `Right to opt out. You may opt out of this arbitration agreement (but not the rest of these Terms) by emailing ${C.email} within ${POLICY.arbitrationOptOutDays} days after the date you first accept these Terms. Your email must include your name, the email address you used to order, and a clear statement that you opt out of arbitration. If you opt out, Disputes will be decided in the courts described in Section 25, on an individual basis, and the class and jury waivers still apply as far as the law allows.`,
        `Changes and survival. If we change this Section in the future, the change applies to Disputes that arise after it, and you may opt out of the change in the same way within ${POLICY.arbitrationOptOutDays} days. This Section survives the end of these Terms and the end of your use of the Site. If any part of this Section other than the class action waiver is found unenforceable, the rest stays in force.`,
      ],
    },
    {
      id: "changes",
      title: "28. Changes to these Terms",
      body: [
        `We may update these Terms. We will post the new version on this page with a new effective date. Changes take effect when posted and apply to your use after that. An order is governed by the version you accepted when you placed it, plus any later changes that are required by law, that do not reduce your rights, or that apply to a subscription after notice. If you keep using the Site after a change, you accept it.`,
      ],
    },
    {
      id: "electronic",
      title: "29. Electronic records and signatures",
      body: [
        `You agree to do business with us electronically. You agree that clicking to accept, checking an agreement box, approving work, paying, and similar actions are your electronic signature, and that our electronic records, including the version of the Terms you accepted and the time, date, and internet address of your acceptance, are valid evidence of your agreement. You agree we may send you notices and records by email or by posting them on your project page.`,
      ],
    },
    {
      id: "general",
      title: "30. General",
      body: [
        {
          list: [
            "Force majeure: we are not liable for a failure or delay caused by events beyond our reasonable control, including outages of internet, hosting, payment, or email services, cyberattacks, natural disasters, epidemics, war, government action, strikes, or supplier and carrier failures.",
            "Entire agreement: these Terms and the policies they refer to are the whole agreement between you and us about the Site and the Services and replace any earlier discussion. You are not relying on any statement that is not written here.",
            "If any part of these Terms is found unenforceable, it will be limited to the least extent needed and the rest will remain in force.",
            "If we do not enforce a right, that is not a waiver of it. A waiver is effective only if it is in writing and signed or sent by us.",
            "You may not assign or transfer these Terms without our written consent. We may assign them, including in a merger or sale of the business. Any attempted assignment by you is void.",
            "Headings are for convenience. \"Including\" means \"including without limitation.\"",
            "Notices to you may be sent to the email address on your account. Notices to us must be sent to the email address below.",
            "There are no third-party beneficiaries of these Terms except the Company Parties.",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "31. Contact us",
      body: [
        `${C.legalName}, doing business as ${C.brand}. Email: ${C.email}. Phone: ${C.phone}.${C.mailingAddress ? ` Mailing address: ${C.mailingAddress}.` : ""} These Terms are effective ${LEGAL_EFFECTIVE_DATE}.`,
      ],
    },
  ],
};
