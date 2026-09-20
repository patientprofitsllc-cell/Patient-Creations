import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { copyrightDoc } from "@/lib/legal/copyright";

export const metadata: Metadata = {
  title: copyrightDoc.title,
  description: copyrightDoc.description,
  alternates: { canonical: "/copyright" },
};

export default function Page() {
  return <LegalPage doc={copyrightDoc} />;
}
