import { IndustryMockStage } from "@/components/business/visuals/IndustryMockStage";
import {
  WEBSITE_TEMPLATE_SHOWCASE,
  WEBSITE_TEMPLATES,
} from "@/lib/constants/business-website-templates";

/** Server-Showcase — alle Branchen-Templates sichtbar, kein Client-Carousel. */
export function WebsiteTemplateShowcaseGrid() {
  return (
    <div className="mx-auto max-w-6xl space-y-10" data-export="website-template-grid">
      {WEBSITE_TEMPLATE_SHOWCASE.map((active, index) => {
        const template = WEBSITE_TEMPLATES[active.id];
        return (
          <article key={active.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#00C853]">{template.company}</p>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                  {template.label}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {index + 1} / {WEBSITE_TEMPLATE_SHOWCASE.length}
              </p>
            </div>
            <IndustryMockStage
              industry={active.id}
              variant="website"
              label={active.moduleLabel}
              uniform
            />
          </article>
        );
      })}
      <p className="text-center text-xs text-gray-400">
        Referenz-Webseiten aus Business Core — Design wird individuell angepasst
      </p>
    </div>
  );
}
