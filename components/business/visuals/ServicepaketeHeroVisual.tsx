import { Headphones, Shield, Sparkles, Zap } from "lucide-react";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

const HIGHLIGHTS = [
  { icon: Shield, label: "Planbare Betreuung", detail: "Feste Ansprechpartner" },
  { icon: Zap, label: "Priorität", detail: "Schnellere Reaktionszeiten" },
  { icon: Headphones, label: "Support", detail: "Hosting & Updates" },
  { icon: Sparkles, label: "Weiterentwicklung", detail: "Inklusiv-Stunden" },
];

/** Visueller Einstieg für Servicepakete — weniger Textwand, mehr Vertrauen. */
export function ServicepaketeHeroVisual() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-950 shadow-2xl shadow-gray-900/20"
      data-export="servicepakete-hero-visual"
    >
      <BusinessPhoto
        src={BUSINESS_IMAGERY.services["business-core"].src}
        alt=""
        fill
        className="absolute inset-0 object-cover opacity-40"
        sizes="(max-width: 1024px) 100vw, 640px"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-950/75 to-emerald-950/60" />

      <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-10 lg:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C853]">
            Managed Service
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Betreuung, die mit Ihrem System mitwächst
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
            Nach der Abnahme bleiben wir an Ihrer Seite — mit klaren Service-Stufen, Inklusiv-Stunden
            und persönlicher Priorität statt anonymer Einzelrechnungen.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-[#00C853]/30 hover:bg-white/10"
            >
              <Icon className="h-5 w-5 text-[#00C853]" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs text-white/60">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
