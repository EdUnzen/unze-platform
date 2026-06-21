import { loadJoinRequestsData } from "@/app/dashboard/access-actions";
import { JoinRequestsDashboard } from "@/components/dashboard/JoinRequestsDashboard";
import { redirect } from "next/navigation";

interface RequestsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function DashboardRequestsPage({
  params,
  searchParams,
}: RequestsPageProps) {
  const { slug } = await params;
  const { status } = await searchParams;
  const data = await loadJoinRequestsData(slug);

  if (!data) redirect("/dashboard");

  const initialFilter =
    status === "pending" ||
    status === "waitlisted" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "withdrawn"
      ? status
      : "pending";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-unze-ink">
          Beitrittsanträge
        </h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Creator-Approval-Flow: prüfen, annehmen, ablehnen oder Warteliste.
        </p>
      </div>

      <JoinRequestsDashboard
        slug={slug}
        applications={data.applications}
        statusCounts={data.statusCounts}
        canReview={data.canReview}
        initialFilter={initialFilter}
        questions={"questions" in data ? data.questions : []}
      />
    </section>
  );
}
