import { BusinessShell } from "@/components/business/BusinessShell";

/** Business-Bereich — ausschließlich BusinessShell, niemals Marketing-Header. */
export default function BusinessAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessShell>{children}</BusinessShell>;
}
