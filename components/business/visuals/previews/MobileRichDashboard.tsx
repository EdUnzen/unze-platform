import {
  Bell,
  Calendar,
  Home,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Truck,
  Users,
  Stethoscope,
} from "lucide-react";
import { AreaChart, Sparkline, StatusPill } from "./shared";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { INDUSTRY_META } from "@/lib/constants/business-industry-scenarios";

const KPI: Record<IndustryId, { label: string; val: string; tone: "green" | "amber" | "gray" }[]> = {
  umzug: [
    { label: "Umsatz", val: "€ 48k", tone: "green" },
    { label: "Touren", val: "6", tone: "amber" },
    { label: "Anfragen", val: "23", tone: "green" },
    { label: "Auslastung", val: "91%", tone: "green" },
  ],
  reinigung: [
    { label: "Objekte", val: "84", tone: "green" },
    { label: "Einsätze", val: "12", tone: "amber" },
    { label: "Team", val: "18", tone: "gray" },
    { label: "Umsatz", val: "€ 38k", tone: "green" },
  ],
  handwerk: [
    { label: "Baustellen", val: "9", tone: "green" },
    { label: "Angebote", val: "€ 24k", tone: "amber" },
    { label: "Team", val: "11", tone: "gray" },
    { label: "Umsatz", val: "€ 62k", tone: "green" },
  ],
  arztpraxis: [
    { label: "Termine", val: "34", tone: "green" },
    { label: "Warteliste", val: "8", tone: "amber" },
    { label: "Recall", val: "47", tone: "gray" },
    { label: "Offen", val: "€ 4.8k", tone: "green" },
  ],
};

const CUSTOMERS: Record<IndustryId, string[]> = {
  umzug: ["Weber GmbH", "Müller Umzüge", "Schmidt & Partner"],
  reinigung: ["Office Park Nord", "Hotel Central", "Klinik Süd"],
  handwerk: ["Neubau Weber", "Sanierung Lee", "Büro Müller"],
  arztpraxis: ["Petra Schneider", "Thomas Weber", "Maria Klein"],
};

const EVENTS: Record<IndustryId, string[]> = {
  umzug: ["09:00 Tour Berlin", "14:30 Besichtigung", "16:00 Rückkehr LKW"],
  reinigung: ["07:00 Objekt A", "11:00 Grundreinigung", "15:00 Kontrolle"],
  handwerk: ["08:00 Baustelle", "12:00 Material", "17:00 Abnahme"],
  arztpraxis: ["08:15 Sprechstunde", "10:30 Hausbesuch", "14:00 MVZ Termine"],
};

export function MobileRichDashboard({
  industry = "umzug",
  layout = "mobile",
}: {
  industry?: IndustryId;
  layout?: "mobile" | "tablet";
}) {
  const meta = INDUSTRY_META[industry];
  const kpis = KPI[industry];
  const isTablet = layout === "tablet";

  return (
    <div className="flex h-full min-h-[280px] flex-col bg-[#f4f6f8]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold text-gray-900">{meta.company}</p>
          <p className="truncate text-[7px] text-gray-400">{meta.tagline}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative">
            <Bell className="h-3.5 w-3.5 text-gray-500" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
          </span>
          <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${meta.accent}`} />
        </div>
      </div>

      <div className={`flex-1 overflow-hidden p-2 ${isTablet ? "p-3" : ""}`}>
        <div className={`grid gap-1.5 ${isTablet ? "grid-cols-4" : "grid-cols-2"}`}>
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm"
            >
              <p className="text-[6px] font-medium uppercase tracking-wide text-gray-400">{k.label}</p>
              <p className="mt-0.5 text-[10px] font-bold text-gray-900">{k.val}</p>
              <Sparkline color={k.tone === "green" ? "#00C853" : k.tone === "amber" ? "#f59e0b" : "#94a3b8"} />
            </div>
          ))}
        </div>

        <div className={`mt-2 grid gap-2 ${isTablet ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold text-gray-800">Umsatz 7 Tage</p>
              <StatusPill tone="green">+12%</StatusPill>
            </div>
            <div className={`mt-1.5 ${isTablet ? "h-14" : "h-10"}`}>
              <AreaChart uid={`mobile-${industry}`} />
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
            <p className="text-[8px] font-semibold text-gray-800">Heute im Kalender</p>
            <ul className="mt-1.5 space-y-1">
              {EVENTS[industry].map((e) => (
                <li key={e} className="flex items-center gap-1.5 text-[7px] text-gray-600">
                  <Calendar className="h-2.5 w-2.5 shrink-0 text-[#00C853]" aria-hidden />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-semibold text-gray-800">Kunden & Anfragen</p>
            <MessageCircle className="h-3 w-3 text-[#00C853]" aria-hidden />
          </div>
          <ul className="mt-1.5 space-y-1.5">
            {CUSTOMERS[industry].map((name, i) => (
              <li key={name} className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[7px] font-bold text-gray-600">
                  {name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[7px] font-medium text-gray-800">{name}</p>
                  <p className="text-[6px] text-gray-400">
                    {i === 0 ? "Neue Anfrage · vor 12 Min." : i === 1 ? "Angebot offen" : "Rechnung bezahlt"}
                  </p>
                </div>
                <StatusPill tone={i === 0 ? "amber" : "green"}>
                  {i === 0 ? "Neu" : "OK"}
                </StatusPill>
              </li>
            ))}
          </ul>
        </div>

        {industry === "umzug" ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/80 p-2">
            <MapPin className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[7px] font-semibold text-emerald-900">3 Fahrzeuge unterwegs</p>
              <p className="text-[6px] text-emerald-700">Live-Disposition · 2 Touren offen</p>
            </div>
            <Truck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          </div>
        ) : industry === "arztpraxis" ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50/80 p-2">
            <Stethoscope className="h-3 w-3 shrink-0 text-teal-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[7px] font-semibold text-teal-900">6 freie Termine heute</p>
              <p className="text-[6px] text-teal-700">Online-Buchung · Recall aktiv</p>
            </div>
          </div>
        ) : null}
      </div>

      <nav
        className="flex shrink-0 items-center justify-around border-t border-gray-200 bg-white py-1.5"
        aria-label="App Navigation"
      >
        {[
          { icon: Home, label: "Start", active: true },
          { icon: Users, label: "Kunden" },
          { icon: Calendar, label: "Termine" },
          { icon: MessageCircle, label: "Chat" },
          { icon: MoreHorizontal, label: "Mehr" },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 px-1">
            <Icon
              className={`h-3 w-3 ${active ? "text-[#00C853]" : "text-gray-400"}`}
              strokeWidth={active ? 2.5 : 2}
              aria-hidden
            />
            <span className={`text-[5px] font-medium ${active ? "text-[#00C853]" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
