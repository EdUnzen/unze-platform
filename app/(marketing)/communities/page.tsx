import dynamic from "next/dynamic";
import { CtaLink } from "@/components/landing/LegalPage";
import { LandingBetaTransparencySection } from "@/components/landing/marketing/LandingBetaTransparencySection";
import { MarketingCtaBar } from "@/components/landing/marketing/MarketingCtaBar";
import { MarketingPageHero } from "@/components/landing/marketing/MarketingPageHero";
import { PwaInstallHint } from "@/components/landing/marketing/PwaInstallHint";
import { isClosedBeta } from "@/lib/constants/beta-communication";
import { COMMUNITIES_PAGE } from "@/lib/constants/landing-copy";
import { getAppEntryPath } from "@/lib/constants/site";
import { fetchPublicDirectoryStats } from "@/lib/marketing/public-client";
import type { Metadata } from "next";

const LandingCommunitySearch = dynamic(
  () =>
    import("@/components/landing/marketing/LandingCommunitySearch").then(
      (m) => m.LandingCommunitySearch,
    ),
  { loading: () => <p className="text-sm text-gray-500">Suche wird geladen…</p> },
);

export const metadata: Metadata = {
  title: "Communities entdecken",
  description:
    "Finde Communities auf UNZE Connect. Geschlossene Beta: Demo-Communities sind als Demo gekennzeichnet.",
};

export const revalidate = 60;

export default async function CommunitiesPage() {
  let stats = { communityCount: 0, verifiedCount: 0, totalMembers: 0 };
  try {
    stats = await fetchPublicDirectoryStats();
  } catch {
    stats = { communityCount: 0, verifiedCount: 0, totalMembers: 0 };
  }

  const copy = COMMUNITIES_PAGE;
  const closedBeta = isClosedBeta();
  const hasStats =
    stats.communityCount > 0 || stats.verifiedCount > 0 || stats.totalMembers > 0;

  return (
    <>
      <MarketingPageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        {hasStats ? (
          <dl className="flex flex-wrap gap-8 text-sm">
            <div>
              <dt className="text-gray-500">Communities (Live)</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {stats.communityCount}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Verifiziert</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {stats.verifiedCount}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Mitglieder gesamt</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {stats.totalMembers.toLocaleString("de-DE")}
              </dd>
            </div>
          </dl>
        ) : null}
      </MarketingPageHero>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <LandingCommunitySearch resultLimit={48} cardSize="large" />

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-10">
          <MarketingCtaBar />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <PwaInstallHint />
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-sm font-semibold text-gray-900">Individuelles Projekt?</h2>
            <p className="mt-2 text-sm text-gray-600">
              UNZE Business entwickelt Web-Apps, Plattformen und Automatisierungen für dein
              Unternehmen.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CtaLink href="/business">Projekt anfragen</CtaLink>
              <CtaLink href={getAppEntryPath()} variant="secondary">
                App nutzen
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      {closedBeta ? <LandingBetaTransparencySection /> : null}
    </>
  );
}
