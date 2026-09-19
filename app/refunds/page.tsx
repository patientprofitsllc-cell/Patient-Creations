import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { refundsDoc } from "@/lib/legal/refunds";

export const metadata: Metadata = {
  title: refundsDoc.title,
  description: refundsDoc.description,
  alternates: { canonical: "/refunds" },
};

export default function Page() {
  return <LegalPage doc={refundsDoc} />;
}
