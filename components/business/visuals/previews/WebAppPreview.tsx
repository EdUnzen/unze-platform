import {
  Bell,
  FolderOpen,
  LayoutGrid,
  MessageSquare,
  Settings,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import { PreviewShell } from "./shared";
import type { MockLayout } from "@/lib/constants/business-mock-types";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { INDUSTRY_META } from "@/lib/constants/business-industry-scenarios";

const SIDEBAR = [
  { icon: LayoutGrid, label: "Übersicht", active: true },
  { icon: Users, label: "Kunden" },
  { icon: FolderOpen, label: "Projekte" },
  { icon: MessageSquare, label: "Nachrichten" },
  { icon: Settings, label: "Admin" },
];

export function WebAppPreview({
  compact = false,
  bare = false,
  industry = "umzug",
  layout = "desktop",
}: {
  compact?: boolean;
  industry?: IndustryId;
  layout?: MockLayout;
  bare?: boolean;
}) {
  const portalTitle =
    industry === "arztpraxis"
      ? "Patientenportal"
      : industry === "reinigung"
        ? "Objektverwaltung"
        : "Kundenportal";

  if (layout === "mobile" || layout === "tablet") {
    return <MobilePortalPreview industry={industry} title={portalTitle} />;
  }

  const stats =
    industry === "arztpraxis"
      ? [
          { label: "Termine heute", val: "47", bg: "from-emerald-50 to-green-50", ring: "ring-emerald-100", text: "text-emerald-900" },
          { label: "Online gebucht", val: "31", bg: "from-indigo-50 to-blue-50", ring: "ring-indigo-100", text: "text-indigo-900" },
          { label: "Warteliste", val: "6", bg: "from-amber-50 to-orange-50", ring: "ring-amber-100", text: "text-amber-900" },
          { label: "Nachrichten", val: "12", bg: "from-violet-50 to-purple-50", ring: "ring-violet-100", text: "text-violet-900" },
        ]
      : industry === "reinigung"
        ? [
            { label: "Objekte aktiv", val: "180", bg: "from-emerald-50 to-green-50", ring: "ring-emerald-100", text: "text-emerald-900" },
            { label: "Einsätze heute", val: "24", bg: "from-indigo-50 to-blue-50", ring: "ring-indigo-100", text: "text-indigo-900" },
            { label: "Offene Mängel", val: "3", bg: "from-amber-50 to-orange-50", ring: "ring-amber-100", text: "text-amber-900" },
            { label: "Teams", val: "18", bg: "from-violet-50 to-purple-50", ring: "ring-violet-100", text: "text-violet-900" },
          ]
        : [
            { label: "Aktive Aufträge", val: "24", bg: "from-indigo-50 to-blue-50", ring: "ring-indigo-100", text: "text-indigo-900" },
            { label: "Neue Anfragen", val: "8", bg: "from-emerald-50 to-green-50", ring: "ring-emerald-100", text: "text-emerald-900" },
            { label: "Dokumente", val: "156", bg: "from-amber-50 to-orange-50", ring: "ring-amber-100", text: "text-amber-900" },
            { label: "Team", val: "12", bg: "from-violet-50 to-purple-50", ring: "ring-violet-100", text: "text-violet-900" },
          ];
  if (compact) {
    return (
      <PreviewShell bare={bare} title="portal.app">
        <div className="flex h-full">
          <div className="w-7 shrink-0 border-r border-gray-100 bg-slate-900 py-2">
            {SIDEBAR.slice(0, 3).map(({ icon: Icon, label, active }) => (
              <div key={label} className="flex justify-center py-1">
                <Icon className={`h-2.5 w-2.5 ${active ? "text-[#00C853]" : "text-slate-500"}`} />
              </div>
            ))}
          </div>
          <div className="flex-1 p-2">
            <p className="text-[8px] font-bold text-gray-900">Kundenportal</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              <div className="rounded-md bg-indigo-50 p-1.5 ring-1 ring-indigo-100">
                <p className="text-[9px] font-bold text-indigo-900">24</p>
                <p className="text-[6px] text-indigo-600">Aufträge</p>
              </div>
              <div className="rounded-md bg-emerald-50 p-1.5 ring-1 ring-emerald-100">
                <p className="text-[9px] font-bold text-emerald-900">8</p>
                <p className="text-[6px] text-emerald-600">Neu</p>
              </div>
            </div>
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="portal.nordwerk.app">
      <div className="flex h-full">
        <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-slate-800 bg-slate-900 py-3 md:w-14">
          <div className="mb-3 h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
          {SIDEBAR.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              title={label}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                active ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-[#00C853]" : "text-slate-400"}`} />
            </div>
          ))}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
          <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
            <div>
              <p className="text-[8px] text-gray-400">Willkommen zurück</p>
              <h2 className="text-[11px] font-bold text-gray-900">{portalTitle}</h2>
            </div>
            <Bell className="h-3.5 w-3.5 text-gray-400" />
          </header>

          <div className="flex-1 overflow-hidden p-3 md:p-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {stats.map((k) => (
                <div
                  key={k.label}
                  className={`rounded-xl bg-gradient-to-br ${k.bg} p-2.5 ring-1 ${k.ring}`}
                >
                  <p className={`font-[family-name:var(--font-display)] text-[13px] font-bold ${k.text}`}>
                    {k.val}
                  </p>
                  <p className="mt-0.5 text-[7px] font-medium text-gray-500">{k.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[9px] font-semibold text-gray-800">Letzte Aktivitäten</p>
                <ul className="mt-2 space-y-2">
                  {[
                    ["Auftrag #4821 freigegeben", "indigo"],
                    ["Dokument hochgeladen", "emerald"],
                    ["Nachricht von Support", "violet"],
                  ].map(([t, color]) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full bg-${color}-500`} style={{
                        backgroundColor: color === "indigo" ? "#6366f1" : color === "emerald" ? "#10b981" : "#8b5cf6"
                      }} />
                      <span className="text-[8px] text-gray-600">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[9px] font-semibold text-gray-800">Projektfortschritt</p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "Website Relaunch", pct: 78 },
                    { name: "CRM Integration", pct: 45 },
                  ].map((p) => (
                    <div key={p.name}>
                      <div className="flex justify-between text-[7px]">
                        <span className="font-medium text-gray-700">{p.name}</span>
                        <span className="text-gray-400">{p.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00C853] to-emerald-400"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PreviewShell>
  );
}

function MobilePortalPreview({ industry, title }: { industry: IndustryId; title: string }) {
  const meta = INDUSTRY_META[industry];
  const stats =
    industry === "arztpraxis"
      ? [
          { label: "Termine", val: "3" },
          { label: "Nachrichten", val: "2" },
        ]
      : industry === "reinigung"
        ? [
            { label: "Objekte", val: "12" },
            { label: "Einsätze", val: "4" },
          ]
        : [
            { label: "Aufträge", val: "5" },
            { label: "Dokumente", val: "8" },
          ];

  return (
    <div className="flex h-full min-h-[280px] flex-col bg-[#f4f6f8]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5">
        <div>
          <p className="text-[9px] font-bold text-gray-900">{title}</p>
          <p className="text-[7px] text-gray-400">{meta.company}</p>
        </div>
        <Bell className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden p-3">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
              <p className="text-[14px] font-bold text-gray-900">{s.val}</p>
              <p className="text-[8px] font-medium text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-800">Schnellzugriff</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[LayoutGrid, FileText, Calendar, MessageSquare].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 py-2">
                <Icon className="h-3.5 w-3.5 text-[#00C853]" aria-hidden />
                <span className="text-[6px] text-gray-500">{["Home", "Docs", "Termine", "Chat"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-800">Letzte Aktivität</p>
          <ul className="mt-2 space-y-2">
            {[
              industry === "arztpraxis" ? "Termin bestätigt — 16:30" : "Auftrag #4821 — In Bearbeitung",
              industry === "reinigung" ? "Einsatz abgeschlossen — Objekt Nord" : "Dokument bereit zum Download",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2 text-[8px] text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C853]" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <nav className="flex shrink-0 justify-around border-t border-gray-200 bg-white py-2">
        {[LayoutGrid, Users, FolderOpen, Settings].map((Icon, i) => (
          <Icon
            key={i}
            className={`h-4 w-4 ${i === 0 ? "text-[#00C853]" : "text-gray-400"}`}
            aria-hidden
          />
        ))}
      </nav>
    </div>
  );
}
