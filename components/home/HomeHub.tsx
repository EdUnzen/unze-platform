import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
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
  upcomingEvents,
  pendingApplications,
  unreadNotifications,
  managedCount,
}: HomeHubProps) {
  if (!user) {
    return (
      <>
        <section className="mb-6 rounded-3xl bg-gradient-to-br from-unze-green/15 via-white to-emerald-50 p-4 shadow-card">
          <h2 className="mb-2 text-sm font-semibold text-unze-ink">
            UNZE — Communities organisieren & monetarisieren
          </h2>
          <p className="mb-4 text-sm text-unze-ink-secondary">
            Verwalte Communities, Gruppen, Events und Anträge — Kommunikation
            bleibt auf Discord, WhatsApp, Telegram & Co.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
          >
            Anmelden
          </Link>
        </section>
        <CommunityCardList
          communities={followedCommunities.slice(0, 6)}
          title="Entdecken"
          subtitle="Communities im Netzwerk"
        />
        <div className="mt-4 text-center">
          <Link href="/discover" className="text-sm font-semibold text-unze-green">
            Discover öffnen →
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl shadow-card">
        <div className="relative h-36 sm:h-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-emerald-900/20" />
          <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200/90">
              Dein Netzwerk auf UNZE
            </p>
            <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
              Communities, Gruppen & Events — alles an einem Ort
            </h2>
            <p className="mt-1 max-w-md text-xs text-white/85 sm:text-sm">
              Organisiere, verifiziere und monetarisiere dein Netzwerk an einem Ort.
            </p>
            <Link
              href="/discover"
              className="mt-3 inline-flex w-fit rounded-xl bg-unze-green px-4 py-2 text-xs font-semibold text-white shadow-lg active:scale-[0.98] sm:text-sm"
            >
              Discover öffnen
            </Link>
          </div>
        </div>
      </section>

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
