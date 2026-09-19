import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SHARE_IMAGE_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/config/site";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Patient Creations",
    "Patient Profits",
    "AI website design",
    "cinematic AI website",
    "UGC ads",
    "cinematic video ads",
    "NFC business cards",
    "Google review NFC card",
    "multi-agent AI systems",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: SHARE_IMAGE_PATH, width: 1186, height: 667, alt: "Patient Creations" }],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SHARE_IMAGE_PATH] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-obsidian text-ice antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-obsidian"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
