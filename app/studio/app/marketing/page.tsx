import { MarketingShowcasePanel } from "@/components/studio/MarketingShowcasePanel";
import {
  getShowcaseCategories,
  getShowcaseItems,
  getShowcaseStats,
} from "@/lib/marketing/showcase-catalog";
import {
  getShowcaseAssetStatuses,
  getShowcaseCaptureSummary,
} from "@/lib/marketing/showcase-assets.server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function StudioMarketingPage() {
  const categories = getShowcaseCategories();
  const items = getShowcaseItems();
  const stats = getShowcaseStats();
  const assetStatuses = getShowcaseAssetStatuses();
  const captureSummary = getShowcaseCaptureSummary();

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
          Marketing Showcase
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Hier siehst du, welche Screens und Videos vorbereitet sind. Zum Ansehen: unten bei einem Screen
          <strong> Öffnen</strong> — die Werbevideos selbst liegen als Datei auf dem Rechner.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Screens gesamt" value={stats.total} />
        <StatCard label="Bereit" value={stats.ready} accent />
        <StatCard label="Bilder auf Disk" value={captureSummary.totalImageFiles} />
        <StatCard label="Captured Items" value={captureSummary.itemsWithCaptures} />
      </div>

      <div className="mt-8">
        <MarketingShowcasePanel
          categories={categories}
          items={items}
          assetStatuses={assetStatuses}
          captureSummary={captureSummary}
          origin={origin}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        accent ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-emerald-700" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
