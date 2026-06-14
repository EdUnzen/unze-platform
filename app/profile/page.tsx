import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileHub } from "@/components/profile/ProfileHub";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile, getCurrentUser } from "@/services/auth/auth.service";
import { getUserEventTickets } from "@/services/events/event-ticket.service";
import { getMyMemberCommunities } from "@/services/home/home.service";
import { getPlatformShellContext } from "@/services/shell/platform-shell.service";
import Link from "next/link";

export default async function ProfilePage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  const shell = user ? await getPlatformShellContext() : null;
  const profile = user ? await getCurrentProfile() : null;

  const [memberCommunities, eventTicketResult] = user
    ? await Promise.all([
        getMyMemberCommunities(user.id),
        getUserEventTickets(user.id),
      ])
    : [[], { tickets: [] as Awaited<ReturnType<typeof getUserEventTickets>>["tickets"] }];

  const showCreatorHub =
    Boolean(user) &&
    (Boolean(profile?.is_creator) || Boolean(shell?.showDashboard));

  if (!user) {
    return (
      <div className="page-padding pb-8">
        <PageHeader
          title="Profil"
          subtitle="Deine Identität und Mitgliedschaften auf UNZE"
        />

        <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 shadow-card">
          <UserAvatar
            name="Gast"
            seed="guest"
            size="2xl"
            className="mb-5 border-4 border-white shadow-md"
          />
          <p className="text-base font-semibold text-unze-ink">Willkommen bei UNZE</p>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-unze-ink-secondary">
            Melde dich an, um dein Profil, Abos und Creator-Tools zu nutzen.
          </p>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
            <Link
              href="/auth/login"
              className="block w-full rounded-xl bg-unze-green py-3.5 text-center text-sm font-semibold text-white active:scale-[0.98]"
            >
              Anmelden
            </Link>
            <Link
              href="/auth/login?mode=signup"
              className="block w-full rounded-xl border border-unze-border bg-unze-surface-muted py-3.5 text-center text-sm font-semibold text-unze-ink active:scale-[0.98]"
            >
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding pb-4">
      <ProfileHub
        userId={user.id}
        email={user.email}
        profile={profile}
        unreadCount={shell?.unreadCount ?? 0}
        showCreatorHub={showCreatorHub}
        stats={{
          memberSince: profile?.created_at ?? new Date().toISOString(),
          communityCount: memberCommunities.length,
          eventCount: eventTicketResult.tickets.length,
          isVerified: Boolean(profile?.is_verified),
          isCreator: Boolean(profile?.is_creator),
        }}
      />
    </div>
  );
}
