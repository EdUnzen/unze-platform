import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessLink } from "@/components/business/BusinessLink";
import { BUSINESS_CTA_HREF } from "@/lib/constants/business-site";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { cn } from "@/lib/utils/cn";

export function BusinessEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C853]">{children}</p>
  );
}

export function BusinessSectionIntro({
  eyebrow,
  title,
  intro,
  align = "center",
  className = "",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow}
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-balance text-gray-900 md:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-gray-600">{intro}</p>
      ) : null}
    </div>
  );
}

/** Einheitliche Showcase-Karte — immer abgerundet, mit Luft */
export function BusinessShowcaseCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10 lg:p-12 ${className}`}
    >
      {children}
    </div>
  );
}

export function BusinessPageHero({
  eyebrow,
  headline,
  subline,
  dark = false,
}: {
  eyebrow: string;
  headline: string;
  subline: string;
  dark?: boolean;
}) {
  return (
    <section
      className={
        dark
          ? "bg-gray-950 text-white"
          : "border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white"
      }
    >
      <div className="container mx-auto max-w-4xl px-4 py-20 md:py-28">
        <BusinessEyebrow>{eyebrow}</BusinessEyebrow>
        <h1
          className={`mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-[3.25rem] lg:leading-[1.08] ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {headline}
        </h1>
        <p
          className={`mt-6 max-w-2xl text-lg leading-relaxed text-pretty md:text-xl ${
            dark ? "text-white/70" : "text-gray-600"
          }`}
        >
          {subline}
        </p>
      </div>
    </section>
  );
}

export function BusinessSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <div className="container mx-auto max-w-6xl px-4">{children}</div>
    </section>
  );
}

/** Dezenter Text-Link für Sektions-Footer und tertiäre Navigation */
export function BusinessTextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(BUSINESS_VISUAL.sectionLink, className)}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function BusinessCtaButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300";
  const styles = {
    primary: `${base} bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20 hover:bg-[#00b34a] hover:shadow-xl`,
    secondary: `${base} border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-md`,
    ghost: `${base} border border-white/20 bg-white/5 text-white hover:bg-white/10`,
  };
  return (
    <BusinessLink href={href} className={`${styles[variant]} ${className ?? ""}`}>
      {children}
    </BusinessLink>
  );
}

export function BusinessCtaBand({
  title,
  text,
  cta,
  href = BUSINESS_CTA_HREF,
}: {
  title: string;
  text: string;
  cta: string;
  href?: string;
}) {
  return (
    <section className="bg-gray-950 py-20 text-white md:py-24">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-white/65">{text}</p>
        <div className="mt-8">
          <BusinessCtaButton href={href} variant="primary">
            {cta}
          </BusinessCtaButton>
        </div>
      </div>
    </section>
  );
}
