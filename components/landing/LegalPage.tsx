import Image from "next/image";
import type { ReactNode } from "react";
import { MarketingLink } from "@/components/landing/MarketingLink";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        {title}
      </h1>
      <div className="prose prose-gray mt-8 max-w-none space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({
  title,
  body,
  subsections,
}: {
  title: string;
  body?: string;
  subsections?: readonly { title: string; body: string }[];
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900">
        {title}
      </h2>
      {body ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{body}</p>
      ) : null}
      {subsections?.map((sub) => (
        <div key={sub.title} className="mt-4">
          <h3 className="text-base font-semibold text-gray-800">{sub.title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {sub.body}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ContactCard({
  email,
  phone,
  address,
}: {
  email: string;
  phone: string;
  address: string;
}) {
  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <p>
        <span className="font-medium text-gray-900">E-Mail: </span>
        <a href={`mailto:${email}`} className="text-[#00C853] hover:underline">
          {email}
        </a>
      </p>
      <p>
        <span className="font-medium text-gray-900">Telefon: </span>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-gray-700">
          {phone}
        </a>
      </p>
      <p className="whitespace-pre-line text-sm text-gray-600">{address}</p>
    </div>
  );
}

export function BusinessHero() {
  return (
    <section className="relative overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-800/70" />
      <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          B2B
        </span>
      </div>
    </section>
  );
}

export function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "bg-[#00C853] text-white hover:bg-[#00b34a]"
      : "border border-gray-300 bg-white text-gray-800 hover:border-[#00C853]";
  return (
    <MarketingLink
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${cls}`}
    >
      {children}
    </MarketingLink>
  );
}

export function LandingImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={800}
      className={className}
      priority={priority}
    />
  );
}
