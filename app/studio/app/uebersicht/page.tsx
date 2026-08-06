import { OverviewDashboard } from "@/components/studio/OverviewDashboard";
import { getStudioOverview } from "@/lib/studio/overview";

export const dynamic = "force-dynamic";

export default async function StudioUebersichtPage() {
  const data = await getStudioOverview();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
          Übersicht
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Dein Studio-Cockpit — Leads, Angebote, Kunden, Finanzen & Fristen auf einen Blick
        </p>
      </div>

      <div className="mt-8">
        <OverviewDashboard data={data} />
      </div>
    </div>
  );
}
