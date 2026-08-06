import { Award, Calendar, MapPin, Star, Users } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";

export function ProfilePreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Profil">
        <div className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
            <div>
              <p className="text-[8px] font-bold text-gray-900">M. Schneider</p>
              <p className="text-[6px] text-gray-400">Creator · Verifiziert</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {["842", "4,9", "12"].map((v, i) => (
              <div key={v} className="rounded-md bg-white p-1 text-center ring-1 ring-gray-100">
                <p className="text-[7px] font-bold text-gray-900">{v}</p>
                <p className="text-[5px] text-gray-400">{["Follower", "Rating", "Events"][i]}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Creator-Profil">
      <div className="relative h-full bg-[#f8fafc]">
        <div className="h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="px-3 pb-3">
          <div className="-mt-6 flex items-end gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white shadow-lg">
              MS
            </div>
            <div className="mb-1 min-w-0 flex-1">
              <h2 className="truncate text-[10px] font-bold text-gray-900">Max Schneider</h2>
              <p className="flex items-center gap-1 text-[7px] text-gray-500">
                <MapPin className="h-2 w-2" />
                Koblenz · Business & Netzwerk
              </p>
            </div>
            <StatusPill tone="green">Verifiziert</StatusPill>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[
              { icon: Users, val: "842", label: "Netzwerk" },
              { icon: Star, val: "4,9", label: "Bewertung" },
              { icon: Calendar, val: "12", label: "Events" },
              { icon: Award, val: "5", label: "Badges" },
            ].map(({ icon: Icon, val, label }) => (
              <div
                key={label}
                className="rounded-xl border border-gray-100 bg-white p-2 text-center shadow-sm"
              >
                <Icon className="mx-auto h-3 w-3 text-[#00C853]" />
                <p className="mt-1 text-[9px] font-bold text-gray-900">{val}</p>
                <p className="text-[6px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
            <p className="text-[8px] font-semibold text-gray-900">Über</p>
            <p className="mt-1 text-[7px] leading-relaxed text-gray-600">
              Unternehmer im Mittelstand — Communities, Events und digitale Services. Profil und
              Analytics aus UNZE Connect — als Referenz für Plattform-Entwicklung.
            </p>
          </div>

          <div className="mt-2 flex gap-1.5">
            {["Community", "Events", "Services"].map((tab, i) => (
              <span
                key={tab}
                className={`rounded-full px-2 py-0.5 text-[7px] font-semibold ${
                  i === 0 ? "bg-[#00C853] text-white" : "bg-white text-gray-500 ring-1 ring-gray-100"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
