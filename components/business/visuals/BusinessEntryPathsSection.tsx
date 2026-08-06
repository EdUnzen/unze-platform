import { ArrowRight } from "lucide-react";
import { BusinessCtaButton, BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import Link from "next/link";

export function BusinessEntryPathsSection() {
  const c = BUSINESS_COPY.start.entryPaths;

  return (
    <BusinessSection className="bg-white">
      <div className="mx-auto max-w-2xl text-center">
        <BusinessEyebrow>{c.eyebrow}</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          {c.title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">{c.subtitle}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3 md:items-stretch">
        {c.items.map((item) => {
          const featured = "featured" in item && item.featured;

          return (
            <article
              key={item.href}
              className={
                featured
                  ? "group flex h-full flex-col rounded-2xl border border-[#00C853]/25 bg-white p-7 shadow-md ring-1 ring-[#00C853]/10 transition hover:-translate-y-0.5 hover:border-[#00C853]/35 hover:shadow-lg"
                  : "group flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50/90 p-7 shadow-sm transition hover:border-gray-200 hover:shadow-md"
              }
            >
              {"badge" in item && item.badge ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-[#00C853]/10 px-3 py-1 text-xs font-semibold text-[#00C853]">
                  {item.badge}
                </span>
              ) : (
                <span className="mb-4 h-6" aria-hidden />
              )}
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{item.text}</p>
              {featured ? (
                <BusinessCtaButton href={item.href} variant="primary" className="mt-6 w-full">
                  {item.cta}
                </BusinessCtaButton>
              ) : (
                <Link
                  href={item.href}
                  className={`mt-6 ${BUSINESS_VISUAL.sectionLink} group-hover:gap-3`}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </BusinessSection>
  );
}
