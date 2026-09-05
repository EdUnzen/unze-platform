import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileHelpMenu } from "@/components/onboarding/ProfileHelpMenu";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { resolveProfileCover } from "@/lib/visual/auto-cover";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { ProfileRow } from "@/types/database";
import {
  Award,
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Ticket,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface ProfileStats {
  memberSince: string;
  communityCount: number;
  eventCount: number;
  isVerified: boolean;
  isCreator: boolean;
}

interface ProfileHubProps {
  userId: string;
  email: string | undefined;
  profile: ProfileRow | null;
  unreadCount: number;
  showCreatorHub: boolean;
  awardCount: number;
  stats: ProfileStats;
}

function ProfileMenuRow({
  href,
  icon: Icon,
  label,
  description,
  badge,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[56px] items-center gap-4 px-4 py-3.5 transition-colors active:bg-unze-surface-muted/80"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-unze-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-unze-ink-secondary">{description}</span>
        )}
      </span>
      {badge != null && badge > 0 ? (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-unze-ink-muted" aria-hidden />
    </Link>
  );
}

function formatMemberSince(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function ProfileHub({
  userId,
  email,
  profile,
  unreadCount,
  showCreatorHub,
  awardCount,
  stats,
}: ProfileHubProps) {
  const displayName =
    profile?.display_name ?? email?.split("@")[0] ?? "Mitglied";
  const firstName = displayName.split(/\s+/)[0];
  const profileCover = resolveProfileCover({
    avatarUrl: profile?.avatar_url,
    category: "Allgemein",
    bannerGradient: "from-unze-green-light via-unze-green to-unze-green-dark",
  });

  return (
    <div className="space-y-4 pb-8">
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <CommunityCoverVisual
          seed={userId}
          bannerGradient={profileCover.gradient}
          cover={profileCover}
          className="h-28 sm:h-32"
          overlay="subtle"
        />

        <div className="relative px-5 pb-5 pt-0">
          <div className="-mt-14 mb-3 flex justify-center sm:-mt-16">
            <UserAvatar
              name={displayName}
              seed={userId}
              avatarUrl={profile?.avatar_url}
              size="2xl"
              verifiedRing={profile?.is_verified}
              className="h-[7.5rem] w-[7.5rem] border-[5px] border-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] ring-[3px] ring-unze-green/40 sm:h-[8.25rem] sm:w-[8.25rem]"
            />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-unze-ink sm:text-[1.65rem]">
              {displayName}
            </h1>
            {profile?.username ? (
              <p className="mt-0.5 text-sm font-semibold text-unze-green">@{profile.username}</p>
            ) : null}

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              {stats.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2.5 py-1 text-xs font-semibold text-unze-green-dark">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Verifiziert
                </span>
              )}
              {stats.isCreator && (
                <span className="inline-flex items-center gap-1 rounded-full bg-unze-ink/5 px-2.5 py-1 text-xs font-semibold text-unze-ink">
                  <Sparkles className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                  Creator
                </span>
              )}
            </div>

            {profile?.bio ? (
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
                {profile.bio}
              </p>
            ) : (
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-unze-ink-muted">
                Hallo {firstName} — ergänze Bio und Profilbild in den Einstellungen.
              </p>
            )}
          </div>

          {/* Statistiken direkt unter Profil */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
                Mitglied seit
              </p>
              <p className="mt-0.5 text-sm font-bold text-unze-ink">
                {formatMemberSince(stats.memberSince)}
              </p>
            </div>
            <div className="rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
                Communities
              </p>
              <p className="mt-0.5 text-sm font-bold text-unze-ink">{stats.communityCount}</p>
            </div>
            <div className="rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
                Events
              </p>
              <p className="mt-0.5 text-sm font-bold text-unze-ink">{stats.eventCount}</p>
            </div>
            <div className="rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
                Verifizierung
              </p>
              <p className="mt-0.5 text-sm font-bold text-unze-ink">
                {stats.isVerified ? "Ja" : "Offen"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {showCreatorHub && (
        <Link
          href="/dashboard"
          className="flex min-h-[64px] items-center gap-4 rounded-2xl border border-unze-green/25 bg-gradient-to-br from-unze-green-muted/90 via-white to-white p-4 shadow-card transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-unze-green text-white shadow-sm">
            <LayoutDashboard className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-unze-ink">Creator Dashboard</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">
              Communities, Mitglieder &amp; Einstellungen
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-unze-green" aria-hidden />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Link
          href="/profile/settings"
          className="flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <Settings className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-unze-ink">Profil</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">Name, Bild, Bio</span>
          </span>
        </Link>
        <Link
          href="/profile/tickets"
          className="flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <Ticket className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-unze-ink">Tickets</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">Events &amp; QR</span>
          </span>
        </Link>
        <Link
          href="/profile/id"
          className="flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <QrCode className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-unze-ink">UNZE-ID</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">
              Verifizierung &amp; Zugang
            </span>
          </span>
        </Link>
        <Link
          href="/profile/auszeichnungen"
          className="flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <Award className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-unze-ink">Auszeichnungen</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">
              {awardCount > 0
                ? `${awardCount} erhalten`
                : "Qualifikationen & Historie"}
            </span>
          </span>
        </Link>
        <Link
          href="/profile/billing"
          className="flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <CreditCard className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-unze-ink">Abos</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">Zahlungen</span>
          </span>
        </Link>
      </div>

      <nav
        className="overflow-hidden rounded-2xl bg-white shadow-card divide-y divide-unze-border/70"
        aria-label="Profil-Menü"
      >
        <ProfileMenuRow
          href="/profile/aktivitaet"
          icon={History}
          label="Meine Aktivität"
          description="Historie — Auszeichnungen, Rollen, Beitritte"
        />
        <ProfileMenuRow
          href="/notifications"
          icon={Bell}
          label="Benachrichtigungen"
          description="Hinweise & Einstellungen"
          badge={unreadCount}
        />
        <ProfileMenuRow
          href="/verify/creator"
          icon={BadgeCheck}
          label="Verifizierung"
          description="Creator- oder Expertenstatus"
        />
      </nav>

      <ProfileHelpMenu />

      <div className="pt-1">
        <SignOutButton />
      </div>
    </div>
  );
}
