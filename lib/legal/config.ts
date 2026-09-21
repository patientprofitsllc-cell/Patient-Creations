import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";

// One place for the facts every legal page states, and the version customers
// accept. Bump LEGAL_VERSION whenever the wording of any legal page changes in a
// way that matters: the version is recorded with each acceptance, so what a
// customer agreed to can always be shown.

export const LEGAL_VERSION = "2026-09-22";
export const LEGAL_EFFECTIVE_DATE = "September 22, 2026";

export const COMPANY = {
  legalName: "Patient Profits LLC",
  brand: "Patient Creations",
  siteUrl: "https://patientcreations.com",
  // Georgia is where the business operates. Confirm this matches the state the LLC was formed in.
  governingState: "Georgia",
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE_DISPLAY,
  /** The business mailing address, if one is configured. It is never invented. */
  mailingAddress: (process.env.OUTREACH_MAILING_ADDRESS ?? "").trim() || null,
} as const;

/** Refund and cancellation windows, stated once so every page agrees. */
export const POLICY = {
  defectClaimDays: 7,
  arbitrationOptOutDays: 30,
  informalResolutionDays: 30,
  claimLimitYears: 1,
  deemedAcceptanceDays: 30,
  careCancelNoticeDays: 0,
  careUpdatesPerMonth: 3,
} as const;

/** The year the Site was first published. The notice reads "2026" that year and "2026-2027" after. */
export const COPYRIGHT_START_YEAR = 2026;

/** "© 2026" or "© 2026-2027", so the notice is always correct without anyone editing it. */
export function copyrightYears(now: Date = new Date()): string {
  const year = now.getFullYear();
  return year > COPYRIGHT_START_YEAR ? `${COPYRIGHT_START_YEAR}-${year}` : String(COPYRIGHT_START_YEAR);
}

export const COPYRIGHT_NOTICE = `© ${COPYRIGHT_START_YEAR} ${COMPANY.legalName}. All rights reserved.`;

export const LEGAL_PAGES = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund and Cancellation Policy" },
  { href: "/acceptable-use", label: "Acceptable Use Policy" },
  { href: "/copyright", label: "Copyright and Site Use Notice" },
] as const;

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  id: string;
  title: string;
  /** An important notice shown in a highlighted box above the section text. */
  callout?: string;
  body: LegalBlock[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  /** A short plain-English summary shown at the top. */
  summary?: string[];
  sections: LegalSection[];
}
