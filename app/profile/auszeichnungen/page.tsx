import { ProfileAwardsPanel } from "@/components/profile/ProfileAwardsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getUserAwards } from "@/services/badges/badge.service";
import { redirect } from "next/navigation";

export default async function ProfileAwardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/auszeichnungen");

  const awards = await getUserAwards(user.id);

  return (
    <div className="page-padding pb-8">
      <PageHeader
        title="Auszeichnungen"
        subtitle="Deine Qualifikationen, Zertifikate und Community-Auszeichnungen"
        backHref="/profile"
        backLabel="Profil"
      />
      <ProfileAwardsPanel awards={awards} />
    </div>
  );
}
