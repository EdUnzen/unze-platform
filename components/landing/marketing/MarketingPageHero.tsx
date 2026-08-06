import type { ReactNode } from "react";

interface MarketingPageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  children,
}: MarketingPageHeroProps) {
  return (
    <header className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-[#00C853]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">{description}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}
