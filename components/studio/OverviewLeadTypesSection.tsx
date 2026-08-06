import type { LeadTypeBreakdownRow } from "@/lib/studio/overview-extras";
import { LEAD_STATUS_THEMES } from "@/lib/studio/overview-colors";
import Link from "next/link";

const TYPE_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-amber-500",
];

export function OverviewLeadTypesSection({ rows }: { rows: LeadTypeBreakdownRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  if (total === 0) {
    return (
      <section className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-5 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Lead-Typen</h2>
        <p className="mt-1 text-xs text-gray-500">Noch keine Anfragen nach Typ</p>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${LEAD_STATUS_THEMES.angebot.section}`}>
      <div className={`border-b border-violet-100 px-4 py-3 sm:px-5 ${LEAD_STATUS_THEMES.angebot.header}`}>
        <h2 className="text-sm font-semibold text-gray-900">Lead-Typen</h2>
        <p className="text-xs text-gray-500">{total} Anfragen · offen vs. gesamt</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {rows.map((row, index) => {
          const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
          const barColor = TYPE_COLORS[index % TYPE_COLORS.length];
          return (
            <li key={row.type} className="px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-orange-700">{row.open} offen</span>
                    {" · "}
                    {row.total} gesamt ({pct}%)
                  </p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-gray-100 px-4 py-2 sm:px-5">
        <Link href="/studio/app" className="text-xs font-semibold text-emerald-700 hover:underline">
          Alle Leads →
        </Link>
      </div>
    </section>
  );
}
