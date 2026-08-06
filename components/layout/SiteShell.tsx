import { shouldWrapPlatformShellForPath } from "@/lib/constants/site-shell";
import { PATHNAME_HEADER } from "@/lib/constants/site";
import { headers } from "next/headers";

interface SiteShellProps {
  children: React.ReactNode;
}

function resolvePathname(headerList: Headers): string {
  const fromMiddleware = headerList.get(PATHNAME_HEADER)?.trim();
  return fromMiddleware ?? "";
}

export async function SiteShell({ children }: SiteShellProps) {
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const pathname = resolvePathname(headerList);

  if (!shouldWrapPlatformShellForPath(pathname, host)) {
    return <>{children}</>;
  }

  const { PlatformShell } = await import("@/components/layout/PlatformShell");
  return <PlatformShell>{children}</PlatformShell>;
}
