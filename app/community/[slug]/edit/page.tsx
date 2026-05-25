import { CommunityGroupManager } from "@/components/community/CommunityGroupManager";
import { EditCommunityClient } from "@/components/community/EditCommunityClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityBySlug } from "@/services/community/community.service";
import { getCommunityGroups } from "@/services/community/group.service";
import { canEditCommunity } from "@/services/community/member.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface EditCommunityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCommunityPage({ params }: EditCommunityPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/community/${slug}/edit`);

  const community = await getCommunityBySlug(slug);
  if (!community || community.id.startsWith("mock")) notFound();

  if (!canEditCommunity(community.membership?.role ?? null)) {
    redirect(`/community/${slug}`);
  }

  const groups = await getCommunityGroups(community.id);

  return (
    <div className="page-padding">
      <Link
        href={`/community/${slug}`}
        className="mb-4 inline-flex text-sm font-medium text-unze-green"
      >
        ← Zurück zur Community
      </Link>

      <PageHeader title="Community bearbeiten" subtitle={community.title} />

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
        <EditCommunityClient community={community} />
      </div>

      <CommunityGroupManager
        communityId={community.id}
        slug={slug}
        groups={groups}
      />
    </div>
  );
}
