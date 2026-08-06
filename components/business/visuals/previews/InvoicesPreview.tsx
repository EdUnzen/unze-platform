import { Download, Filter } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";

const ROWS = [
  { nr: "RE-2026-1042", customer: "Müller GmbH", amount: "2.480,00 €", date: "04.03.26", status: "Bezahlt" as const },
  { nr: "RE-2026-1043", customer: "Schmidt & Partner", amount: "890,00 €", date: "03.03.26", status: "Offen" as const },
  { nr: "RE-2026-1044", customer: "Weber Logistik", amount: "1.250,00 €", date: "02.03.26", status: "Offen" as const },
  { nr: "RE-2026-1045", customer: "Bauer Handwerk", amount: "3.120,00 €", date: "01.03.26", status: "Entwurf" as const },
];

export function InvoicesPreview({
  compact = false,
  bare = false,
  industry: _industry = "umzug",
}: {
  compact?: boolean;
  industry?: import("@/lib/constants/business-industry-scenarios").IndustryId;
  bare?: boolean;
}) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Rechnungen">
        <div className="p-2">
          <div className="overflow-hidden rounded-lg ring-1 ring-gray-100">
            {ROWS.slice(0, 3).map((r) => (
              <div
                key={r.nr}
                className="flex items-center justify-between border-t border-gray-50 bg-white px-2 py-1.5 first:border-0"
              >
                <div>
                  <p className="font-mono text-[7px] font-medium text-gray-700">{r.nr}</p>
                  <p className="text-[6px] text-gray-400">{r.customer}</p>
                </div>
                <p className="text-[8px] font-bold text-gray-900">{r.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Rechnungen & Angebote">
      <div className="flex h-full flex-col p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold text-gray-900">Rechnungen</h2>
            <p className="text-[8px] text-gray-400">€ 7.740 offen · 12 bezahlt diesen Monat</p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[7px] font-medium text-gray-600 ring-1 ring-gray-100"
            >
              <Filter className="h-2.5 w-2.5" />
              Filter
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#00C853] px-2.5 py-1 text-[8px] font-semibold text-white"
            >
              + Neue Rechnung
            </button>
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.6fr_0.6fr] gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 text-[7px] font-semibold uppercase tracking-wide text-gray-400">
            <span>Nummer</span>
            <span>Kunde</span>
            <span>Betrag</span>
            <span>Datum</span>
            <span>Status</span>
          </div>
          {ROWS.map((r) => (
            <div
              key={r.nr}
              className="grid grid-cols-[1.2fr_1fr_0.8fr_0.6fr_0.6fr] items-center gap-2 border-b border-gray-50 px-3 py-2.5 text-[8px] hover:bg-gray-50/50"
            >
              <span className="font-mono font-medium text-gray-800">{r.nr}</span>
              <span className="truncate text-gray-600">{r.customer}</span>
              <span className="font-semibold text-gray-900">{r.amount}</span>
              <span className="text-gray-400">{r.date}</span>
              <StatusPill
                tone={
                  r.status === "Bezahlt" ? "green" : r.status === "Offen" ? "amber" : "gray"
                }
              >
                {r.status}
              </StatusPill>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-[7px] text-gray-400">
          <span>4 von 48 Einträgen</span>
          <button type="button" className="inline-flex items-center gap-1 text-[#00C853]">
            <Download className="h-2.5 w-2.5" />
            Export PDF
          </button>
        </div>
      </div>
    </PreviewShell>
  );
}
