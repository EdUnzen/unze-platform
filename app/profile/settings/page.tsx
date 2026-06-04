import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { getDefaultBannerPresetForCategory } from "@/lib/constants/category-banners";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile, getCurrentUser } from "@/services/auth/auth.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/settings");

  const profile = await getCurrentProfile();
  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "Nutzer";

  return (
    <div className="page-padding">
      <PageHeader
        title="Profil bearbeiten"
        subtitle="Optional — Bild, Name & Bio"
      />

      <Link href="/profile" className="mb-4 inline-block text-sm font-medium text-unze-green">
        ← Zurück zum Profil
      </Link>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <CommunityCoverVisual
          seed={user.id}
          bannerGradient="from-unze-green-light via-unze-green to-unze-green-dark"
          fallbackImageUrl={getDefaultBannerPresetForCategory("Allgemein").imageUrl}
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
