import { PlatformShell } from "@/components/layout/PlatformShell";

/** Connect-App Layout — BottomNav nur für Plattform-Routen. */
export default async function PlatformAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformShell>{children}</PlatformShell>;
}
