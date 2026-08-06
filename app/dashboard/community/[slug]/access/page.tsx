import { AccessSettingsPanel } from "@/components/dashboard/AccessSettingsPanel";
import { RequirementRulesPanel } from "@/components/dashboard/RequirementRulesPanel";
import { InviteLinkManager } from "@/components/dashboard/InviteLinkManager";
import { loadAccessDashboardData } from "@/app/dashboard/access-actions";
import { loadRequirementDashboardData } from "@/app/dashboard/requirement-actions";
import Link from "next/link";
import { redirect } from "next/navigation";

interface AccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string }>;
}

export default async function DashboardAccessPage({
  params,
  searchParams,
}: AccessPageProps) {
  const { slug } = await params;
  const { welcome } = await searchParams;
  const [data, requirementData] = await Promise.all([
    loadAccessDashboardData(slug),
    loadRequirementDashboardData(slug),
  ]);

  if (!data) redirect("/dashboard");

  return (
    <section className="space-y-6">
      {welcome === "1" && (
        <div className="rounded-2xl border border-unze-green/30 bg-unze-green-muted/30 p-4">
          <p className="text-sm font-semibold text-unze-green-dark">
            Community erstellt — als Nächstes Zugang konfigurieren
          </p>
          <p className="mt-1 text-xs text-unze-ink-secondary">
            Wähle offen, privat oder geschlossen, setze Mitgliederlimit und
            Warteliste, und lege Beitrittsfragen fest.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-unze-ink">
          Zugang & Governance
        </h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Community-Typ, Einladungslinks, Beitrittslogik und Beitrittsfragen.
        </p>
        <Link
          href={`/dashboard/community/${slug}/requests`}
          className="mt-2 inline-block text-sm font-medium text-unze-green"
        >
          Beitrittsanträge verwalten →
        </Link>
      </div>

      <AccessSettingsPanel
        slug={slug}
        config={data.config}
        questions={data.questions}
        canManage={data.canManage}
      />

      {requirementData && (
        <RequirementRulesPanel
          slug={slug}
          resources={requirementData.resources}
          sets={requirementData.sets}
          credentials={requirementData.credentials.map((c) => ({
            id: c.id,
            label: c.name,
          }))}
          collections={requirementData.collections.map((c) => ({
            id: c.id,
            label: c.name,
          }))}
          events={requirementData.resources
            .filter((r) => r.type === "event")
            .map((r) => ({ id: r.id, label: r.label.replace(/^Event: /, "") }))}
          canManage={requirementData.canManage}
        />
      )}

      <InviteLinkManager
        slug={slug}
        links={data.inviteLinks}
        canManage={data.canManageInvites}
      />
    </section>
  );
}
