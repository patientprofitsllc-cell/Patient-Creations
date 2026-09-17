import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Patient Creations · The Digital Master · Trenton, Patient Profits",
  description:
    "Cinematic AI websites, software, and agent systems. Agency quality at freelancer-floor pricing. Book Trenton, of Patient Profits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-obsidian text-ice antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
