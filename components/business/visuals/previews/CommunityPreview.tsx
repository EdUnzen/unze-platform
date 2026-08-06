import { Search, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";

const COMMUNITIES = [
  {
    title: "Handwerk Netzwerk RLP",
    category: "Handwerk",
    members: "2.840",
    rating: "4,8",
    trending: true,
    verified: true,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Logistik & Transport DACH",
    category: "Logistik",
    members: "1.120",
    rating: "4,6",
    trending: false,
    verified: true,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Facility Services Pro",
    category: "Reinigung",
    members: "890",
    rating: "4,9",
    trending: true,
    verified: false,
    gradient: "from-sky-500 to-blue-600",
  },
];

export function CommunityPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Communities">
        <div className="space-y-1.5 p-2">
          {COMMUNITIES.slice(0, 2).map((c) => (
            <div key={c.title} className="overflow-hidden rounded-lg ring-1 ring-gray-100">
              <div className={`h-8 bg-gradient-to-r ${c.gradient}`} />
              <div className="bg-white p-1.5">
                <p className="truncate text-[7px] font-bold text-gray-900">{c.title}</p>
                <p className="text-[6px] text-gray-400">{c.members} Mitglieder</p>
              </div>
            </div>
          ))}
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="unze.app/communities">
      <div className="flex h-full flex-col bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold text-gray-900">Communities entdecken</h2>
            <p className="text-[8px] text-gray-400">Live-Verzeichnis · anonymisierte Demo-Daten</p>
          </div>
          <StatusPill tone="green">Live</StatusPill>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-gray-100">
          <Search className="h-3 w-3 text-gray-400" />
          <span className="text-[8px] text-gray-400">Community oder Branche suchen…</span>
        </div>
        <div className="mt-3 flex-1 space-y-2 overflow-hidden">
          {COMMUNITIES.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:border-[#00C853]/25"
            >
              <div className={`relative h-14 bg-gradient-to-r ${c.gradient}`}>
                <div className="absolute left-2 top-2 flex gap-1">
                  {c.verified ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[6px] font-semibold text-[#00C853]">
                      <ShieldCheck className="h-2 w-2" />
                      Verifiziert
                    </span>
                  ) : null}
                  {c.trending ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[6px] font-semibold text-amber-700">
                      <Sparkles className="h-2 w-2" />
                      Aktiv
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[7px] font-semibold uppercase tracking-wide text-[#00C853]">
                  {c.category}
                </p>
                <h3 className="mt-0.5 text-[9px] font-bold text-gray-900">{c.title}</h3>
                <div className="mt-1.5 flex items-center gap-3 text-[7px] text-gray-500">
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-2 w-2 fill-amber-400 text-amber-400" />
                    {c.rating}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Users className="h-2 w-2" />
                    {c.members}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}
