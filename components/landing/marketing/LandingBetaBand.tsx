import { CtaLink } from "@/components/landing/LegalPage";
import { BETA_CREATOR_BAND, BETA_CTAS } from "@/lib/constants/beta-communication";
import { Users } from "lucide-react";

export function LandingBetaBand() {
  const copy = BETA_CREATOR_BAND;

  return (
    <section className="relative overflow-hidden border-y border-[#00C853]/20 bg-gradient-to-br from-[#00C853]/10 via-white to-emerald-50/50 py-14 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              <Users className="h-4 w-4" aria-hidden />
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">{copy.intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaLink href={BETA_CTAS.creator.href}>{BETA_CTAS.creator.label}</CtaLink>
            <CtaLink href={BETA_CTAS.crowdPartner.href} variant="secondary">
              {BETA_CTAS.crowdPartner.label}
            </CtaLink>
          </div>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.points.map((reason) => (
            <li
              key={reason}
              className="rounded-xl border border-[#00C853]/15 bg-white/80 px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-sm"
            >
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
