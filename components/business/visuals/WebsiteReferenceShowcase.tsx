import { BusinessEyebrow, BusinessSectionIntro, BusinessShowcaseCard } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { ReferenceBrowserShowcase } from "@/components/business/visuals/ReferenceShowcase";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import {
  tbcReference,
  WEBSITE_REFERENCE_SHOWCASE,
} from "@/lib/constants/business-reference-showcase";
import type { TbcTemplateId } from "@/lib/constants/business-core-template-screenshots";

function websiteFallback(templateId: TbcTemplateId) {
  const industry =
    templateId === "hausmeister" ? "reinigung" : templateId === "arztpraxis" ? "arztpraxis" : templateId;
  return <WebsitePreview industry={industry} page="home" size="gallery" />;
}

/** Webseiten — eine Referenz pro Template, in weichen Karten mit klaren Abständen */
export function WebsiteReferenceShowcase() {
  return (
    <div className={BUSINESS_VISUAL.showcaseStack} data-export="website-reference-showcase">
      <BusinessSectionIntro
        eyebrow={<BusinessEyebrow>Referenz-Webseiten</BusinessEyebrow>}
        title="Diese Qualität bekommen Sie"
        intro="Vier Branchenvorlagen aus dem UNZE Designsystem — groß, vollständig und professionell. Struktur und Design passen wir individuell an Ihr Unternehmen an."
        className={BUSINESS_VISUAL.sectionIntroMb}
      />

      {WEBSITE_REFERENCE_SHOWCASE.map((item, index) => (
        <BusinessScrollReveal key={item.templateId} delay={index * 40}>
          <BusinessShowcaseCard>
            <section
              className={`grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
              data-export={`website-ref-${item.templateId}`}
            >
              <div className="space-y-6 lg:max-w-md lg:py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00C853]">
                  Branchenvorlage · {item.label}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
                  {item.company}
                </h3>
                <p className="leading-relaxed text-gray-600">{item.tagline}</p>
                <ul className="space-y-3">
                  {item.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="max-lg:mt-4 lg:pt-2">
                <ReferenceBrowserShowcase
                  asset={tbcReference(item.templateId, "home")}
                  label={`Startseite · ${item.company}`}
                  caption={`${item.company} — Startseite`}
                  size="hero"
                  priority={index === 0}
                  fallback={websiteFallback(item.templateId)}
                />
              </div>
            </section>
          </BusinessShowcaseCard>
        </BusinessScrollReveal>
      ))}

      <p className="pt-6 text-center text-xs text-gray-400">
        Referenz-Templates Business Core — Inhalte und Design werden für Ihr Unternehmen individuell konfiguriert.
      </p>
    </div>
  );
}
