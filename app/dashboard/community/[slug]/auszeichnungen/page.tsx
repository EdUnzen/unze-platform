import { AuszeichnungenPanel } from "@/components/dashboard/AuszeichnungenPanel";
import { CredentialCollectionsPanel } from "@/components/dashboard/CredentialCollectionsPanel";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import { getCredentialCollections } from "@/services/credentials/credential-collection.service";
import { canManageAccess } from "@/lib/permissions/community.permissions";
import { redirect } from "next/navigation";

interface AuszeichnungenPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardAuszeichnungenPage({
  params,
}: AuszeichnungenPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const badges = await getCommunityBadges(community.id);
  const collections = await getCredentialCollections(community.id);
  const canManage = canManageAccess(community.viewerRole);

  return (
    <section className="space-y-6">
      <h2 className="text-base font-semibold text-unze-ink">Auszeichnungen</h2>
      <CredentialCollectionsPanel
        slug={slug}
        collections={collections}
        credentials={badges.map((b) => ({ id: b.id, name: b.name }))}
        canManage={canManage}
      />
      <AuszeichnungenPanel slug={slug} badges={badges} />
    </section>
  );
}
