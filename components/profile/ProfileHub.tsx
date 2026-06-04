import { SignOutButton } from "@/components/auth/SignOutButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { ProfileRow } from "@/types/database";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface ProfileHubProps {
  userId: string;
  email: string | undefined;
  profile: ProfileRow | null;
  unreadCount: number;
  showCreatorHub: boolean;
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
      className="flex items-center gap-4 px-4 py-3.5 transition-colors active:bg-unze-surface-muted/80"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
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

export function ProfileHub({
  userId,
  email,
  profile,
  unreadCount,
  showCreatorHub,
}: ProfileHubProps) {
  const displayName =
    profile?.display_name ?? email?.split("@")[0] ?? "Mitglied";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <div className="space-y-5 pb-8">
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="relative h-28 bg-gradient-to-br from-unze-green-light via-unze-green to-unze-green-dark sm:h-32">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 55%)",
            }}
          />
        </div>

        <div className="relative px-5 pb-6 pt-0">
          <div className="-mt-12 mb-3 flex justify-center sm:-mt-14 sm:mb-4">
            <UserAvatar
              name={displayName}
              seed={userId}
              avatarUrl={profile?.avatar_url}
              size="2xl"
              verifiedRing={profile?.is_verified}
              className="h-[5.5rem] w-[5.5rem] border-[4px] border-white shadow-lg ring-1 ring-black/5 sm:h-24 sm:w-24 sm:border-[5px]"
            />
          </div>

          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-unze-ink-muted">
              Dein Profil
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-unze-ink">
              {displayName}
            </h1>
            {profile?.username ? (
              <p className="mt-0.5 text-sm font-medium text-unze-green">@{profile.username}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2.5 py-1 text-xs font-semibold text-unze-green-dark">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Verifiziert
                </span>
              )}
              {profile?.is_creator && (
                <span className="inline-flex items-center gap-1 rounded-full bg-unze-ink/5 px-2.5 py-1 text-xs font-semibold text-unze-ink">
                  <Sparkles className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                  Creator
                </span>
              )}
            </div>

            {profile?.bio ? (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
                {profile.bio}
              </p>
            ) : (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-unze-ink-muted">
                Hallo {firstName} — ergänze Bio und Profilbild in den Einstellungen.
              </p>
            )}
          </div>
        </div>
      </section>

      {showCreatorHub && (
        <Link
          href="/dashboard"
          className="flex items-center gap-4 rounded-2xl border border-unze-green/25 bg-gradient-to-br from-unze-green-muted/90 via-white to-white p-4 shadow-card transition active:scale-[0.99]"
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

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/profile/settings"
          className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
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
          href="/profile/billing"
          className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-card transition active:scale-[0.98]"
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
          href="/notifications"
          icon={Bell}
          label="Benachrichtigungen"
          description="Aktivität & Updates"
          badge={unreadCount}
        />
        <ProfileMenuRow
          href="/verify/creator"
          icon={BadgeCheck}
          label="Verifizierung"
          description="Creator- oder Expertenstatus"
        />
      </nav>

      <div className="pt-1">
        <SignOutButton />
      </div>
    </div>
  );
}
