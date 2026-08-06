import { Clock, User } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";

const TEAM = [
  { name: "Marco T.", role: "Vorarbeiter", hours: "38h", status: "Im Einsatz" },
  { name: "Sandra K.", role: "Büro", hours: "32h", status: "Verfügbar" },
  { name: "Tim B.", role: "Monteur", hours: "40h", status: "Im Einsatz" },
  { name: "Lisa M.", role: "Azubi", hours: "28h", status: "Urlaub" },
];

export function EmployeesPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Team">
        <div className="space-y-1 p-2">
          {TEAM.slice(0, 2).map((e) => (
            <div key={e.name} className="flex items-center gap-1.5 rounded-md bg-white p-1.5 ring-1 ring-gray-100">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-[7px] font-medium">{e.name}</span>
            </div>
          ))}
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Mitarbeiterverwaltung">
      <div className="flex h-full flex-col p-3 md:p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-gray-900">Mitarbeiter</h2>
          <span className="text-[8px] text-gray-400">4 aktiv · 12 gesamt</span>
        </div>
        <div className="mt-3 flex-1 space-y-2">
          {TEAM.map((e) => (
            <article
              key={e.name}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-[8px] font-bold text-white">
                {e.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-gray-900">{e.name}</p>
                <p className="text-[7px] text-gray-400">{e.role}</p>
              </div>
              <div className="flex items-center gap-1 text-[7px] text-gray-400">
                <Clock className="h-2.5 w-2.5" />
                {e.hours}
              </div>
              <StatusPill tone={e.status === "Im Einsatz" ? "green" : e.status === "Verfügbar" ? "gray" : "amber"}>
                {e.status}
              </StatusPill>
            </article>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}
