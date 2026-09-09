import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";

import { AttributionFooter } from "@/components/attribution-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * QUL's Indopak Nastaleeq font (catalog Resource /resources/font/242), copied
 * from `data/fonts` into the app and self-hosted by `next/font/local`. The
 * script Resource ends every ayah with a private-use codepoint that renders
 * only in this font, so the Arabic is unreadable without it.
 */
const indopakNastaleeq = localFont({
  src: "../fonts/indopak-nastaleeq.woff2",
  variable: "--font-indopak",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quran.rahatcodes.com"),
  title: "Simple Quran",
  description:
    "A book-spread Quran reader built on Resources from the Quranic Universal Library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${indopakNastaleeq.variable} h-full antialiased`}
    >
      {/* The attribution footer sits in the root layout so every route — Spread,
          surah index, and anything added later — credits the QUL Resources
          without each page having to remember to. `children` carries `flex-1`,
          so the footer stays below the fold on a short page. */}
      <body className="min-h-full flex flex-col">
        {children}
        <AttributionFooter />
      </body>
    </html>
  );
}
