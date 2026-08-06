import { Fragment } from "react";
import { ChevronLeft, ChevronRight, MapPin, Truck, Users } from "lucide-react";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { PreviewShell } from "./shared";

const EVENTS: Record<number, string> = {
  3: "Kick-off",
  8: "Review",
  15: "Launch",
  22: "Support",
};

const UMZUG_VEHICLES = [
  { id: "V-01", label: "Sprinter · FF-MU 412", team: "Team Müller", status: "Unterwegs", color: "bg-blue-500" },
  { id: "V-02", label: "LKW 7,5t · FF-MU 891", team: "Team Schmidt", status: "Beladen", color: "bg-amber-500" },
  { id: "V-03", label: "Sprinter · FF-MU 203", team: "Team Weber", status: "Frei", color: "bg-emerald-500" },
] as const;

const UMZUG_TOURS = [
  { vehicle: 0, day: 1, slot: "08–12", route: "Frankfurt → Offenbach", customer: "Fam. Berger" },
  { vehicle: 0, day: 1, slot: "14–17", route: "Offenbach → Hanau", customer: "Büro Klein AG" },
  { vehicle: 1, day: 1, slot: "09–15", route: "Wiesbaden → Mainz", customer: "Praxis Dr. Lang" },
  { vehicle: 2, day: 2, slot: "10–13", route: "Darmstadt lokal", customer: "Hausverwaltung Süd" },
] as const;

function UmzugDispositionPreview({ bare = false }: { bare?: boolean }) {
  const days = ["Mo 17", "Di 18", "Mi 19", "Do 20", "Fr 21"];

  return (
    <PreviewShell bare={bare} title="Disposition & Fahrzeugplanung">
      <div className="flex h-full min-h-0 flex-col bg-[#f8fafc]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 py-2 md:px-4">
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md p-0.5 hover:bg-gray-100">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <h2 className="text-[11px] font-bold text-gray-900">Woche 17.–21. März 2026</h2>
            <button type="button" className="rounded-md p-0.5 hover:bg-gray-100">
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[7px] font-semibold text-blue-700">
              6 Touren
            </span>
            <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[7px] font-semibold text-emerald-700">
              3 Fahrzeuge
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-hidden p-2 md:p-3">
            <div className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 text-[7px]">
              <div className="bg-gray-50 p-1.5 font-semibold text-gray-500">Fahrzeug</div>
              {days.map((d) => (
                <div key={d} className="bg-gray-50 p-1.5 text-center font-semibold text-gray-600">
                  {d}
                </div>
              ))}

              {UMZUG_VEHICLES.map((v, vi) => (
                <Fragment key={v.id}>
                  <div className="flex flex-col justify-center bg-white p-1.5">
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      <Truck className="h-2.5 w-2.5 text-gray-400" aria-hidden />
                      {v.id}
                    </span>
                    <span className="mt-0.5 truncate text-[6px] text-gray-400">{v.label.split("·")[1]?.trim()}</span>
                  </div>
                  {days.map((d, di) => {
                    const tour = UMZUG_TOURS.find((t) => t.vehicle === vi && t.day === di);
                    return (
                      <div key={`${v.id}-${d}`} className="min-h-[44px] bg-white p-1">
                        {tour ? (
                          <div className="h-full rounded-md bg-gradient-to-br from-blue-500/90 to-indigo-600/90 p-1 text-white shadow-sm">
                            <p className="font-semibold leading-tight">{tour.slot}</p>
                            <p className="mt-0.5 truncate text-[6px] text-white/90">{tour.customer}</p>
                            <p className="mt-0.5 flex items-center gap-0.5 truncate text-[5px] text-white/75">
                              <MapPin className="h-2 w-2 shrink-0" aria-hidden />
                              {tour.route}
                            </p>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-100 text-[6px] text-gray-300">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          <aside className="hidden w-[34%] shrink-0 border-l border-gray-100 bg-white p-3 md:block">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">Flotte heute</p>
            <ul className="mt-2 space-y-2">
              {UMZUG_VEHICLES.map((v) => (
                <li key={v.id} className="rounded-lg border border-gray-100 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-gray-800">{v.id}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[6px] font-semibold text-white ${v.color}`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[7px] text-gray-500">{v.label}</p>
                  <p className="mt-1 flex items-center gap-1 text-[6px] text-gray-400">
                    <Users className="h-2.5 w-2.5" aria-hidden />
                    {v.team}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-100">
              <p className="text-[7px] font-semibold text-emerald-800">Auslastung Woche</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[13px] font-bold text-emerald-900">
                87%
              </p>
              <p className="text-[6px] text-emerald-700">2 freie Kapazitäten Fr · V-03</p>
            </div>
          </aside>
        </div>
      </div>
    </PreviewShell>
  );
}

export function CalendarPreview({
  compact = false,
  bare = false,
  industry = "umzug",
}: {
  compact?: boolean;
  industry?: IndustryId;
  bare?: boolean;
}) {
  if (industry === "umzug" && !compact) {
    return <UmzugDispositionPreview bare={bare} />;
  }

  if (compact) {
    return (
      <PreviewShell bare={bare} title="Kalender">
        <div className="p-2">
          <p className="text-center text-[8px] font-semibold text-gray-700">März 2026</p>
          <div className="mt-1.5 grid grid-cols-7 gap-0.5">
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded text-[6px] ${
                  EVENTS[i + 1]
                    ? "bg-[#00C853]/15 font-bold text-[#00C853]"
                    : "text-gray-400"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Termine & Planung">
      <div className="flex h-full flex-col p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md p-0.5 hover:bg-gray-100">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <h2 className="text-[11px] font-bold text-gray-900">März 2026</h2>
            <button type="button" className="rounded-md p-0.5 hover:bg-gray-100">
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
          <span className="rounded-lg bg-[#00C853]/10 px-2 py-0.5 text-[7px] font-semibold text-[#00C853]">
            4 Termine
          </span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[7px] font-semibold uppercase text-gray-400">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="mt-1.5 grid flex-1 grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2;
            const valid = day >= 1 && day <= 31;
            const event = EVENTS[day];
            return (
              <div
                key={i}
                className={`flex min-h-[28px] flex-col items-center rounded-lg p-0.5 text-[8px] ${
                  !valid
                    ? "opacity-0"
                    : event
                      ? "bg-[#00C853]/10 font-semibold text-[#00C853] ring-1 ring-[#00C853]/20"
                      : "bg-white text-gray-600 ring-1 ring-gray-100"
                }`}
              >
                {valid ? day : null}
                {event ? (
                  <span className="mt-0.5 hidden text-[5px] font-medium leading-none sm:block">
                    {event}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-2">
          {Object.entries(EVENTS).map(([day, label]) => (
            <div key={day} className="flex items-center gap-2 text-[8px]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00C853]/10 font-bold text-[#00C853]">
                {day}
              </span>
              <span className="font-medium text-gray-700">{label}</span>
              <span className="ml-auto text-gray-400">10:00</span>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}
