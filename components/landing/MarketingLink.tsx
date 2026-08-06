import type { ReactNode } from "react";
import { resolveMarketingHref } from "@/lib/marketing/marketing-link";

interface MarketingLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * Marketing-Navigation — Full-Page-Load für interne Pfade,
 * damit SiteShell serverseitig korrekt umschaltet (kein App-Shell-Leak).
 */
export function MarketingLink({ href, className, children }: MarketingLinkProps) {
  const { href: resolved, external } = resolveMarketingHref(href);

  return (
    <a
      href={resolved}
      className={className}
      {...(external ? { rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
