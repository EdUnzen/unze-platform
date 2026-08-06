import { Megaphone, MousePointerClick, TrendingUp } from "lucide-react";
import { PreviewShell, AreaChart, Sparkline } from "./shared";

export function MarketingPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Marketing">
        <div className="p-2">
          <div className="h-12 rounded-md bg-white p-1 ring-1 ring-gray-100">
            <AreaChart uid="marketing-compact" />
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Marketing-Dashboard">
      <div className="flex h-full flex-col p-3 md:p-4">
        <h2 className="text-[11px] font-bold text-gray-900">Marketing & Leads</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Website-Leads", val: "47", icon: MousePointerClick, up: true },
            { label: "Kampagnen", val: "3 aktiv", icon: Megaphone, up: true },
            { label: "Conversion", val: "4,2%", icon: TrendingUp, up: true },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
              <k.icon className="h-3 w-3 text-[#00C853]" />
              <p className="mt-1 text-[7px] text-gray-400">{k.label}</p>
              <p className="text-[10px] font-bold text-gray-900">{k.val}</p>
              <Sparkline />
            </div>
          ))}
        </div>
        <div className="mt-3 flex-1 rounded-xl border border-gray-100 bg-white p-3">
          <p className="text-[9px] font-semibold text-gray-800">Anfragen nach Kanal</p>
          <div className="mt-2 h-20">
            <AreaChart uid="marketing-channels" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Google", "Website", "Empfehlung", "Social"].map((ch) => (
              <span key={ch} className="rounded-full bg-gray-50 px-2 py-0.5 text-[7px] text-gray-600">
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
