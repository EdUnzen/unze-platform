import { CtaLink } from "@/components/landing/LegalPage";
import { BETA_MONETIZATION } from "@/lib/constants/beta-communication";
import { isClosedBeta } from "@/lib/constants/beta-communication";
import { LANDING_MONETIZATION } from "@/lib/constants/landing-copy";
import { CreditCard } from "lucide-react";

export function LandingMonetizationSection() {
  const copy = isClosedBeta() ? BETA_MONETIZATION : LANDING_MONETIZATION;

  return (
    <section className="border-y border-gray-100 bg-gray-900 py-16 text-white md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">{copy.intro}</p>
            <div className="mt-8">
              <CtaLink href={copy.ctaHref}>{copy.cta}</CtaLink>
            </div>
          </div>
          <ul className="space-y-3">
            {copy.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90"
              >
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
