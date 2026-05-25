import { PostComposer } from "@/components/feed/PostComposer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/create/post");

  const communities = await getManagedCommunities(user.id);

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link href="/discover?tab=feed" className="text-sm font-medium text-unze-green">
          ← Feed
        </Link>
      </div>

      <PageHeader
        title="Beitrag erstellen"
        subtitle="Teile Updates mit deiner Community oder dem Netzwerk"
      />

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
        <PostComposer communities={communities} />
      </div>
    </div>
  );
}
