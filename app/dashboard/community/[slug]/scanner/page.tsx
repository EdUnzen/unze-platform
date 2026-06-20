import { DashboardScannerPanel } from "@/components/dashboard/DashboardScannerPanel";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { redirect } from "next/navigation";

interface ScannerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardScannerPage({ params }: ScannerPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) redirect("/dashboard");

  const canScan =
    hasCommunityPermission(community.viewerRole, "moderate") ||
    hasCommunityPermission(community.viewerRole, "manage_members");

  if (!canScan) {
    redirect(`/dashboard/community/${slug}`);
  }

  return (
    <DashboardScannerPanel
      slug={slug}
      communityId={community.id}
      communityTitle={community.title}
    />
  );
}
