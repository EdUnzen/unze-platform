"use client";

interface CommunityExitLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}

/**
 * Leaves the Business area and returns to the Community landing (Marketing).
 * Never routes to the Connect app home by mistake on localhost.
 */
export function CommunityExitLink({
  href,
  className,
  children,
  onNavigate,
}: CommunityExitLinkProps) {
  if (!href) return null;

  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      onClick={() => onNavigate?.()}
      {...(isExternal ? { rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
