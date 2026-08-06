import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { ShopBrowserChrome } from "@/components/business/shop/ShopBrowserChrome";
import { ShopTbcScreenshot } from "@/components/business/shop/ShopTbcScreenshot";
import {
  TBC_TEMPLATE_ORDER,
  TBC_TEMPLATES,
  type TbcTemplatePageId,
} from "@/lib/constants/business-core-template-screenshots";

const PAGES: { id: TbcTemplatePageId; label: string }[] = [
  { id: "home", label: "Startseite" },
  { id: "kontakt", label: "Kontakt" },
];

/** Echte Templates Business Core — Screenshots aus TBC Studio (Port 3100) */
export function TbcTemplateShowcase() {
  return (
    <div className="space-y-12 md:space-y-14" data-export="tbc-template-showcase">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Templates Business Core</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          Referenz-Templates für vier Branchen
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Umzug, Reinigung, Hausmeister und Arztpraxis — bewährte Vorlagen aus dem TBC Studio.
          Struktur und Design passen wir individuell an Ihr Unternehmen an.
        </p>
      </div>

      <div className="space-y-14">
        {TBC_TEMPLATE_ORDER.map((id) => {
          const template = TBC_TEMPLATES[id];
          return (
            <section key={id} className="space-y-4" data-export={`tbc-template-${id}`}>
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Branchenvorlage · {template.label}
                  </p>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                    {template.label}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-[#00C853]">{template.company}</p>
                </div>
                <p className="text-sm text-gray-500">{template.tagline}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {PAGES.map((page) => (
                  <div key={page.id}>
                    <ShopBrowserChrome
                      url={`${template.company.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.de${page.id === "kontakt" ? "/kontakt" : ""}`}
                    >
                      <ShopTbcScreenshot templateId={id} page={page.id} variant="gallery" />
                    </ShopBrowserChrome>
                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {page.label} · {template.company}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
