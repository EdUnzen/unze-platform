import { CtaLink } from "@/components/landing/LegalPage";
import { BETA_CTAS, BETA_LANDING_CREATOR, isClosedBeta } from "@/lib/constants/beta-communication";
import { LANDING_CREATOR } from "@/lib/constants/landing-copy";

export function LandingCreatorSection() {
  const closedBeta = isClosedBeta();
  const copy = closedBeta ? BETA_LANDING_CREATOR : LANDING_CREATOR;

  return (
    <section className="border-y border-gray-100 bg-white py-16 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-gray-600">{copy.intro}</p>
          <ul className="mt-6 space-y-3">
            {copy.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={copy.ctaHref}>{copy.cta}</CtaLink>
            {closedBeta ? (
              <CtaLink href={BETA_CTAS.crowdPartner.href} variant="secondary">
                {BETA_CTAS.crowdPartner.label}
              </CtaLink>
            ) : null}
          </div>
        </div>
        {!closedBeta ? (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 shadow-sm">
            <dl className="grid grid-cols-2 gap-6">
              {LANDING_CREATOR.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</dt>
                  <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-8">
            <p className="text-sm font-semibold text-amber-900">Geschlossene Beta</p>
            <p className="mt-3 text-sm leading-relaxed text-amber-950/80">
              {
                "Während der Beta testen ausgewählte Creator und Crowd Partner die Plattform mit uns. Dein persönlicher Empfehlungslink wird automatisch erstellt – später auch für weitere Creator-Empfehlungen."
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
