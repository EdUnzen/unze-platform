import { AuditLogPanel } from "@/components/dashboard/AuditLogPanel";
import { loadAuditLogData } from "@/app/dashboard/governance-actions";

interface AuditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { slug } = await params;
  const data = await loadAuditLogData(slug);

  if (!data) {
    return (
      <p className="text-sm text-unze-ink-muted">Keine Berechtigung für Audit-Log.</p>
    );
  }

  return <AuditLogPanel entries={data.entries} />;
}
