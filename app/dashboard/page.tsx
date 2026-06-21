import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardCommunityCard } from "@/components/dashboard/DashboardCommunityCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { Coins, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const communities = await getManagedCommunities(user.id);
  const openTasks = communities.reduce(
    (sum, c) => sum + (c.pendingApplicationCount ?? 0),
    0,
  );

  return (
    <div className="page-padding">
      <DashboardChrome
        managedCommunities={communities}
        attentionCounts={{
          applications: 0,
          reports: 0,
          removals: 0,
          payments: 0,
        }}
        header={
          <DashboardHeader
            title="Creator Dashboard"
            subtitle="Verwalte deine Communities — Menü links öffnen"
            openTaskCount={openTasks}
          />
        }
      >
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/create/community"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-unze-green/40 bg-unze-green-muted/30 py-4 text-sm font-semibold text-unze-green-dark active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Neue Community erstellen
          </Link>
          <Link
            href="/dashboard/crowd-partner"
            className="flex items-center justify-center gap-2 rounded-2xl border border-unze-border bg-white py-4 text-sm font-semibold text-unze-ink shadow-card active:scale-[0.98]"
          >
            <Coins className="h-5 w-5 text-unze-green" aria-hidden />
            Crowd Partner
          </Link>
        </div>

        {communities.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-card">
            <p className="text-sm font-medium text-unze-ink">Noch keine verwalteten Communities</p>
            <p className="mt-2 text-sm text-unze-ink-secondary">
              Erstelle eine Community oder werde Admin/Moderator.
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
      </DashboardChrome>
    </div>
  );
}
