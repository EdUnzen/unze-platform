import { SignOutButton } from "@/components/auth/SignOutButton";
import { loadNotifications } from "@/app/notifications/actions";
import { PageHeader } from "@/components/layout/PageHeader";
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

  return (
    <div className="page-padding">
      <PageHeader title="Profil" subtitle="Deine Identität auf UNZE" />

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="h-24 bg-gradient-to-br from-unze-green-light via-unze-green to-unze-green-dark" />
        <div className="relative px-4 pb-6">
          <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-unze-surface-muted shadow-sm">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-unze-ink-muted" aria-hidden />
            )}
          </div>

          <h2 className="text-lg font-semibold text-unze-ink">{displayName}</h2>
          {profile?.username && (
            <p className="text-sm text-unze-green">@{profile.username}</p>
          )}
          {profile?.bio ? (
            <p className="mt-2 text-sm text-unze-ink-secondary">{profile.bio}</p>
          ) : (
            <p className="mt-2 text-sm text-unze-ink-secondary">
              {user
                ? "Vervollständige dein Profil in den Einstellungen."
                : "Melde dich an, um dein Profil, Badges und Communities zu verwalten."}
            </p>
          )}

          {profile?.is_creator && (
            <span className="mt-3 inline-block rounded-full bg-unze-green-muted px-3 py-1 text-xs font-semibold text-unze-green-dark">
              Creator
            </span>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
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
                  Creator-Verifizierung
                </Link>
                <Link
                  href="/dashboard/verification"
                  className="block w-full rounded-xl border border-unze-border bg-white py-3 text-center text-sm font-medium text-unze-ink"
                >
                  Verifizierungs-Status
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full rounded-xl bg-unze-green py-3 text-center text-sm font-semibold text-white active:scale-[0.98]"
                >
                  Creator Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block w-full rounded-xl bg-unze-green py-3 text-center text-sm font-semibold text-white active:scale-[0.98]"
              >
                Anmelden
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
