import { MobileShell } from "@/components/layout/MobileShell";
import { PlatformTopBar } from "@/components/layout/PlatformTopBar";
import "@/styles/globals.css";
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
  title: {
    default: "UNZE — Universelles Netzwerk",
    template: "%s | UNZE",
  },
  description:
    "Community- und Creator-Plattform für moderne Netzwerke. Entdecke Communities, baue dein Netzwerk auf.",
  applicationName: "UNZE",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UNZE",
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
      <body className="font-sans">
        <MobileShell>
          <PlatformTopBar />
          {children}
        </MobileShell>
      </body>
    </html>
  );
}
