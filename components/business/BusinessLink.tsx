import type { ReactNode } from "react";

interface BusinessLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

/**
 * Business-Navigation — Full-Page-Load, damit nie die Connect-App-Shell
 * (Bottom-Nav) auf Business-Seiten hängen bleibt.
 */
export function BusinessLink({ href, className, children, onClick }: BusinessLinkProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
