import { FileText, Send } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";

const OFFERS: Record<IndustryId, { id: string; customer: string; amount: string; status: string }[]> = {
  reinigung: [
    { id: "AN-2401", customer: "Bürocenter Neuwied", amount: "€ 2.840 / Monat", status: "Versendet" },
    { id: "AN-2402", customer: "Praxis Dr. Klein", amount: "€ 680 / Einsatz", status: "Entwurf" },
    { id: "AN-2403", customer: "Hotel Rheinblick", amount: "€ 4.200 / Monat", status: "Angenommen" },
  ],
  umzug: [
    { id: "AN-0891", customer: "Familie Weber", amount: "€ 1.890", status: "Versendet" },
    { id: "AN-0892", customer: "Start-up Koblenz", amount: "€ 4.650", status: "Entwurf" },
    { id: "AN-0893", customer: "Seniorenresidenz", amount: "€ 8.200", status: "Angenommen" },
  ],
  handwerk: [
    { id: "AN-552", customer: "Neubau Müller", amount: "€ 12.400", status: "Versendet" },
    { id: "AN-553", customer: "Gewerbe Park", amount: "€ 6.780", status: "Entwurf" },
    { id: "AN-554", customer: "Wartung Schmidt", amount: "€ 420", status: "Angenommen" },
  ],
  arztpraxis: [
    { id: "KV-1201", customer: "MVZ Leistungspaket", amount: "€ 2.400 / Monat", status: "Versendet" },
    { id: "KV-1202", customer: "Praxis-IT Wartung", amount: "€ 890 / Monat", status: "Entwurf" },
    { id: "KV-1203", customer: "Recall-Kampagne Q2", amount: "€ 1.450", status: "Angenommen" },
  ],
};

export function OffersPreview({
  compact = false,
  bare = false,
  industry = "umzug",
}: {
  compact?: boolean;
  industry?: IndustryId;
  bare?: boolean;
}) {
  const rows = OFFERS[industry];

  if (compact) {
    return (
      <PreviewShell bare={bare} title="Angebote">
        <div className="space-y-1 p-2">
          {rows.slice(0, 2).map((r) => (
            <div key={r.id} className="rounded-md bg-white p-1.5 ring-1 ring-gray-100">
              <p className="text-[7px] font-semibold">{r.customer}</p>
              <p className="text-[6px] text-gray-400">{r.amount}</p>
            </div>
          ))}
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Angebotsverwaltung">
      <div className="flex h-full flex-col p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold text-gray-900">Angebote</h2>
            <p className="text-[8px] text-gray-400">3 offen · 12 diesen Monat</p>
          </div>
          <button type="button" className="rounded-lg bg-[#00C853] px-2.5 py-1 text-[8px] font-semibold text-white">
            + Angebot
          </button>
        </div>
        <div className="mt-3 flex-1 space-y-2">
          {rows.map((r) => (
            <article
              key={r.id}
              className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-gray-900">{r.customer}</p>
                <p className="text-[7px] text-gray-400">
                  {r.id} · {r.amount}
                </p>
              </div>
              <StatusPill tone={r.status === "Angenommen" ? "green" : r.status === "Entwurf" ? "amber" : "gray"}>
                {r.status}
              </StatusPill>
              <Send className="h-3 w-3 text-gray-300" />
            </article>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}
