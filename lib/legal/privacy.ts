import { COMPANY, LEGAL_EFFECTIVE_DATE, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

export const privacyDoc: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  description: `How ${C.legalName} collects, uses, and shares personal information on ${C.brand}, and the choices you have.`,
  summary: [
    `We collect what we need to take your order, build your work, get paid, and keep the site safe. We do not sell your personal information, and we do not use advertising cookies.`,
    `Card payments are handled by Stripe; we never see or store your full card number. You can ask us to access, correct, or delete your information at ${C.email}.`,
  ],
  sections: [
    {
      id: "who",
      title: "1. Who we are and what this covers",
      body: [
        `This Privacy Policy explains how ${C.legalName}, doing business as ${C.brand} ("we", "us"), handles personal information on ${C.siteUrl}, in our private project pages, emails, and in the services we provide. It is part of our Terms of Service. If you use our services for your business, this applies to the information about you, your business contacts, and your customers that you give us.`,
      ],
    },
    {
      id: "collect",
      title: "2. Information we collect",
      body: [
        `Information you give us:`,
        {
          list: [
            "account details: your name, email address, and password (we store only a one-way scrambled version of the password, never the password itself);",
            "business information for your website or project: business name and type, phone number, address, hours, services, prices, descriptions, social media and booking links, colors and style preferences, logos, photos and other materials or links you send us;",
            "order details, coupon and referral codes, and shipping details for physical products;",
            "messages, change requests, reviews, and notes you write on your project page, by email, or on calls;",
            "your acceptance of our legal terms, including the version, time, date, internet address, and browser details, which we keep as a record.",
          ],
        },
        `Payment information: card payments are handled by Stripe. We receive limited details such as the payment status, amount, and a reference, and we do not see or store your full card number. For payments made by direct transfer we see the details the payment shows.`,
        `Information collected automatically:`,
        {
          list: [
            "a random visitor identifier and, if you arrived through a link, the referral code or campaign source (utm details), stored in your browser so we can tell which links lead to orders;",
            "the pages you view and actions you take on our Site, with times, so we can count visits and see where people drop off;",
            "your internet address and browser type, used to keep the Site secure, limit abuse, prevent fraud, and keep records of your agreement. For referral clicks we keep a scrambled (hashed) version of the internet address;",
            "a sign-in cookie, only if you sign in or check out with an account.",
          ],
        },
        `Information from others: Stripe (payment results), Calendly or a video tool when you book or join a call with us (name, email, meeting time), and the person who referred you if you came through a referral.`,
        `Businesses we may contact: we keep a list of local businesses we might offer our services to. It holds business details from public sources, such as the business name, city, public phone number, email, and website, and notes about our contact. If you ask us to stop, we add you to a do-not-contact list and will not contact you again.`,
      ],
    },
    {
      id: "use",
      title: "3. How we use information",
      body: [
        {
          list: [
            "to take and fulfill orders, build and deliver your work, and provide support and your private project pages;",
            "to process payments and prevent fraud and chargebacks;",
            "to communicate with you about your order, changes to our terms, and other things related to our services, including reminders about information we need from you;",
            "to send marketing email, which you can stop at any time;",
            "to understand how the Site is used and to improve it, using counts and totals;",
            "to keep the Site secure, enforce our terms, and keep the records we need for accounting, tax, and legal reasons;",
            "to comply with law and respond to legal requests.",
          ],
        },
      ],
    },
    {
      id: "share",
      title: "4. How we share information",
      body: [
        `We do not sell your personal information and we do not share it for cross-context behavioral advertising. We share it only as follows:`,
        {
          list: [
            "with service providers who help us run the business and are allowed to use the information only for that purpose: payment processing (Stripe), website hosting and delivery (Netlify), database hosting (Neon), email delivery (Resend), scheduling and video meetings (Calendly, Zoom), shipping carriers (such as USPS), and, if we turn on AI features, an AI provider described below;",
            "with card issuers, payment providers, and dispute processes, including records of your order, agreement, approvals, and messages, if a payment is questioned;",
            "with professional advisers such as lawyers, accountants, and insurers;",
            "with authorities or other parties when we believe the law requires it, or to protect our rights, safety, or property, or those of others;",
            "with a buyer or successor if we sell or reorganize the business, who must honor this policy;",
            "with your consent or at your direction. Anything you ask us to publish on your website, such as your business name, phone, address, and hours, will be public.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies and similar technology",
      body: [
        `We do not use advertising or cross-site tracking cookies. We use a sign-in cookie that is needed to keep you signed in, and your browser's local storage to keep a random visitor identifier and referral details. You can clear or block these in your browser settings, but sign-in and checkout may not work without the sign-in cookie. Our Site does not respond to "Do Not Track" signals because we do not track you across other sites.`,
      ],
    },
    {
      id: "ai",
      title: "6. AI tools",
      body: [
        `We may use software that includes artificial intelligence to help draft wording or prepare work. If we do, we send only the information needed for that task, such as the business details and text you provided for your website, to our AI provider, which processes it under its own terms. We do not use your information to train our own AI models. Do not include sensitive personal information in what you give us for your website.`,
      ],
    },
    {
      id: "retention",
      title: "7. How long we keep information",
      body: [
        `We keep information for as long as we need it for the purposes above, including providing your services and support, and then as long as needed for accounting, tax, legal, security, and dispute purposes. Order records and records of your agreement are kept for the period those needs require. When we no longer need information, we delete or anonymize it, and you can also ask us to delete it (see Section 9).`,
      ],
    },
    {
      id: "security",
      title: "8. Security",
      body: [
        `We use reasonable safeguards, including encryption in transit, hashed passwords, private and hard-to-guess project links, and access controls. No system is perfectly secure, and we cannot promise absolute security. Keep your private links to yourself, and tell us at ${C.email} if you think someone else has one.`,
      ],
    },
    {
      id: "rights",
      title: "9. Your choices and rights",
      body: [
        `You can ask us to tell you what information we hold about you, to correct it, or to delete it, and you can unsubscribe from marketing email at any time using the link in it. Email ${C.email}. We will ask you to confirm who you are, and we may keep information we are required or permitted to keep, such as payment and tax records or records needed for a dispute.`,
        `Depending on where you live, you may have additional rights under state privacy laws, such as the right to know, access, correct, delete, or receive a copy of your information, and to opt out of the sale or sharing of your information for targeted advertising. We do not sell or share information for those purposes. We will not treat you differently for using your rights. You can use an authorized agent to make a request, and if we deny a request you may reply to ask us to reconsider it.`,
      ],
    },
    {
      id: "children",
      title: "10. Children",
      body: [
        `Our services are for businesses and for adults, and are not directed to children under 13. We do not knowingly collect information from them. If you believe a child has given us information, email ${C.email} and we will delete it.`,
      ],
    },
    {
      id: "international",
      title: "11. Where information is handled",
      body: [
        `We operate in the United States, and your information is processed and stored in the United States and in other places where our service providers operate. If you use the Site from outside the United States, you understand your information will be transferred there.`,
      ],
    },
    {
      id: "links",
      title: "12. Other websites",
      body: [`Our Site and emails may link to other sites and to websites we build for customers. We are not responsible for their content or privacy practices.`],
    },
    {
      id: "changes",
      title: "13. Changes to this policy",
      body: [`We may update this policy. We will post the new version here with a new effective date, and for material changes we may also notify you by email or on your project page.`],
    },
    {
      id: "contact",
      title: "14. Contact us",
      body: [
        `${C.legalName}, doing business as ${C.brand}. Email: ${C.email}. Phone: ${C.phone}.${C.mailingAddress ? ` Mailing address: ${C.mailingAddress}.` : ""} This policy is effective ${LEGAL_EFFECTIVE_DATE}.`,
      ],
    },
  ],
};
