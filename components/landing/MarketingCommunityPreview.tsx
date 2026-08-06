import { notFound } from "next/navigation";
import { MarketingLink } from "@/components/landing/MarketingLink";
import { CommunityVisualBanner } from "@/components/landing/marketing/CommunityVisualBanner";
import { MarketingCtaBar } from "@/components/landing/marketing/MarketingCtaBar";
import { PwaInstallHint } from "@/components/landing/marketing/PwaInstallHint";
import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getCommunityJoinUrl, platformUrl } from "@/lib/constants/site";
import { fetchPublicCommunityPreview } from "@/lib/marketing/public-client";
import { formatMemberCount } from "@/lib/marketing/format";
import {
  Activity,
  Award,
  Calendar,
  ChevronLeft,
  Layers,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} von 5 Sternen`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < full ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </span>
  );
}

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {icon}
        {label}
      </p>
      <p
        className={`mt-2 font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl ${
          accent ? "text-[#00C853]" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ContentSection({
  title,
  icon,
  count,
  children,
  emptyMessage,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
  emptyMessage: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C853]/10 text-[#00C853]">
            {icon}
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-xs text-gray-500">
              {count > 0 ? `${count} Einträge` : emptyMessage}
            </p>
          </div>
        </div>
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

function ItemCard({
  title,
  description,
  meta,
  href,
}: {
  title: string;
  description?: string | null;
  meta?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#00C853]/25 hover:shadow-md">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      ) : null}
      {meta ? <p className="mt-3 text-xs font-medium text-gray-500">{meta}</p> : null}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block h-full" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

interface MarketingCommunityPreviewProps {
  slug: string;
}

export async function MarketingCommunityPreview({ slug }: MarketingCommunityPreviewProps) {
  const preview = await fetchPublicCommunityPreview(slug);
  if (!preview) notFound();

  const { community, events, services, groups, reviews, awards } = preview;
  const joinUrl = getCommunityJoinUrl(slug);
  const isActive = community.isTrending || community.memberCount > 0;
  const isDemo = isDemoCommunitySlug(slug);

  return (
    <article>
      <div className="relative">
        <CommunityVisualBanner
          community={community}
          className="relative h-56 w-full md:h-80 lg:h-[22rem]"
          priority
          overlay="dark"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-8 pt-24 md:px-0 md:pb-10">
          <div className="container mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              {community.category}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white md:text-5xl">
              {community.title}
            </h1>
          </div>
        </div>
        <div className="absolute left-0 right-0 top-0">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <MarketingLink
              href="/communities"
              className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-black/45"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Communities
            </MarketingLink>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#00C853]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00C853]">
              {community.category}
            </span>
            {isDemo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                Demo-Community
              </span>
            ) : null}
            {community.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Verifiziert
              </span>
            ) : null}
            {community.isTrending ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Besonders aktiv
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <Activity className="h-3.5 w-3.5" aria-hidden />
              {isActive ? "Live auf UNZE Connect" : "Öffentlich gelistet"}
            </span>
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gray-900 md:hidden">
            {community.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
            {community.description || "Eine aktive Community auf UNZE Connect."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <StatTile
              label="Mitglieder"
              value={formatMemberCount(community.memberCount)}
              icon={<Users className="h-3.5 w-3.5" aria-hidden />}
              accent
            />
            <StatTile
              label="Bewertung"
              value={
                community.reviewCount > 0 ? (
                  <span className="flex items-baseline gap-2">
                    {community.rating.toFixed(1)}
                    <span className="text-sm font-normal text-gray-500">
                      ({community.reviewCount})
                    </span>
                  </span>
                ) : (
                  "Neu"
                )
              }
              icon={<Star className="h-3.5 w-3.5 text-amber-400" aria-hidden />}
            />
            <StatTile
              label="Verifizierung"
              value={community.isVerified ? "Verifiziert" : "Öffentlich"}
              icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
            />
          </div>

          <div className="mt-8">
            <MarketingCtaBar communitySlug={slug} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-10 md:py-14">
        <div className="container mx-auto max-w-6xl space-y-6 px-4">
          <ContentSection
            title="Bewertungen"
            icon={<Star className="h-5 w-5" />}
            count={reviews.length}
            emptyMessage={
              "Noch keine öffentlichen Bewertungen – Mitglieder bewerten auf UNZE Connect."
            }
          >
            <ul className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{review.authorName}</p>
                    <Stars rating={review.rating} />
                  </div>
                  {review.title ? (
                    <p className="mt-2 text-sm font-semibold text-gray-800">{review.title}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.body}</p>
                </li>
              ))}
            </ul>
          </ContentSection>

          <ContentSection
            title="Öffentliche Gruppen"
            icon={<Layers className="h-5 w-5" />}
            count={groups.length}
            emptyMessage="Gruppen und Unterbereiche werden auf UNZE Connect verwaltet."
          >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 9).map((group) => (
                <li key={group.id}>
                  <ItemCard title={group.title} description={group.description} />
                </li>
              ))}
            </ul>
          </ContentSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <ContentSection
              title="Events"
              icon={<Calendar className="h-5 w-5" />}
              count={events.length}
              emptyMessage="Events werden von der Community auf UNZE Connect veröffentlicht."
            >
              <ul className="grid gap-3 sm:grid-cols-2">
                {events.map((event) => (
                  <li key={event.id}>
                    <ItemCard
                      title={event.title}
                      description={event.description}
                      meta={
                        event.startsAt
                          ? new Date(event.startsAt).toLocaleDateString("de-DE", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : undefined
                      }
                      href={platformUrl(`/community/${slug}/event/${event.slug ?? event.id}`)}
                    />
                  </li>
                ))}
              </ul>
            </ContentSection>

            <ContentSection
              title="Services"
              icon={<Wrench className="h-5 w-5" />}
              count={services.length}
              emptyMessage="Buchbare Services sind in der App sichtbar und verwaltbar."
            >
              <ul className="grid gap-3">
                {services.map((service) => (
                  <li key={service.id}>
                    <ItemCard title={service.title} description={service.description} />
                  </li>
                ))}
              </ul>
            </ContentSection>
          </div>

          <ContentSection
            title="Auszeichnungen & Voraussetzungen"
            icon={<Award className="h-5 w-5" />}
            count={awards.length}
            emptyMessage={
              "Mitglieder erhalten Auszeichnungen und Zertifikate von der Community – sie können Zugang zu Gruppen, Events oder Services eröffnen."
            }
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {awards.map((award) => (
                <li key={award.id}>
                  <ItemCard
                    title={award.name}
                    description={award.description}
                    meta={
                      award.grantedCount > 0
                        ? `${award.grantedCount.toLocaleString("de-DE")} verliehen`
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </ContentSection>

          <div className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 md:grid-cols-2 md:p-8">
            <PwaInstallHint />
            <div className="flex flex-col justify-center">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
                Mehr als eine Vorschau
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {
                  "Diese Seite zeigt ausschließlich öffentliche Informationen aus UNZE Connect. Beitritt, Verwaltung, Zahlungen und der Mitgliederbereich sind in der App auf "
                }
                <a href={joinUrl} className="font-medium text-[#00C853] hover:underline">
                  unzeconnect.app
                </a>{" "}
                verf{"ü"}gbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
