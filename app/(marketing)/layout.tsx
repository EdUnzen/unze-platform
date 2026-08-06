import { MarketingShell } from "@/components/landing/MarketingShell";

/** Community-Landing — MarketingShell (Communities, Events, Rechtliches). */
export default function MarketingAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingShell>{children}</MarketingShell>;
}
