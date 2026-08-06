import { CtaLink } from "@/components/landing/LegalPage";
import {
  BETA_CTAS,
  BETA_FEATURE_STATUS,
  BETA_STATUS_LABELS,
  BETA_TRANSPARENCY,
  type BetaFeatureStatus,
} from "@/lib/constants/beta-communication";
import { FlaskConical, Info, Rocket, Users } from "lucide-react";

const STATUS_STYLES: Record<BetaFeatureStatus, string> = {
  live: "bg-emerald-100 text-emerald-800",
  beta: "bg-amber-100 text-amber-900",
  planned: "bg-gray-100 text-gray-700",
};

export function LandingBetaTransparencySection() {
  const copy = BETA_TRANSPARENCY;

  return (
    <section id="beta-status" className="border-b border-gray-100 bg-gray-50 py-14 md:py-18">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">{copy.intro}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            { icon: FlaskConical, ...copy.demo },
            { icon: Info, ...copy.payments },
            { icon: Users, ...copy.crowdPartner },
            { icon: Rocket, ...copy.afterLaunch },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C853]/10 text-[#00C853]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold text-gray-900">Funktionsstatus</h3>
            <p className="mt-1 text-xs text-gray-500">
              Produktiv = in der Beta nutzbar &middot; Beta-Test = im aktiven Test &middot; Nach Beta = geplant
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {BETA_FEATURE_STATUS.map((row) => (
              <li
                key={row.feature}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{row.feature}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{row.note}</p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[row.status]}`}
                >
                  {BETA_STATUS_LABELS[row.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <CtaLink href={BETA_CTAS.creator.href}>{BETA_CTAS.creator.label}</CtaLink>
          <CtaLink href={BETA_CTAS.crowdPartner.href} variant="secondary">
            {BETA_CTAS.crowdPartner.label}
          </CtaLink>
          <CtaLink href={BETA_CTAS.explore.href} variant="secondary">
            {BETA_CTAS.explore.label}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
