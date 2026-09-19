import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { acceptableUseDoc } from "@/lib/legal/acceptableUse";

export const metadata: Metadata = {
  title: acceptableUseDoc.title,
  description: acceptableUseDoc.description,
  alternates: { canonical: "/acceptable-use" },
};

export default function Page() {
  return <LegalPage doc={acceptableUseDoc} />;
}
