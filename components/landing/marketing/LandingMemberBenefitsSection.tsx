import { CtaLink } from "@/components/landing/LegalPage";
import { LANDING_MEMBER_BENEFITS } from "@/lib/constants/landing-copy";
import { getAppEntryPath } from "@/lib/constants/site";

export function LandingMemberBenefitsSection() {
  const copy = LANDING_MEMBER_BENEFITS;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              {copy.title}
            </h2>
          </div>
          <CtaLink href={getAppEntryPath()} variant="secondary">
            App nutzen
          </CtaLink>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/80 p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
