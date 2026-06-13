import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { resolveAutoCover } from "@/lib/visual/auto-cover";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile, getCurrentUser } from "@/services/auth/auth.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/settings");

  const profile = await getCurrentProfile();
  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "Nutzer";

  const profileCover = resolveAutoCover({
    category: "Allgemein",
    bannerGradient: "from-unze-green-light via-unze-green to-unze-green-dark",
  });

  return (
    <div className="page-padding">
      <PageHeader
        title="Profil bearbeiten"
        subtitle="Name, Bild & Bio"
      />

      <Link href="/profile" className="mb-4 inline-block text-sm font-medium text-unze-green">
        ← Zurück zum Profil
      </Link>

      <Link
        href="/notifications"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-unze-border/80 bg-white p-4 shadow-card"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green">
          <Bell className="h-5 w-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold text-unze-ink">
            Benachrichtigungen & Aktivität
          </span>
          <span className="text-xs text-unze-ink-secondary">
            Community-Updates und Systemhinweise — keine Handy-Pushs
          </span>
        </span>
      </Link>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <CommunityCoverVisual
          seed={user.id}
          bannerGradient={profileCover.gradient}
          cover={profileCover}
          className="h-20"
          overlay="subtle"
        />
        <div className="p-5 pt-8">
          <ProfileSettingsForm
            userId={user.id}
            displayName={displayName}
            bio={profile?.bio ?? ""}
            avatarUrl={profile?.avatar_url}
          />
        </div>
      </div>
    </div>
  );
}
