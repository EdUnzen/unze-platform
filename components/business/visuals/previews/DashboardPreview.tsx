import {
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";
import { PreviewShell, AreaChart, Sparkline, StatusPill } from "./shared";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { INDUSTRY_META } from "@/lib/constants/business-industry-scenarios";
import { MobileRichDashboard } from "./MobileRichDashboard";
import type { MockLayout } from "@/components/business/visuals/MockScreen";

type Kpi = { label: string; val: string; delta: string; up: boolean; icon: string };

const KPI_BY_INDUSTRY: Record<IndustryId, Kpi[]> = {
  umzug: [
    { label: "Umsatz MTD", val: "€ 48.240", delta: "+12%", up: true, icon: "€" },
    { label: "Neue Anfragen", val: "23", delta: "+5 heute", up: true, icon: "!" },
    { label: "Touren heute", val: "6", delta: "3 LKW aktiv", up: true, icon: "↗" },
    { label: "Pipeline", val: "€ 18.400", delta: "7 Angebote", up: false, icon: "○" },
  ],
  reinigung: [
    { label: "Objekte aktiv", val: "84", delta: "+3 neu", up: true, icon: "◎" },
    { label: "Einsätze heute", val: "12", delta: "2 offen", up: false, icon: "!" },
    { label: "Umsatz MTD", val: "€ 38.200", delta: "+9%", up: true, icon: "€" },
    { label: "Team-Auslastung", val: "91%", delta: "18 MA", up: true, icon: "↗" },
  ],
  handwerk: [
    { label: "Baustellen aktiv", val: "9", delta: "3 heute", up: true, icon: "◎" },
    { label: "Offene Angebote", val: "€ 24.600", delta: "4 pending", up: false, icon: "!" },
    { label: "Umsatz MTD", val: "€ 62.100", delta: "+7%", up: true, icon: "€" },
    { label: "Team", val: "11", delta: "82% Auslastung", up: true, icon: "↗" },
  ],
  arztpraxis: [
    { label: "Termine heute", val: "34", delta: "6 frei", up: true, icon: "◎" },
    { label: "Warteliste", val: "8", delta: "Ø 12 Min.", up: false, icon: "!" },
    { label: "Abrechnung offen", val: "€ 4.820", delta: "12 Fälle", up: false, icon: "€" },
    { label: "Recall fällig", val: "47", delta: " diese Woche", up: true, icon: "↗" },
  ],
};

const TODAY_ITEMS: Record<IndustryId, { time: string; title: string; meta: string; tone: "green" | "amber" | "gray" }[]> = {
  umzug: [
    { time: "08:00", title: "Tour #104 — Koblenz → Neuwied", meta: "LKW 2 · Team Müller", tone: "green" },
    { time: "11:30", title: "Besichtigung Weber GmbH", meta: "Angebot AN-089", tone: "amber" },
    { time: "14:00", title: "Beladung Lager Mainz", meta: "3. Etage · Aufzug", tone: "gray" },
    { time: "16:30", title: "Rückkehr & Übergabe", meta: "Tour #103 abschließen", tone: "green" },
  ],
  reinigung: [
    { time: "06:30", title: "Bürocenter Neuwied — Grundreinigung", meta: "Team A · 420 m²", tone: "green" },
    { time: "09:00", title: "Praxis Dr. Klein — Unterhaltsreinigung", meta: "Team B", tone: "green" },
    { time: "13:00", title: "Hotel Rheinblick — Check Qualität", meta: "Objektleitung", tone: "amber" },
    { time: "17:00", title: "Hausmeister — Störungsmeldung Heizung", meta: "Objekt Park Süd", tone: "amber" },
  ],
  handwerk: [
    { time: "07:30", title: "Baustelle Neubau Müller", meta: "Fliesen · EG", tone: "green" },
    { time: "12:00", title: "Material-Lieferung", meta: "Sanitär Paket S", tone: "gray" },
    { time: "15:00", title: "Abnahme Gewerbe Park", meta: "Protokoll & Fotos", tone: "amber" },
  ],
  arztpraxis: [
    { time: "08:15", title: "Dr. Hartmann — Sprechstunde", meta: "Raum 2 · 12 Termine", tone: "green" },
    { time: "10:30", title: "Dr. Lehmann — Hausbesuch", meta: "Patient Weber", tone: "amber" },
    { time: "14:00", title: "MVZ — Ultraschall", meta: "Raum 4 · 6 Termine", tone: "green" },
    { time: "16:45", title: "Recall-Telefonate", meta: "47 Patienten", tone: "gray" },
  ],
};

const ACTIVITIES: Record<IndustryId, [string, string][]> = {
  umzug: [
    ["Angebot AN-092 angenommen — Familie Weber", "vor 18 Min."],
    ["Neue Anfrage: Firmenumzug Mainz", "vor 42 Min."],
    ["Rechnung RE-1042 bezahlt", "vor 2 Std."],
  ],
  reinigung: [
    ["Qualitätsprotokoll Objekt Nord hochgeladen", "vor 25 Min."],
    ["Vertrag Hotel Rheinblick verlängert", "gestern"],
    ["Einsatz Team C abgeschlossen", "gestern"],
  ],
  handwerk: [
    ["Angebot AN-044 versendet — Sanierung Lee", "vor 1 Std."],
    ["Baustellenfoto „Abnahme“ hinzugefügt", "gestern"],
    ["Materialbestellung bestätigt", "Mo"],
  ],
  arztpraxis: [
    ["Online-Termin gebucht — Patient Schneider", "vor 8 Min."],
    ["Befund PDF archiviert — Patient Klein", "vor 35 Min."],
    ["Abrechnungsexport an Dienstleister", "heute 09:12"],
  ],
};

function navForIndustry(industry: IndustryId): {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
}[] {
  const base = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Users, label: industry === "arztpraxis" ? "Patienten" : "Kunden", active: false },
  ];
  if (industry === "umzug") {
    return [
      ...base,
      { icon: FileText, label: "Angebote", active: false },
      { icon: Truck, label: "Disposition", active: false },
      { icon: Calendar, label: "Kalender", active: false },
      { icon: Settings, label: "Mehr", active: false },
    ];
  }
  if (industry === "reinigung") {
    return [
      ...base,
      { icon: Building2, label: "Objekte", active: false },
      { icon: Calendar, label: "Einsätze", active: false },
      { icon: ClipboardList, label: "Qualität", active: false },
      { icon: Settings, label: "Mehr", active: false },
    ];
  }
  if (industry === "arztpraxis") {
    return [
      ...base,
      { icon: Calendar, label: "Termine", active: false },
      { icon: Stethoscope, label: "Behandler", active: false },
      { icon: FileText, label: "Abrechnung", active: false },
      { icon: Settings, label: "Mehr", active: false },
    ];
  }
  return [
    ...base,
    { icon: FileText, label: "Angebote", active: false },
    { icon: Calendar, label: "Kalender", active: false },
    { icon: ClipboardList, label: "Baustellen", active: false },
    { icon: Settings, label: "Mehr", active: false },
  ];
}

export function DashboardPreview({
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
  const meta = INDUSTRY_META[industry];
  const kpis = KPI_BY_INDUSTRY[industry];
  const NAV = navForIndustry(industry);

  if (compact && (layout === "mobile" || layout === "tablet")) {
    return <MobileRichDashboard industry={industry} layout={layout} />;
  }

  return (
    <PreviewShell bare={bare} title={`${meta.company} — Business Core`}>
      <div className="flex h-full">
        <aside className="flex w-[76px] shrink-0 flex-col border-r border-gray-200/80 bg-white py-3 md:w-[92px]">
          <div className="mb-3 flex justify-center px-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-[10px] font-bold text-white shadow-md`}
            >
              {meta.company.charAt(0)}
            </div>
          </div>
          {NAV.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`mx-1.5 mb-0.5 flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 ${
                active ? "bg-[#00C853]/12 ring-1 ring-[#00C853]/20" : "hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${active ? "text-[#00C853]" : "text-gray-400"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`max-w-[64px] truncate text-center text-[6px] font-semibold leading-tight ${
                  active ? "text-[#00C853]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#f4f6f9]">
          <div
            className={`flex items-center justify-between bg-gradient-to-r ${meta.accent} px-4 py-2.5 text-white`}
          >
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold">{meta.company}</p>
              <p className="truncate text-[7px] text-white/75">{meta.tagline}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 backdrop-blur-sm sm:flex">
                <Search className="h-3 w-3 text-white/80" />
                <span className="text-[7px] text-white/70">Suchen…</span>
              </div>
              <Bell className="h-3.5 w-3.5 text-white/90" />
              <div className="h-6 w-6 rounded-full bg-white/25 ring-2 ring-white/30" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-3 md:p-3.5">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-[12px] font-bold text-gray-900">
                  Guten Morgen — Übersicht
                </h2>
                <p className="text-[7px] text-gray-500">Aktualisiert vor 2 Min. · Demo-Ansicht</p>
              </div>
              <StatusPill tone="green">Live</StatusPill>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 md:grid-cols-4">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[6px] font-semibold uppercase tracking-wide text-gray-400">
                      {k.label}
                    </p>
                    <span className="text-[8px] text-gray-300">{k.icon}</span>
                  </div>
                  <p className="mt-0.5 font-[family-name:var(--font-display)] text-[11px] font-bold text-gray-900">
                    {k.val}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span
                      className={`text-[6px] font-semibold ${
                        k.up ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {k.delta}
                    </span>
                    <Sparkline color={k.up ? "#00C853" : "#f59e0b"} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid gap-2 md:grid-cols-5">
              <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm md:col-span-3">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-semibold text-gray-800">
                    {industry === "arztpraxis" ? "Termin- & Umsatzverlauf" : "Umsatzentwicklung"}
                  </p>
                  <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[6px] text-gray-500">
                    12 Monate
                  </span>
                </div>
                <div className="mt-1.5 h-[72px]">
                  <AreaChart uid={`dash-${industry}`} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm md:col-span-2">
                <p className="text-[8px] font-semibold text-gray-800">Letzte Aktivitäten</p>
                <ul className="mt-1.5 space-y-1.5">
                  {ACTIVITIES[industry].map(([t, time]) => (
                    <li key={t} className="flex items-start justify-between gap-1 border-b border-gray-50 pb-1 last:border-0">
                      <span className="text-[6px] leading-snug text-gray-600">{t}</span>
                      <span className="shrink-0 text-[5px] text-gray-400">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-semibold text-gray-800">
                  {industry === "umzug"
                    ? "Heute in der Disposition"
                    : industry === "reinigung"
                      ? "Heutige Einsätze"
                      : industry === "arztpraxis"
                        ? "Termine heute"
                        : "Baustellen heute"}
                </p>
                <span className="text-[6px] font-medium text-[#00C853]">Alle anzeigen →</span>
              </div>
              <div className="mt-1.5 space-y-1">
                {TODAY_ITEMS[industry].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-2 rounded-lg bg-gray-50/80 px-2 py-1.5"
                  >
                    <span className="w-8 shrink-0 text-[6px] font-bold tabular-nums text-gray-500">
                      {item.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[7px] font-semibold text-gray-800">{item.title}</p>
                      <p className="truncate text-[6px] text-gray-400">{item.meta}</p>
                    </div>
                    <StatusPill tone={item.tone}>{item.tone === "green" ? "OK" : item.tone === "amber" ? "Offen" : "Plan"}</StatusPill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PreviewShell>
  );
}
