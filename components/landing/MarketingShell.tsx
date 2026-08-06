import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { MarketingBetaBanner } from "@/components/landing/marketing/MarketingBetaBanner";
import { Inter, Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-landing",
  weight: ["400", "500", "600", "700"],
});

interface MarketingShellProps {
  children: React.ReactNode;
}

export async function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div
      className={`${display.variable} ${body.variable} min-h-dvh bg-white font-[family-name:var(--font-landing)] text-gray-900`}
    >
      <MarketingHeader />
      <MarketingBetaBanner />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
