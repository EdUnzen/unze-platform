import { CtaLink } from "@/components/landing/LegalPage";
import { BETA_CTAS, isClosedBeta } from "@/lib/constants/beta-communication";
import Link from "next/link";

/** Kompakter Beta-Hinweis fuer Unterseiten (Communities, Business). */
export function MarketingBetaPageIntro() {
  if (!isClosedBeta()) return null;

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4 md:px-6 md:py-5">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
        Geschlossene Beta
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
        {
          "Demo-Communities sind als Demo gekennzeichnet und dienen der Plattform-Demonstration. Keine produktiven Zahlungen während der Beta. Creator und Crowd Partner gesucht."
        }
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CtaLink href={BETA_CTAS.creator.href}>Creator werden</CtaLink>
        <CtaLink href={BETA_CTAS.crowdPartner.href} variant="secondary">
          Crowd Partner
        </CtaLink>
        <Link
          href="/#beta-status"
          className="text-sm font-semibold text-amber-900 underline-offset-2 hover:underline"
        >
          Vollständiger Beta-Status
        </Link>
      </div>
    </div>
  );
}
