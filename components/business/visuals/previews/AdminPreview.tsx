import { Bell, Settings, Shield, UserCog, Users } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";

const NAV = [
  { icon: Users, label: "Mitglieder", count: "248" },
  { icon: Shield, label: "Moderation", count: "3" },
  { icon: UserCog, label: "Rollen", active: true },
  { icon: Settings, label: "Einstellungen" },
];

const ROLES = [
  { name: "Administrator", members: 2, color: "bg-violet-100 text-violet-700" },
  { name: "Moderator", members: 5, color: "bg-sky-100 text-sky-700" },
  { name: "Creator", members: 12, color: "bg-emerald-100 text-emerald-700" },
  { name: "Mitglied", members: 229, color: "bg-gray-100 text-gray-600" },
];

export function AdminPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Verwaltung">
        <div className="flex h-full">
          <div className="w-10 border-r border-gray-100 bg-white py-2">
            {NAV.slice(0, 3).map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`mx-1 mb-1 flex h-5 items-center justify-center rounded-md ${
                  active ? "bg-[#00C853]/15" : ""
                }`}
              >
                <Icon className={`h-2.5 w-2.5 ${active ? "text-[#00C853]" : "text-gray-400"}`} />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-1 p-2">
            {ROLES.slice(0, 3).map((r) => (
              <div key={r.name} className="rounded-md bg-white p-1.5 ring-1 ring-gray-100">
                <p className="text-[7px] font-semibold text-gray-800">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Admin · Community-Verwaltung">
      <div className="flex h-full">
        <aside className="w-[72px] shrink-0 border-r border-gray-100 bg-white py-3">
          {NAV.map(({ icon: Icon, label, count, active }) => (
            <div
              key={label}
              className={`relative mx-2 mb-2 flex flex-col items-center rounded-lg px-1 py-2 ${
                active ? "bg-[#00C853]/10" : ""
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-[#00C853]" : "text-gray-400"}`} />
              <span className="mt-1 text-[6px] font-medium text-gray-500">{label}</span>
              {count ? (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 px-1 text-[5px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </div>
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col bg-[#f8fafc] p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-bold text-gray-900">Rollen & Berechtigungen</h2>
              <p className="text-[8px] text-gray-400">Demo-Community · anonymisiert</p>
            </div>
            <Bell className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <div className="mt-3 space-y-2">
            {ROLES.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-1 text-[8px] font-semibold ${r.color}`}>
                    {r.name}
                  </span>
                  <StatusPill tone="gray">{r.members} Nutzer</StatusPill>
                </div>
                <button
                  type="button"
                  className="text-[7px] font-semibold text-[#00C853]"
                >
                  Bearbeiten
                </button>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-dashed border-gray-200 bg-white/80 p-2.5">
            <p className="text-[7px] text-gray-500">
              Entwickelt von UNZE Business — skalierbare Verwaltung für Plattformen & Communities.
            </p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
