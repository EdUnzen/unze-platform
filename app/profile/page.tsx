import { SignOutButton } from "@/components/auth/SignOutButton";
import { loadNotifications } from "@/app/notifications/actions";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile, getCurrentUser } from "@/services/auth/auth.service";
import { User } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  const profile = user ? await getCurrentProfile() : null;
  const notifData = user ? await loadNotifications(true) : null;

  const displayName =
    profile?.display_name ?? user?.email?.split("@")[0] ?? "Gast";

  if (!user) {
    return (
      <div className="page-padding">
        <PageHeader
          title="Profil"
          subtitle="Deine Identität und Mitgliedschaften auf UNZE"
        />

        <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-unze-green-muted">
            <User className="h-8 w-8 text-unze-green" aria-hidden />
          </div>
          <p className="text-sm font-medium text-unze-ink">Anmelden erforderlich</p>
          <p className="mt-1 max-w-xs text-center text-sm text-unze-ink-secondary">
            Verwalte Profil, Abos, Benachrichtigungen und Creator-Tools — kostenlos
            registrieren oder anmelden.
          </p>
          <div className="mt-5 flex w-full max-w-xs flex-col gap-2 px-4">
            <Link
              href="/auth/login"
              className="block w-full rounded-xl bg-unze-green py-3 text-center text-sm font-semibold text-white active:scale-[0.98]"
            >
              Anmelden
            </Link>
            <Link
              href="/auth/login?mode=signup"
              className="block w-full rounded-xl border border-unze-border bg-white py-3 text-center text-sm font-semibold text-unze-ink active:scale-[0.98]"
            >
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding">
      <PageHeader title="Profil" subtitle="Deine Identität auf UNZE" />

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <CommunityCoverVisual
          seed={user.id}
          bannerGradient="from-unze-green-light via-unze-green to-unze-green-dark"
          className="h-24"
          overlay="subtle"
        />
        <div className="relative px-4 pb-6">
          <div className="-mt-10 mb-4">
            <UserAvatar
              name={displayName}
              seed={user.id}
              avatarUrl={profile?.avatar_url}
              size="xl"
              className="border-4 border-white shadow-md"
            />
          </div>

          <h2 className="text-lg font-semibold text-unze-ink">{displayName}</h2>
          {profile?.username && (
            <p className="text-sm text-unze-green">@{profile.username}</p>
          )}
          {profile?.bio ? (
            <p className="mt-2 text-sm text-unze-ink-secondary">{profile.bio}</p>
          ) : (
            <p className="mt-2 text-sm text-unze-ink-secondary">
              Optional: Profilbild, Name und Bio in den Einstellungen anpassen.
            </p>
          )}

          {profile?.is_creator && (
            <span className="mt-3 inline-block rounded-full bg-unze-green-muted px-3 py-1 text-xs font-semibold text-unze-green-dark">
              Creator
            </span>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/profile/billing"
              className="block w-full rounded-xl border border-unze-border bg-white py-3 text-center text-sm font-medium text-unze-ink"
            >
              Abos & Zahlungen
            </Link>
            <Link
              href="/profile/settings"
              className="block w-full rounded-xl border border-unze-border bg-white py-3 text-center text-sm font-medium text-unze-ink"
            >
              Profil bearbeiten
            </Link>
            <Link
              href="/notifications"
              className="flex items-center justify-between rounded-xl border border-unze-border bg-white px-4 py-3 text-sm font-medium text-unze-ink"
            >
              <span>Benachrichtigungen</span>
              {notifData && notifData.unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {notifData.unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/verify/creator"
              className="block w-full rounded-xl border border-unze-border bg-white py-3 text-center text-sm font-medium text-unze-ink"
            >
              Verifizierung
            </Link>
            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-unze-green py-3 text-center text-sm font-semibold text-white active:scale-[0.98]"
            >
              Creator Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
