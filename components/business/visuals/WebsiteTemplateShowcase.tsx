import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { WebsiteTemplateScreenshot } from "@/components/business/visuals/WebsiteTemplateScreenshot";
import { WebsiteTemplateShowcaseGrid } from "@/components/business/visuals/WebsiteTemplateShowcaseGrid";
import {
  WEBSITE_PAGES,
  WEBSITE_TEMPLATE_ORDER,
  WEBSITE_TEMPLATES,
  WEBSITE_TEMPLATES_INTRO,
} from "@/lib/constants/business-website-templates";

export function WebsiteTemplateShowcase() {
  return (
    <div className="space-y-14 md:space-y-16" data-export="website-template-showcase">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>{WEBSITE_TEMPLATES_INTRO.eyebrow}</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          {WEBSITE_TEMPLATES_INTRO.title}
        </h2>
        <p className="mt-4 text-lg text-gray-600">{WEBSITE_TEMPLATES_INTRO.lead}</p>
      </div>

      <BusinessMockDisclaimer variant="note" className="mx-auto max-w-2xl" />

      <WebsiteTemplateShowcaseGrid />

      <div className="space-y-12">
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>Seiten-Beispiele</BusinessEyebrow>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            Startseite, Leistungen & Kontakt
          </h3>
          <p className="mt-3 text-gray-600">
            Pro Branche drei Seiten — sauber strukturiert, ohne Überlappung.
          </p>
        </div>

        {WEBSITE_TEMPLATE_ORDER.map((id) => {
          const template = WEBSITE_TEMPLATES[id];

          return (
            <section key={id} className="space-y-4" data-export={`website-template-section-${id}`}>
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-[#00C853]">{template.company}</p>
                  <h4 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900">
                    {template.label}
                  </h4>
                </div>
                <p className="text-sm text-gray-500">{template.tagline}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {WEBSITE_PAGES.map((page) => (
                  <WebsiteTemplateScreenshot
                    key={page.id}
                    industry={id}
                    page={page.id}
                    label={page.label}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
