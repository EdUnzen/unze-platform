import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { ReferenceScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import {
  TBC_TEMPLATE_ORDER,
  TBC_TEMPLATES,
  tbcScreenshotAlt,
  tbcScreenshotPath,
  type TbcTemplateId,
  type TbcTemplatePageId,
} from "@/lib/constants/business-core-template-screenshots";

const PAGES: { id: TbcTemplatePageId; label: string; websitePage: "home" | "contact" }[] = [
  { id: "home", label: "Startseite", websitePage: "home" },
  { id: "kontakt", label: "Kontakt", websitePage: "contact" },
];

function TbcPagePreview({ templateId, page }: { templateId: TbcTemplateId; page: TbcTemplatePageId }) {
  const template = TBC_TEMPLATES[templateId];
  const websitePage = page === "home" ? "home" : "contact";
  const src = tbcScreenshotPath(templateId, page);

  return (
    <ReferenceScreenshot
      src={src}
      alt={tbcScreenshotAlt(templateId, page)}
      embedded
      fallback={
        <WebsitePreview
          industry={templateId === "hausmeister" ? "reinigung" : templateId === "arztpraxis" ? "arztpraxis" : templateId}
          page={websitePage}
          size="gallery"
        />
      }
    />
  );
}

/** Templates Business Core — Screenshot wenn vorhanden, sonst volle HTML-Referenz. */
export function TbcReferenceShowcase() {
  return (
    <div className="space-y-14 md:space-y-16" data-export="tbc-reference-showcase">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Templates Business Core</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          Echte Branchenvorlagen — vollständig sichtbar
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Umzug, Reinigung, Hausmeister und Arztpraxis aus dem UNZE Designsystem. Struktur und Design
          passen wir individuell an Ihr Unternehmen an.
        </p>
      </div>

      {TBC_TEMPLATE_ORDER.map((id, sectionIndex) => {
        const template = TBC_TEMPLATES[id];
        return (
          <BusinessScrollReveal key={id} delay={sectionIndex * 50}>
            <section className="space-y-6" data-export={`tbc-ref-${id}`}>
              <div className="border-b border-gray-100 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  Branchenvorlage · {template.label}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                  {template.company}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{template.tagline}</p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                {PAGES.map((page) => (
                  <ProductMockupFrame
                    key={page.id}
                    device="laptop"
                    label={`${page.label} · ${template.company}`}
                    presentation="standard"
                    fillContainer
                  >
                    <TbcPagePreview templateId={id} page={page.id} />
                  </ProductMockupFrame>
                ))}
              </div>
            </section>
          </BusinessScrollReveal>
        );
      })}

      <p className="text-center text-xs text-gray-400">
        Referenz-Templates Business Core — Inhalte und Design werden für Ihr Unternehmen individuell konfiguriert.
      </p>
    </div>
  );
}
