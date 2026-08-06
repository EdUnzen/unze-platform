"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Layers, Puzzle, Sparkles } from "lucide-react";
import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { IndustryMockStage } from "@/components/business/visuals/IndustryMockStage";
import { DEVICE_OPTIONS, type DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import { type MockVariant } from "@/components/business/visuals/MockScreen";
import {
  INDUSTRY_META,
  INDUSTRY_SHOWCASES,
  type IndustryId,
  type ModuleShowcase,
} from "@/lib/constants/business-industry-scenarios";

const INDUSTRY_ORDER: IndustryId[] = ["umzug", "reinigung", "arztpraxis"];

export function IndustryModuleShowcase() {
  const [industry, setIndustry] = useState<IndustryId>("umzug");
  const [activeId, setActiveId] = useState<string>("dashboard");
  const [device, setDevice] = useState<DeviceVariant>("laptop");

  const showcases = INDUSTRY_SHOWCASES[industry];
  const active: ModuleShowcase =
    showcases.find((s) => s.id === activeId) ?? showcases[0];

  const moduleTabs = useMemo(
    () =>
      showcases.map((s) => ({
        id: s.id,
        label: s.title.split("—")[0]?.trim() ?? s.title,
        variant: s.variant,
      })),
    [showcases]
  );

  return (
    <div className="space-y-10" data-export="industry-module-showcase">
      <BusinessScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <BusinessEyebrow>Beispielansichten</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            Business Core — gezeigt, nicht nur beschrieben
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Wählen Sie eine Branche und einen Bereich. Die Grafiken zeigen{" "}
            <strong className="font-semibold text-gray-800">mögliche Anwendungsfälle</strong> auf
            Basis unseres Grundsystems — Design, Farben und Module passen wir individuell an.
          </p>
        </div>
      </BusinessScrollReveal>

      <BusinessScrollReveal delay={40}>
        <BusinessMockDisclaimer variant="note" className="mx-auto max-w-2xl" />
      </BusinessScrollReveal>

      <div className="flex flex-wrap justify-center gap-2">
        {INDUSTRY_ORDER.map((id) => {
          const meta = INDUSTRY_META[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setIndustry(id);
                setActiveId(INDUSTRY_SHOWCASES[id][0].id);
                setDevice(INDUSTRY_SHOWCASES[id][0].defaultDevice);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 ${
                industry === id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-[#00C853]/40"
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {moduleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveId(tab.id);
              const match = showcases.find((s) => s.id === tab.id);
              if (match) setDevice(match.defaultDevice);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeId === tab.id
                ? "bg-[#00C853] text-white shadow-md shadow-[#00C853]/25"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <BusinessScrollReveal>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#00C853]">{INDUSTRY_META[industry].company}</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
                {active.title}
              </h3>
              <p className="mt-2 text-base text-gray-600">{active.subtitle}</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <DetailRow icon={Sparkles} label="Problem" text={active.problem} />
              <DetailRow icon={ArrowRight} label="Lösung" text={active.solution} />
              <DetailRow icon={Layers} label="Ihr Nutzen" text={active.benefit} highlight />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Aktive Module</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.modulesActive.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-[#00C853]/10 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Später erweiterbar
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.extensions.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-600 ring-1 ring-gray-100"
                  >
                    <Puzzle className="h-3 w-3" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </BusinessScrollReveal>

        <BusinessScrollReveal delay={120}>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              {DEVICE_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    device === d.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <IndustryMockStage
              industry={industry}
              variant={active.variant as MockVariant}
              device={device}
              label={active.title}
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
