import Link from "next/link";

import { ArrowRight } from "lucide-react";

import {

  BusinessEyebrow,

  BusinessPageHero,

  BusinessSection,

  BusinessSectionIntro,

} from "@/components/business/BusinessUi";

import { LeistungCategoryCard } from "@/components/business/visuals/LeistungCategoryCard";

import { LeistungenHeroShowcase } from "@/components/business/visuals/LeistungenHeroShowcase";

import { ProcessTimeline } from "@/components/business/visuals/ProcessTimeline";

import { PremiumCta } from "@/components/business/visuals/PremiumCta";

import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";

import { BUSINESS_COPY } from "@/lib/constants/business-copy";



export function BusinessLeistungenPage() {

  const c = BUSINESS_COPY.leistungen;



  return (

    <>

      <BusinessPageHero {...c.hero} />

      <LeistungenHeroShowcase />

      <BusinessSection>

        <BusinessSectionIntro

          eyebrow={<BusinessEyebrow>Im Überblick</BusinessEyebrow>}

          title="Alle Leistungen auf einen Blick"

          intro="Wählen Sie den Bereich, der zu Ihrem Vorhaben passt — jede Karte führt zur Detailseite mit Referenzen und Ablauf."

          className={BUSINESS_VISUAL.sectionIntroMb}

        />

        <div className={`${BUSINESS_VISUAL.cardGrid} md:grid-cols-2`}>

          {c.categories.map((cat) => (

            <LeistungCategoryCard

              key={cat.href}

              title={cat.title}

              description={cat.description}

              href={cat.href}

              highlights={cat.highlights}

            />

          ))}

        </div>

      </BusinessSection>

      <BusinessSection className="border-y border-gray-100 bg-white">

        <BusinessSectionIntro

          eyebrow={<BusinessEyebrow>{c.capabilities.eyebrow}</BusinessEyebrow>}

          title={c.capabilities.title}

          intro={c.capabilities.text}

          className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}

        />

        <div className={`mx-auto max-w-4xl ${BUSINESS_VISUAL.cardGrid} sm:grid-cols-3`}>

          {c.capabilities.groups.map((group) => (

            <article

              key={group.title}

              className={`${BUSINESS_VISUAL.cardRadius} border border-gray-100 bg-gray-50 p-6 md:p-7`}

            >

              <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>

              <ul className="mt-4 space-y-2">

                {group.items.map((item) => (

                  <li key={item} className="text-sm text-gray-600">

                    {item}

                  </li>

                ))}

              </ul>

            </article>

          ))}

        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-gray-500">

          Preis und Umfang klären wir in Analyse und persönlichem Angebot — transparent und marktgerecht.

        </p>

      </BusinessSection>

      <BusinessSection className="border-y border-emerald-100 bg-emerald-50/40">

        <BusinessSectionIntro

          eyebrow={<BusinessEyebrow>{c.ownProductsBridge.eyebrow}</BusinessEyebrow>}

          title={c.ownProductsBridge.title}

          intro={c.ownProductsBridge.text}

          className={`max-w-3xl ${BUSINESS_VISUAL.sectionIntroMb}`}

        />

        <div className="text-center">

          <Link

            href={c.ownProductsBridge.href}

            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C853] hover:underline"

          >

            {c.ownProductsBridge.cta}

            <ArrowRight className="h-4 w-4" aria-hidden />

          </Link>

        </div>

      </BusinessSection>

      <BusinessSection className="relative overflow-hidden bg-gray-50">

        <BusinessSectionIntro

          eyebrow={<BusinessEyebrow>{c.process.eyebrow}</BusinessEyebrow>}

          title={c.process.title}

          className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}

        />

        <div className="mx-auto max-w-5xl">

          <ProcessTimeline steps={c.process.steps} />

        </div>

      </BusinessSection>

      <PremiumCta

        title="Welche Leistung passt zu Ihnen?"

        text="Wir beraten Sie persönlich und unverbindlich — und finden gemeinsam die Lösung, die zu Ihrem Unternehmen passt."

        cta="Erstberatung anfragen"

        mockVariant="dashboard"

      />

    </>

  );

}

