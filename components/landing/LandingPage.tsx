import {
  LANDING_BUSINESS_BAND,
  LANDING_COMMUNITY_TEASER,
  LANDING_CTA,
  LANDING_HERO,
} from "@/lib/constants/landing-copy";
import { BETA_HERO, isClosedBeta } from "@/lib/constants/beta-communication";
import { getAppEntryPath } from "@/lib/constants/site";
import { CtaLink, LandingImage } from "@/components/landing/LegalPage";
import { LandingBetaTransparencySection } from "@/components/landing/marketing/LandingBetaTransparencySection";
import { LandingCommunitySearch } from "@/components/landing/marketing/LandingCommunitySearch";
import { LandingCreatorSection } from "@/components/landing/marketing/LandingCreatorSection";
import { fetchPublicDirectoryStats } from "@/lib/marketing/public-client";

export async function LandingPage() {
  const closedBeta = isClosedBeta();
  const hero = closedBeta ? BETA_HERO : LANDING_HERO;

  let stats = { communityCount: 0, verifiedCount: 0, totalMembers: 0 };
  try {
    stats = await fetchPublicDirectoryStats();
  } catch {
    stats = { communityCount: 0, verifiedCount: 0, totalMembers: 0 };
  }

  const hasStats =
    stats.communityCount > 0 || stats.verifiedCount > 0 || stats.totalMembers > 0;

  const band = LANDING_BUSINESS_BAND;
  const teaser = LANDING_COMMUNITY_TEASER;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 min-h-[520px] md:min-h-[640px]">
          <LandingImage
            src={LANDING_HERO.heroImage}
            alt=""
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-white/75 to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,200,83,0.12)_0%,_transparent_50%)]" />
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 pb-6 pt-20 md:pb-10 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-[#00C853]/30 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00C853] shadow-sm backdrop-blur">
              {hero.badge}
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
              {hero.subtitle}
            </p>
          </div>

          <div id="communities" className="mt-10 md:mt-12">
            <LandingCommunitySearch resultLimit={9} cardSize="large" />
          </div>

          {hasStats ? (
            <dl className="mt-10 flex flex-wrap justify-center divide-x divide-gray-200/80 text-center md:mt-12">
              <div className="px-6 py-1">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Mitglieder
                </dt>
                <dd className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                  {stats.totalMembers.toLocaleString("de-DE")}
                </dd>
              </div>
              <div className="px-6 py-1">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Communities
                </dt>
                <dd className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                  {stats.communityCount}
                </dd>
              </div>
              <div className="px-6 py-1">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Verifiziert
                </dt>
                <dd className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                  {stats.verifiedCount}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-14 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              {teaser.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              {teaser.title}
            </h2>
            <p className="mt-3 text-gray-600">{teaser.description}</p>
            <div className="mt-6">
              <CtaLink href="/communities" variant="secondary">
                {teaser.cta}
              </CtaLink>
            </div>
          </div>
        </div>
      </section>

      {closedBeta ? <LandingBetaTransparencySection /> : null}

      <LandingCreatorSection />

      <section className="border-y border-gray-200 bg-white py-12 md:py-14">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {band.eyebrow}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
              {band.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">{band.description}</p>
          </div>
          <CtaLink href={band.href}>{band.cta}</CtaLink>
        </div>
      </section>

      <section className="bg-gray-900 py-16 text-white md:py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            {LANDING_CTA.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{LANDING_CTA.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CtaLink href={getAppEntryPath()}>{LANDING_CTA.primary}</CtaLink>
            <CtaLink href={LANDING_CTA.secondaryHref} variant="secondary">
              {LANDING_CTA.secondary}
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
