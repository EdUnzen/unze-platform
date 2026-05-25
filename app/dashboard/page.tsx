import { DashboardCommunityCard } from "@/components/dashboard/DashboardCommunityCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardHubPage() {
  const user = await getCurrentUser();
  const communities = user ? await getManagedCommunities(user.id) : [];

  return (
    <div className="page-padding">
      <PageHeader
        title="Creator Dashboard"
        subtitle="Verwalte deine Communities, Mitglieder und Einstellungen"
      />

      <Link
        href="/create/community"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-unze-green/40 bg-unze-green-muted/30 py-4 text-sm font-semibold text-unze-green-dark active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" aria-hidden />
        Neue Community erstellen
      </Link>

      {communities.length === 0 ? (
        <div className="rounded-3xl bg-white py-16 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">
            Noch keine verwalteten Communities
          </p>
          <p className="mt-2 text-sm text-unze-ink-secondary">
            Erstelle eine Community oder werde Admin/Moderator, um das Dashboard zu
            nutzen.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-block text-sm font-medium text-unze-green"
          >
            Discover erkunden
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {communities.map((community, i) => (
            <li key={community.id}>
              <DashboardCommunityCard community={community} priority={i < 2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
