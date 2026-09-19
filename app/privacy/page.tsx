import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacyDoc } from "@/lib/legal/privacy";

export const metadata: Metadata = {
  title: privacyDoc.title,
  description: privacyDoc.description,
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage doc={privacyDoc} />;
}
