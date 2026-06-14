import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Istiqtab — Set up in Morocco. Fast, clear, confident.",
    template: "%s | Istiqtab",
  },
  description:
    "Morocco's first AI-powered FDI facilitation platform. Navigate company setup, calculate incentives, and find verified local partners.",
  metadataBase: new URL("https://istiqtab.ma"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_MA", "ar_MA"],
    siteName: "Istiqtab",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
