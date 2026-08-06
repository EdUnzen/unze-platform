import { Inter, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { BusinessFooter } from "@/components/business/BusinessFooter";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { getUnzeCommunityExitHref } from "@/lib/constants/unze-ecosystem-nav";

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

interface BusinessShellProps {
  children: React.ReactNode;
}

export async function BusinessShell({ children }: BusinessShellProps) {
  const headerList = await headers();
  const communityExitHref = getUnzeCommunityExitHref(headerList.get("host"));

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-dvh bg-white font-[family-name:var(--font-landing)] text-gray-900 antialiased`}
      data-unze-business-shell
    >
      <BusinessHeader communityExitHref={communityExitHref} />
      <main>{children}</main>
      <BusinessFooter communityExitHref={communityExitHref} />
    </div>
  );
}
