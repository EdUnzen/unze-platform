import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import {
  WEBSITE_TEMPLATE_ORDER,
  WEBSITE_TEMPLATES,
  type WebsitePageId,
} from "@/lib/constants/business-website-templates";

const PAGES: { id: WebsitePageId; label: string }[] = [
  { id: "home", label: "Startseite" },
  { id: "contact", label: "Kontakt" },
];

/** Referenz-Webseiten — vollständig sichtbar im Browser-Rahmen, ohne Abschnitt. */
export function WebsitePracticeShowcase() {
  return (
    <div className="space-y-12 md:space-y-14" data-export="website-practice-showcase">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Referenz in der Praxis</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          So sehen unsere Webseiten-Lösungen aus
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Umzug, Reinigung und Arztpraxis — bewährte Branchenvorlagen aus dem UNZE Designsystem.
          Struktur, Texte und Design passen wir individuell an Ihr Unternehmen an.
        </p>
      </div>

      <div className="space-y-14">
        {WEBSITE_TEMPLATE_ORDER.map((id, sectionIndex) => {
          const template = WEBSITE_TEMPLATES[id];
          return (
            <BusinessScrollReveal key={id} delay={sectionIndex * 60}>
              <section className="space-y-5" data-export={`website-practice-${id}`}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Branchenvorlage · {template.label}
                    </p>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                      {template.company}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{template.tagline}</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {PAGES.map((page) => (
                    <div key={page.id} className="space-y-3">
                      <ProductMockupFrame
                        device="laptop"
                        label={`${page.label} · ${template.company}`}
                        presentation="standard"
                        fillContainer
                      >
                        <WebsitePreview industry={id} page={page.id} size="gallery" />
                      </ProductMockupFrame>
                    </div>
                  ))}
                </div>
              </section>
            </BusinessScrollReveal>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Demo-Referenzen — Design, Inhalte und Module werden für Ihr Unternehmen individuell konfiguriert.
      </p>
    </div>
  );
}
