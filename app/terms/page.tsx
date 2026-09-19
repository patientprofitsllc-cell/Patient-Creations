import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { termsDoc } from "@/lib/legal/terms";

export const metadata: Metadata = {
  title: termsDoc.title,
  description: termsDoc.description,
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage doc={termsDoc} />;
}
