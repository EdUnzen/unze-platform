import { ModerationPanel } from "@/components/dashboard/ModerationPanel";
import { loadModerationData } from "@/app/dashboard/governance-actions";

interface ModerationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModerationPage({ params }: ModerationPageProps) {
  const { slug } = await params;
  const data = await loadModerationData(slug);

  if (!data) {
    return (
      <p className="text-sm text-unze-ink-muted">Keine Berechtigung für Moderation.</p>
    );
  }

  return (
    <ModerationPanel
      slug={slug}
      reports={data.reports}
      history={data.history}
    />
  );
}
