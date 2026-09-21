import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { partnerTermsDoc } from "@/lib/legal/partnerTerms";

export const metadata: Metadata = {
  title: partnerTermsDoc.title,
  description: partnerTermsDoc.description,
  alternates: { canonical: "/partner-terms" },
};

export default function Page() {
  return <LegalPage doc={partnerTermsDoc} />;
}
