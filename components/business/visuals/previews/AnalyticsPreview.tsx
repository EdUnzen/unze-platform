import { BarChart3, Calendar, PieChart, TrendingUp } from "lucide-react";
import { PreviewShell, AreaChart } from "./shared";

export function AnalyticsPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Analytics">
        <div className="space-y-2 p-2">
          <div className="grid grid-cols-2 gap-1.5">
            {["Umsatz", "Auslastung"].map((label) => (
              <div key={label} className="rounded-md bg-gradient-to-br from-emerald-50 to-white p-2 ring-1 ring-emerald-100">
                <p className="text-[7px] font-semibold text-gray-500">{label}</p>
                <p className="text-[10px] font-bold text-gray-900">+12%</p>
              </div>
            ))}
          </div>
          <div className="h-10 rounded-md bg-white ring-1 ring-gray-100">
            <AreaChart uid="analytics-compact" />
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Unternehmensanalyse — UNZE Business">
      <div className="flex h-full flex-col p-3 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold text-gray-900">Analyse-Dashboard</h2>
          <div className="flex gap-1">
            {["Q1", "Q2", "Q3", "Q4", "12M"].map((period, i) => (
              <span
                key={period}
                className={`rounded-md px-2 py-0.5 text-[7px] font-semibold ${
                  i === 4 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                {period}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            { label: "Digitalisierung", val: "68%", icon: TrendingUp, color: "emerald" },
            { label: "Prozesse", val: "12", icon: BarChart3, color: "indigo" },
            { label: "Potenzial", val: "€ 24k", icon: PieChart, color: "violet" },
            { label: "Zeithorizont", val: "6 Mon.", icon: Calendar, color: "amber" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              <kpi.icon className="h-3 w-3 text-[#00C853]" aria-hidden />
              <p className="mt-1 font-[family-name:var(--font-display)] text-[13px] font-bold text-gray-900">
                {kpi.val}
              </p>
              <p className="text-[7px] font-medium text-gray-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid flex-1 gap-2 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-indigo-500" />
              <p className="text-[8px] font-semibold text-gray-700">Umsatz nach Leistung</p>
            </div>
            <div className="mt-2 flex h-20 items-end gap-1">
              {[35, 55, 42, 72, 48, 65, 58, 80, 62, 75, 68, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-[#00C853] to-emerald-400"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-1 text-[6px] text-gray-400">Jan — Dez 2026</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-1">
              <PieChart className="h-3 w-3 text-violet-500" />
              <p className="text-[8px] font-semibold text-gray-700">Prioritäten-Matrix</p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                ["Website-Relaunch", "Hoch", "emerald"],
                ["Prozess-Digitalisierung", "Mittel", "amber"],
                ["CRM-Einführung", "Hoch", "emerald"],
              ].map(([name, prio, color]) => (
                <li key={name} className="flex items-center justify-between text-[7px]">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-semibold ${
                      color === "emerald"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {prio}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2 rounded-xl border border-gray-100 bg-white p-3">
          <p className="text-[9px] font-semibold text-gray-800">Trend — 12 Monate</p>
          <div className="mt-2 h-16">
            <AreaChart uid="analytics-main-v2" />
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
