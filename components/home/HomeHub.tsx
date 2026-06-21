import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeValueProps } from "@/components/home/HomeValueProps";
import { GuestOnboardingHint } from "@/components/onboarding/GuestOnboardingHint";
import type { HomePendingApplication } from "@/services/home/home.service";
import type { Community } from "@/types/community";
import type { CommunityEvent } from "@/types/event";
import type { DiscoverGroup } from "@/types/community";
import {
  Bell,
  Calendar,
  ClipboardList,
  Compass,
  FolderOpen,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

interface HomeHubProps {
  user: { id: string; displayName?: string | null } | null;
  myCommunities: Community[];
  followedCommunities: Community[];
  followedGroups: DiscoverGroup[];
  discoverCommunities: Community[];
  discoverServices: DiscoverGroup[];
  upcomingEvents: CommunityEvent[];
  pendingApplications: HomePendingApplication[];
  unreadNotifications: number;
  managedCount: number;
}

export function HomeHub({
  user,
  myCommunities,
  followedCommunities,
  followedGroups,
  discoverCommunities,
  discoverServices,
  upcomingEvents,
  pendingApplications,
  unreadNotifications,
  managedCount,
}: HomeHubProps) {
  if (!user) {
    return (
      <div className="space-y-5">
        <HomeHero variant="guest" />
        <GuestOnboardingHint />
        <HomeValueProps />
        {discoverCommunities.length > 0 && (
          <CommunityCardList
            communities={discoverCommunities.slice(0, 6)}
            title="Communities entdecken"
            subtitle="Organisierte Netzwerke auf UNZE"
          />
        )}
        {discoverServices.length > 0 && (
          <CommunityGroupCardList
            groups={discoverServices.slice(0, 4)}
            title="Services aus Communities"
            subtitle="Coaching, Beratung und Angebote"
            layout="horizontal"
          />
        )}
        <section className="rounded-3xl border border-unze-green/20 bg-unze-green-muted/20 p-4 text-center sm:p-5">
          <p className="text-sm font-medium text-unze-ink">
            Von der Startseite in die App
          </p>
          <p className="mt-1 text-xs text-unze-ink-secondary sm:text-sm">
            Registriere dich oder melde dich an {"\u2014"} dann findest du Communities unter{" "}
            <strong className="font-semibold text-unze-ink">Entdecken</strong>, verwaltest dein
            Netzwerk, sammelst Auszeichnungen und kannst UNZE als App installieren.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/auth/login?mode=signup"
              className="inline-flex rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Jetzt starten
            </Link>
            <Link
              href="/discover"
              className="inline-flex rounded-xl border border-unze-green/40 bg-white px-4 py-2.5 text-sm font-semibold text-unze-green"
            >
              Communities entdecken
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HomeHero variant="member" />

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Link
          href="/discover"
          className="flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
        >
          <Compass className="h-5 w-5 text-unze-green" aria-hidden />
          <span className="text-xs font-semibold text-unze-ink">Discover</span>
        </Link>
        {managedCount > 0 && (
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
          >
            <LayoutDashboard className="h-5 w-5 text-unze-green" aria-hidden />
            <span className="text-xs font-semibold text-unze-ink">Dashboard</span>
          </Link>
        )}
        <Link
          href="/notifications"
          className="relative flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
        >
          <Bell className="h-5 w-5 text-unze-green" aria-hidden />
          <span className="text-xs font-semibold text-unze-ink">Benachrichtigungen</span>
          {unreadNotifications > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>
        <Link
          href="/create/community"
          className="flex flex-col items-center gap-2 rounded-2xl border border-unze-green bg-unze-green-muted/40 px-3 py-4 text-center active:scale-[0.98]"
        >
          <UsersRound className="h-5 w-5 text-unze-green-dark" aria-hidden />
          <span className="text-xs font-semibold text-unze-green-dark">Community</span>
        </Link>
      </section>

      {pendingApplications.length > 0 && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <header className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-unze-green" aria-hidden />
            <h2 className="text-sm font-semibold text-unze-ink">Offene Anträge</h2>
          </header>
          <ul className="space-y-2">
            {pendingApplications.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/community/${app.communitySlug}`}
                  className="flex items-center justify-between rounded-2xl bg-unze-surface-muted/40 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-unze-ink">{app.communityTitle}</span>
                  <span className="text-xs font-semibold text-amber-700">Ausstehend</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {myCommunities.length > 0 && (
        <CommunityCardList
          communities={myCommunities.slice(0, 6)}
          title="Meine Communities"
          subtitle="Mitgliedschaften und Rollen"
        />
      )}

      {followedGroups.length > 0 && (
        <CommunityGroupCardList
          groups={followedGroups.slice(0, 6)}
          title="Meine Gruppen"
          subtitle="Gruppen und Dienstleistungen, denen du folgst"
          layout="horizontal"
        />
      )}

      {upcomingEvents.length > 0 && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-unze-green" aria-hidden />
              <h2 className="text-sm font-semibold text-unze-ink">Meine Events</h2>
            </div>
            <Link href="/discover?tab=events" className="text-xs font-semibold text-unze-green">
              Alle →
            </Link>
          </header>
          <ul className="space-y-2">
            {upcomingEvents.slice(0, 5).map((event) => (
              <li key={event.id}>
                <Link
                  href={event.communitySlug ? `/community/${event.communitySlug}` : "/discover?tab=events"}
                  className="block rounded-2xl bg-unze-surface-muted/40 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-unze-ink">{event.title}</p>
                  <p className="text-xs text-unze-ink-secondary">
                    {event.communityTitle} ·{" "}
                    {new Date(event.startsAt).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {followedCommunities.length > 0 && (
        <CommunityCardList
          communities={followedCommunities.slice(0, 4)}
          title="Gefolgte Communities"
          subtitle="Updates aus deinem Netzwerk"
        />
      )}

      {myCommunities.length === 0 &&
        followedCommunities.length === 0 &&
        pendingApplications.length === 0 && (
          <section className="rounded-3xl bg-white p-8 text-center shadow-card">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-unze-green" aria-hidden />
            <p className="text-sm font-medium text-unze-ink">Dein Verwaltungs-Hub</p>
            <p className="mt-1 text-sm text-unze-ink-secondary">
              Tritt Communities bei oder erstelle deine eigene — Anträge, Gruppen
              und Events erscheinen hier.
            </p>
            <Link
              href="/discover"
              className="mt-4 inline-block text-sm font-semibold text-unze-green"
            >
              Discover öffnen →
            </Link>
          </section>
        )}
    </div>
  );
}
