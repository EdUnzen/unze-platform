import "@/styles/globals.css";
import { LANDING_SEO } from "@/lib/constants/landing-copy";
import { getMarketingBaseUrl } from "@/lib/constants/site";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getMarketingBaseUrl()),
  alternates: {
    canonical: "/",
  },
  title: {
    default: LANDING_SEO.title,
    template: "%s | UNZE",
  },
  description: LANDING_SEO.description,
  applicationName: "UNZE",
  manifest: "/manifest.json",
  openGraph: {
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    url: LANDING_SEO.ogUrl,
    siteName: "UNZE",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UNZE",
  },
  icons: {
    icon: [
      { url: "/landing/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/landing/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1DB872",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
