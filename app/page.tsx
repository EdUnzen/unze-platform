import { CommunityCardList } from "@/components/community/CommunityCardList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getFeaturedCommunities } from "@/services/community/community.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import {
  Bell,
  Compass,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const user = await getCurrentUser();
  const featured = await getFeaturedCommunities();
  const managed = user ? await getManagedCommunities(user.id) : [];
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return (
    <div className="page-padding">
      <PageHeader
        title="Willkommen bei UNZE"
        subtitle="Entdecke Communities, tritt bei und verwalte dein Creator-Dashboard."
      />

      <section className="mb-6 rounded-3xl bg-gradient-to-br from-unze-green/15 via-white to-emerald-50 p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-unze-green" aria-hidden />
          <h2 className="text-sm font-semibold text-unze-ink">Plattform starten</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            href="/discover"
            data-testid="home-cta-discover"
            className="flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
          >
            <Compass className="h-5 w-5 text-unze-green" aria-hidden />
            <span className="text-xs font-semibold text-unze-ink">Discover</span>
          </Link>

          {user ? (
            <>
              {managed.length > 0 && (
                <Link
                  href="/dashboard"
                  data-testid="home-cta-dashboard"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
                >
                  <LayoutDashboard className="h-5 w-5 text-unze-green" aria-hidden />
                  <span className="text-xs font-semibold text-unze-ink">Dashboard</span>
                </Link>
              )}
              <Link
                href="/notifications"
                data-testid="home-cta-notifications"
                className="relative flex flex-col items-center gap-2 rounded-2xl border border-unze-border bg-white px-3 py-4 text-center active:scale-[0.98]"
              >
                <Bell className="h-5 w-5 text-unze-green" aria-hidden />
                <span className="text-xs font-semibold text-unze-ink">Benachrichtigungen</span>
                {unreadCount > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/create/community"
                data-testid="home-cta-create"
                className="flex flex-col items-center gap-2 rounded-2xl border border-unze-green bg-unze-green-muted/40 px-3 py-4 text-center active:scale-[0.98]"
              >
                <PlusCircle className="h-5 w-5 text-unze-green-dark" aria-hidden />
                <span className="text-xs font-semibold text-unze-green-dark">Community erstellen</span>
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              data-testid="home-cta-login"
              className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-2xl bg-unze-green px-3 py-4 text-center text-white active:scale-[0.98] sm:col-span-3"
            >
              <span className="text-sm font-semibold">Anmelden & Communities beitreten</span>
            </Link>
          )}
        </div>
      </section>

      <CommunityCardList
        communities={featured}
        title="Trending Communities"
        subtitle="Beliebt und aktiv in deinem Netzwerk"
      />

      {featured.length === 0 && (
        <section className="mt-4 rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">Noch keine Communities</p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            Erstelle die erste Community oder entdecke bald neue Creator.
          </p>
          {user && (
            <Link
              href="/create/community"
              className="mt-4 inline-block rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Erste Community erstellen
            </Link>
          )}
        </section>
      )}

      <div className="mt-4 text-center">
        <Link
          href="/discover"
          className="text-sm font-semibold text-unze-green"
          data-testid="home-link-all-communities"
        >
          Alle Communities entdecken →
        </Link>
      </div>
    </div>
  );
}
