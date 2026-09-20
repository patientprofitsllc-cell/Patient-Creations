import { COMPANY, COPYRIGHT_NOTICE, LEGAL_EFFECTIVE_DATE, type LegalDoc } from "@/lib/legal/config";

const C = COMPANY;

// Wording only. The technical side (robots.txt, headers, blocking known copier
// and AI-training bots) lives in app/robots.ts, next.config.mjs and middleware.ts, and
// tests/unit/copyright.test.ts keeps the two in step.

export const copyrightDoc: LegalDoc = {
  slug: "copyright",
  title: "Copyright and Site Use Notice",
  description: `Who owns ${C.brand}, what may not be copied, scraped, or imitated, and how to report copying.`,
  summary: [
    `${C.brand} is owned by ${C.legalName}. Its code, designs, words, images, videos, and animations are protected by copyright, and its name and logo are our marks. You may look at the Site and buy from it. You may not copy it, scrape it, clone its look, or use it to train AI.`,
  ],
  sections: [
    {
      id: "ownership",
      title: "1. Who owns this Site",
      callout: `${COPYRIGHT_NOTICE} Patient Creations is a trademark of ${C.legalName}.`,
      body: [
        `${C.legalName} ("we", "us") owns, or has the right to use, everything on ${C.siteUrl} and on any page, subdomain, email, or private link we operate for ${C.brand} (together, the "Site"). This notice is part of our Terms of Service and works together with our Acceptable Use Policy.`,
        `We do not claim ownership of general ideas, facts, or ordinary business practices. What we protect is our specific work and the way we put it together.`,
      ],
    },
    {
      id: "protected",
      title: "2. What is protected",
      body: [
        `The following are our copyrighted works, trade secrets, or marks, and all rights in them are reserved:`,
        {
          list: [
            "the source code, styles, scripts, and configuration of the Site, in source, compiled, minified, or any other form, and how they are structured and connected;",
            "the design of the Site as a whole, including its layouts, page flows, spacing, typography, color system, components, and the selection and arrangement of all of them;",
            "the live animated backgrounds, motion scenes, transitions, and interactive effects;",
            "all text, including headlines, product and service descriptions, scopes of work, comparison tables, questions and answers, emails, and legal pages;",
            "all images, graphics, icons, logos, photographs, videos, audio, and generated visuals;",
            "our catalog structure, packages, price tables, and the way we present them;",
            "our templates, prompts, workflows, checklists, and other methods of work;",
            "the names Patient Creations and Patient Profits LLC, our logo, and our other marks.",
          ],
        },
        `Some things on the Site belong to others, such as open-source software, fonts, and licensed media. They stay under their own licenses and we do not claim them.`,
      ],
    },
    {
      id: "allowed",
      title: "3. What you may do",
      body: [
        `You may view the Site in a normal web browser to learn about our services and to place an order. You may link to any public page. You may quote a short excerpt with a clear credit and a link back for news, review, or commentary, as far as the law of fair use allows. You may keep copies of your own receipts, order pages, and the deliverables you paid for under Section 7 of the Terms.`,
      ],
    },
    {
      id: "not-allowed",
      title: "4. What you may not do without our written permission",
      body: [
        {
          list: [
            "copy, reproduce, republish, mirror, or re-host the Site or any part of it, including by saving pages, code, styles, scripts, images, videos, or text and putting them online or in a product;",
            "build a site, template, theme, or product that copies the look, layout, text, motion, or code of the Site, or that is made to look like ours or to be confused with ours;",
            "use scrapers, crawlers, site copiers, bots, headless browsers, or other automated tools to copy the Site, to collect its content or prices, or to build a database from it, other than ordinary search engine indexing that follows our robots.txt file;",
            "decompile, disassemble, reverse engineer, or try to recover or reconstruct source code, including from source maps, bundles, or network traffic, in order to reuse it;",
            "use any part of the Site, or anything it produces, to train, fine tune, test, or feed an artificial intelligence or machine learning model, or for any text and data mining. We reserve all rights and expressly opt out of text and data mining, including under Article 4 of the European Union Directive on Copyright in the Digital Single Market;",
            "frame, embed, or hotlink our pages, images, or videos on another site, or present our work as your own;",
            "remove or change any copyright, trademark, or ownership notice;",
            "sell, license, sublicense, or give away any part of the Site as a template or product;",
            "use the names Patient Creations or Patient Profits, our logo, or a confusingly similar name in a business name, domain name, social media name, advertisement, or product in a way that suggests a connection with us.",
          ],
        },
      ],
    },
    {
      id: "automated",
      title: "5. Automated access and blocks",
      body: [
        `Our robots.txt file and the notices sent with our pages are our instructions to automated visitors. We may block or slow any visitor, including by user agent, address, or behavior, and we do block software known for copying sites or collecting content to train AI models. Working around a block, or pretending to be another kind of visitor to avoid one, is a breach of this notice and may also be unlawful.`,
        `Ordinary search engines that follow robots.txt may index our public pages. That is not permission to copy them.`,
      ],
    },
    {
      id: "deliverables",
      title: "6. Your deliverables and our other work",
      body: [
        `What you buy is licensed to you under Section 7 of the Terms. That license covers the finished deliverable for your own business. It does not give you our Site, our templates, our motion scenes, our code, or our methods, and it does not stop us from building different work for other customers using our own components, techniques, and know-how.`,
      ],
    },
    {
      id: "marks",
      title: "7. Our name and logo",
      body: [
        `Patient Creations and Patient Profits LLC, and our logo, identify our business. We claim the rights that come from using them in commerce, whether or not they are registered. You may not use them, or anything confusingly similar, except to refer to us accurately, for example to say you are our customer.`,
      ],
    },
    {
      id: "report",
      title: "8. Reporting copying",
      body: [
        `If you find a copy or imitation of the Site, or someone using our work without permission, please email ${C.email} with the address where you saw it and what was copied.`,
        `If you believe something on the Site infringes your copyright, email ${C.email} with: a description of your work; where on the Site the material is; your name, address, phone, and email; a statement that you believe in good faith that the use is not authorized by you, your agent, or the law; a statement, under penalty of perjury, that your notice is accurate and that you are the owner or authorized to act for the owner; and your physical or electronic signature. We may pass a notice to the person the material relates to.`,
      ],
    },
    {
      id: "enforcement",
      title: "9. What we may do about copying",
      body: [
        `If someone copies or imitates the Site or breaks this notice, we may, without limiting anything else the law allows: block their access; send takedown notices to their web host, domain registrar, payment processor, app store, search engine, advertising platform, and social media platform; ask a court for an order stopping the copying; and ask for damages, the profits made from the copying, statutory damages, and legal fees and costs, to the fullest extent the law allows.`,
        `Claims to stop the misuse of our copyrights, marks, code, or confidential information can be brought in court and are not limited to arbitration, as Section 27 of the Terms explains. If you are a customer, the rest of the Terms, including the limits on our liability, still apply to you.`,
        `By using the Site you agree to follow this notice. Nothing in it takes away a right you have under a law that cannot be waived.`,
      ],
    },
    {
      id: "permission",
      title: "10. Asking for permission and changes to this notice",
      body: [
        `If you would like to use part of the Site in a way this notice does not allow, ask first at ${C.email}. Permission counts only if we give it in writing. We may update this notice; the version and date at the top show when it last changed. This notice is effective ${LEGAL_EFFECTIVE_DATE}.`,
      ],
    },
  ],
};
