import { MarketingLink } from "@/components/landing/MarketingLink";
import { CommunityVisualBanner } from "@/components/landing/marketing/CommunityVisualBanner";
import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { formatMemberCount } from "@/lib/marketing/format";
import type { PublicCommunityCard } from "@/lib/marketing/public-directory.service";
import { ShieldCheck, Sparkles, Star, Users } from "lucide-react";

export function CommunityDirectoryCard({
  community,
  href,
  size = "default",
}: {
  community: PublicCommunityCard;
  href?: string;
  size?: "default" | "large";
}) {
  const target = href ?? `/community/${community.slug}`;
  const large = size === "large";

  return (
    <MarketingLink
      href={target}
      className={`group flex h-full flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.03] transition duration-300 hover:border-[#00C853]/35 hover:shadow-xl ${
        large
          ? "rounded-3xl border border-gray-200/70 hover:-translate-y-1"
          : "rounded-2xl border border-gray-200/80 hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      <div className="relative">
        <CommunityVisualBanner
          community={community}
          priority={false}
          className={
            large
              ? "relative h-44 w-full overflow-hidden md:h-52"
              : "relative aspect-[16/10] w-full overflow-hidden"
          }
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isDemoCommunitySlug(community.slug) ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-100/95 px-2.5 py-1 text-[10px] font-semibold text-amber-900 shadow-sm backdrop-blur"
              title="Demo-Community zur Plattform-Demonstration"
            >
              Demo
            </span>
          ) : null}
          {community.isVerified ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#00C853] shadow-sm backdrop-blur"
              title="Community-Badge: Von UNZE automatisch vergeben"
            >
              <ShieldCheck className="h-3 w-3" aria-hidden />
              Verifiziert
            </span>
          ) : null}
          {community.isTrending ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur"
              title="Community-Badge: Besonders aktiv (automatisch durch UNZE)"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              Besonders aktiv
            </span>
          ) : null}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${large ? "p-6" : "p-5"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#00C853]">
          {community.category ?? "Community"}
        </p>
        <h2
          className={`mt-2 font-[family-name:var(--font-display)] font-bold leading-snug text-gray-900 transition group-hover:text-[#00C853] ${
            large ? "text-xl md:text-[1.35rem]" : "text-lg"
          }`}
        >
          {community.title}
        </h2>
        <p
          className={`mt-2.5 line-clamp-2 flex-1 leading-relaxed text-gray-600 ${
            large ? "text-[15px]" : "text-sm"
          }`}
        >
          {community.description || "Eine aktive Community auf UNZE Connect."}
        </p>
        <div
          className={`mt-5 flex flex-wrap items-center border-t border-gray-100 text-gray-500 ${
            large ? "gap-5 pt-5 text-sm" : "gap-4 pt-4 text-xs"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
            <Users className={`text-gray-400 ${large ? "h-4 w-4" : "h-3.5 w-3.5"}`} aria-hidden />
            {formatMemberCount(community.memberCount)}
          </span>
          {community.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-gray-700">
              <Star
                className={`fill-amber-400 text-amber-400 ${large ? "h-4 w-4" : "h-3.5 w-3.5"}`}
                aria-hidden
              />
              {community.rating.toFixed(1)}
              <span className="font-normal text-gray-400">({community.reviewCount})</span>
            </span>
          ) : (
            <span className="text-gray-400">Neu auf UNZE</span>
          )}
        </div>
      </div>
    </MarketingLink>
  );
}
