import { COMPANY, LEGAL_EFFECTIVE_DATE, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

export const acceptableUseDoc: LegalDoc = {
  slug: "acceptable-use",
  title: "Acceptable Use Policy",
  description: `What ${C.legalName} will not build, publish, or allow on ${C.brand}.`,
  summary: [
    `We build websites and creative work for lawful businesses. We will not build, publish, or support anything illegal, deceptive, harmful, or that breaks other people's rights, and we can refuse or stop work without a refund if that happens.`,
  ],
  sections: [
    {
      id: "purpose",
      title: "1. Purpose",
      body: [
        `This policy is part of our Terms of Service. It applies to everything you ask us to create or publish, everything you send us, and how you use our Site and private links.`,
      ],
    },
    {
      id: "content",
      title: "2. Content we will not create or publish",
      body: [
        {
          list: [
            "anything illegal, or that helps someone break the law;",
            "content that infringes copyright, trademarks, or other rights, or that uses images, music, names, or likenesses without permission;",
            "false, deceptive, or misleading content, including fake reviews, fake testimonials, made-up credentials, licenses, awards, or statistics, and scams or pyramid or multi-level schemes;",
            "content that is hateful, harassing, threatening, violent, or that promotes self-harm;",
            "sexually explicit content, or anything involving minors in a sexual or exploitative way;",
            "illegal drugs, weapons or explosives sales, counterfeit goods, stolen goods, or gambling without the required licenses;",
            "professional, medical, financial, or legal claims that the business is not licensed or qualified to make, or health or income claims that are false or unsupported;",
            "malware, phishing, or anything designed to steal information or harm a device;",
            "content that violates the rules of an advertising, social, or payment platform where it will be used.",
          ],
        },
      ],
    },
    {
      id: "conduct",
      title: "3. Conduct we do not allow",
      body: [
        {
          list: [
            "attacking, probing, overloading, or bypassing the security of the Site or of anyone else's systems;",
            "scraping, copying, mirroring, imitating, or reselling our templates, code, designs, text, images, or process, using them to train or feed an artificial intelligence model, or using the Site to build a competing service (see our Copyright and Site Use Notice);",
            "using someone else's private link or account without permission, or trying to guess links;",
            "sending spam, abusive messages, or automated requests through our forms and messages;",
            "giving false information to place an order, using stolen payment methods, or opening payment disputes in bad faith;",
            "asking us to publish something on behalf of a business you do not own or are not authorized to represent.",
          ],
        },
      ],
    },
    {
      id: "enforcement",
      title: "4. What we may do",
      body: [
        `We decide what we will build. We may refuse an order, stop work, remove or disable content, take a website offline, suspend or end access, cancel a subscription, and report activity to authorities or affected parties, with or without notice. When this is because of a breach of this policy or the Terms, we do not give refunds. We are not required to monitor content but may review it.`,
      ],
    },
    {
      id: "reporting",
      title: "5. Reporting a problem or an infringement",
      body: [
        `To report content that breaks this policy or that you believe infringes your rights, email ${C.email} with your name and contact details, a description of the content and where it is, what right you believe is violated and why, and a statement that the information is accurate. We will review it and may remove content while we do. We may share a report with the person responsible. We may end the access of people who repeatedly infringe.`,
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      body: [`${C.legalName}, ${C.email}. This policy is effective ${LEGAL_EFFECTIVE_DATE}.`],
    },
  ],
};
