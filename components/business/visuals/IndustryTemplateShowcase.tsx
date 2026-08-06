"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { ProcessTimeline } from "@/components/business/visuals/ProcessTimeline";
import {
  INDUSTRY_TEMPLATES,
  INDUSTRY_TEMPLATES_INTRO,
  type IndustryTemplate,
} from "@/lib/constants/business-industry-templates";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";

const STATUS_STYLE: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  "in-arbeit": "bg-amber-50 text-amber-800 ring-amber-600/15",
  geplant: "bg-gray-100 text-gray-600 ring-gray-500/10",
};

const STATUS_LABEL: Record<string, string> = {
  live: "Referenz live",
  "in-arbeit": "In Entwicklung",
  geplant: "Geplant",
};

export function IndustryTemplateShowcase() {
  const [templateId, setTemplateId] = useState<string>("umzug");
  const [screenId, setScreenId] = useState<string>("dash");

  const template = useMemo(
    () => INDUSTRY_TEMPLATES.find((t) => t.id === templateId) ?? INDUSTRY_TEMPLATES[0],
    [templateId],
  );

  const activeScreen = template.screens.find((s) => s.id === screenId) ?? template.screens[0];
  const industry: IndustryId = template.industryMock ?? "umzug";

  const selectTemplate = (t: IndustryTemplate) => {
    setTemplateId(t.id);
    setScreenId(t.screens[0]?.id ?? "dash");
  };

  return (
    <div className="space-y-10" data-export="industry-template-showcase">
      <BusinessScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <BusinessEyebrow>{INDUSTRY_TEMPLATES_INTRO.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            {INDUSTRY_TEMPLATES_INTRO.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{INDUSTRY_TEMPLATES_INTRO.lead}</p>
        </div>
      </BusinessScrollReveal>

      <div className="flex flex-wrap justify-center gap-2">
        {INDUSTRY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTemplate(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${
              templateId === t.id
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-[#00C853]/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <BusinessScrollReveal>
          <div className="space-y-6">
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[template.status]}`}
              >
                {STATUS_LABEL[template.status]}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
                {template.label}
              </h3>
              <p className="mt-2 text-base text-gray-600">{template.tagline}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Module</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {template.modules.map((m) => (
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
                Arbeitsablauf
              </p>
              <div className="mt-4">
                <ProcessTimeline steps={template.workflow.map((w) => ({ step: w.step, detail: w.detail }))} />
              </div>
            </div>
          </div>
        </BusinessScrollReveal>

        <BusinessScrollReveal delay={100}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {template.screens.map((screen) => (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setScreenId(screen.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    screenId === screen.id
                      ? "bg-[#00C853] text-white shadow-md shadow-[#00C853]/20"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {screen.label}
                </button>
              ))}
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00C853]/25 via-emerald-400/10 to-teal-400/10 opacity-60 blur transition duration-500 group-hover:opacity-100" />
              <ProductMockupFrame
                device="laptop"
                label={activeScreen.caption}
                presentation="hero"
                fillContainer
                synthetic
              >
                <MockScreen
                  variant={activeScreen.variant as MockVariant}
                  industry={industry}
                  device="laptop"
                  bare
                  showcase
                />
              </ProductMockupFrame>
            </div>
            <p className="flex items-center gap-1.5 text-center text-xs text-gray-500">
              <ArrowRight className="h-3.5 w-3.5 text-[#00C853]" aria-hidden />
              {activeScreen.caption} — anonymisierte Demo-Ansicht
            </p>
          </div>
        </BusinessScrollReveal>
      </div>
    </div>
  );
}
