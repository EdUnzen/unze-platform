"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import {
  MarketingShowcaseScreen,
  PhoneShowcaseWithBackdrop,
} from "@/components/business/visuals/MarketingShowcaseScreen";
import { INDUSTRY_META, type IndustryId } from "@/lib/constants/business-industry-scenarios";

const WEBAPP_SHOWCASES: {
  industry: IndustryId;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  benefit: string;
  modules: string[];
}[] = [
  {
    industry: "arztpraxis",
    title: "Terminbuchung & Patientenportal",
    subtitle: "Online-Termine, Befunde und Kommunikation",
    problem: "Telefon-Warteschleifen und Papierformulare kosten Zeit.",
    solution: "Web-App mit Terminbuchung, Patientenlogin und Dokumentenabruf.",
    benefit: "Weniger Telefonaufwand — mehr Zeit für Patienten.",
    modules: ["Terminbuchung", "Patientenportal", "Benachrichtigungen"],
  },
  {
    industry: "umzug",
    title: "Kundenportal & Auftragsstatus",
    subtitle: "Anfragen, Angebote und Touren-Tracking",
    problem: "Kunden rufen ständig an: Wo ist mein Umzug? Was kostet es?",
    solution: "Self-Service-Portal mit Preisrechner, Angebot und Live-Status.",
    benefit: "Weniger Rückfragen — schnellere Auftragsabschlüsse.",
    modules: ["Preisrechner", "Auftragsstatus", "Dokumente"],
  },
  {
    industry: "reinigung",
    title: "Objektverwaltung & Einsatzplan",
    subtitle: "Teams, Objekte und Qualitätsprotokolle digital",
    problem: "Einsatzpläne per WhatsApp und Protokolle auf Papier.",
    solution: "Web-App für Disposition, Checklisten und Objekthistorie.",
    benefit: "Transparente Einsätze — nachweisbare Qualität.",
    modules: ["Einsatzplan", "Checklisten", "Objektverwaltung"],
  },
];

export function WebAppShowcase() {
  const [index, setIndex] = useState(0);
  const active = WEBAPP_SHOWCASES[index];
  const meta = INDUSTRY_META[active.industry];

  const tabs = useMemo(
    () => WEBAPP_SHOWCASES.map((s) => ({ id: s.industry, label: INDUSTRY_META[s.industry].label })),
    [],
  );

  return (
    <div className="space-y-10" data-export="webapp-showcase">
      <BusinessScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <BusinessEyebrow>App-Beispiele</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            Portale & Web-Apps — branchenspezifisch
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Patientenportal, Kundenportal und Objektverwaltung — maßgeschneidert statt von der Stange.
          </p>
        </div>
      </BusinessScrollReveal>

      <BusinessScrollReveal delay={40}>
        <BusinessMockDisclaimer variant="note" className="mx-auto max-w-2xl" />
      </BusinessScrollReveal>

      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              i === index
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-[#00C853]/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <BusinessScrollReveal>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-[#00C853]">{meta.company}</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {active.title}
              </h3>
              <p className="mt-2 text-gray-600">{active.subtitle}</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <DetailRow icon={Sparkles} label="Problem" text={active.problem} />
              <DetailRow icon={ArrowRight} label="Lösung" text={active.solution} />
              <DetailRow icon={Layers} label="Nutzen" text={active.benefit} highlight />
            </div>
            <div className="flex flex-wrap gap-2">
              {active.modules.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[#00C853]/10 px-3 py-1 text-xs font-medium text-emerald-800"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </BusinessScrollReveal>

        <BusinessScrollReveal delay={100}>
          <div className="space-y-8">
            <MarketingShowcaseScreen
              variant="webapp"
              industry={active.industry}
              label={active.title}
              caption="Desktop-Portal — vollständige Ansicht"
              device="laptop"
            />
            <PhoneShowcaseWithBackdrop
              variant="webapp"
              industry={active.industry}
              label="Mobile App · PWA"
              caption="Optimiert für Smartphone — gleiche Daten, unterwegs nutzbar"
            />
          </div>
        </BusinessScrollReveal>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  text,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "rounded-xl bg-emerald-50/60 p-3" : ""}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#00C853]" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}
