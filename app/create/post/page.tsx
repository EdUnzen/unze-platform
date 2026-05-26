import { PostComposer, type ComposerCommunity } from "@/components/feed/PostComposer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityGroups } from "@/services/community/group.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/create/post");

  const managed = await getManagedCommunities(user.id);
  const communities: ComposerCommunity[] = await Promise.all(
    managed.map(async (community) => ({
      ...community,
      groups: await getCommunityGroups(community.id),
    })),
  );

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link href="/discover?tab=feed" className="text-sm font-medium text-unze-green">
          ← Feed
        </Link>
      </div>

      <PageHeader
        title="Community-Beitrag erstellen"
        subtitle="Videos, Events, News, Highlights — im Kontext deiner Community oder Gruppe"
      />

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
        {communities.length === 0 ? (
          <p className="text-sm text-unze-ink-secondary">
            Du brauchst Moderations-Rechte in einer Community, um Beiträge zu veröffentlichen.
          </p>
        ) : (
          <PostComposer communities={communities} />
        )}
      </div>
    </div>
  );
}
