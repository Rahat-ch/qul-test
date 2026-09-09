import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
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
  title: "QUL Reader",
  description:
    "A book-spread Quran reader built on Resources from the Quranic Universal Library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${indopakNastaleeq.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
