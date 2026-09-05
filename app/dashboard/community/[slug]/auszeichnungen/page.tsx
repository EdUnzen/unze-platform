import { AuszeichnungenPanel } from "@/components/dashboard/AuszeichnungenPanel";
import { CredentialCollectionsPanel } from "@/components/dashboard/CredentialCollectionsPanel";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import { getCredentialCollections } from "@/services/credentials/credential-collection.service";
import { loadCommunityPermissionChecks } from "@/services/governance/community-permission-context.service";
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

  const perm = await loadCommunityPermissionChecks(community.id, community.viewerRole);
  const canCreateAwards = perm.has("create_awards");
  const canGrantAwards = perm.has("grant_awards");

  if (!canCreateAwards && !canGrantAwards && !canManageAccess(community.viewerRole)) {
    redirect(`/dashboard/community/${slug}`);
  }

  const badges = await getCommunityBadges(community.id);
  const collections = await getCredentialCollections(community.id);
  const canManageCollections = canManageAccess(community.viewerRole);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-unze-ink">Auszeichnungen</h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Auszeichnungen verwalten und Rechte unter Rollen → Auszeichnungen konfigurieren.
        </p>
      </div>
      <CredentialCollectionsPanel
        slug={slug}
        collections={collections}
        credentials={badges.map((b) => ({ id: b.id, name: b.name }))}
        canManage={canManageCollections}
      />
      <AuszeichnungenPanel
        slug={slug}
        badges={badges}
        canCreateAwards={canCreateAwards}
        canGrantAwards={canGrantAwards}
      />
    </section>
  );
}
