/**
 * Professionelle Business-Fotografie (Unsplash License) — Startseite & Marketing.
 * Hochwertig, modern, B2B-tauglich. Alle URLs regelmäßig per HEAD geprüft.
 * Unsplash: kostenlose Nutzung inkl. kommerzieller Projekte, ohne Pflicht-Attribution.
 */

import { MY_ORGANIZER_AI_HERO } from "@/lib/constants/business-product-assets";

const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const BUSINESS_IMAGERY = {
  hero: {
    poster: u("photo-1497366216548-37526070297c", 1920),
    feature: u("photo-1486312338219-ce68d2c6f44d", 1400),
    alt: "Modernes Büro mit Team bei der Zusammenarbeit",
    featureAlt: "Professionelle digitale Unternehmenslösung am Arbeitsplatz",
  },
  analysis: {
    main: u("photo-1556761175-5973dc0f32e7", 1200),
    alt: "Strategische Unternehmensanalyse im Team-Meeting",
    ai: {
      src: u("photo-1677442136019-21780ecad995", 1000),
      alt: "KI-gestützte Datenauswertung und Analyse-Vorarbeit",
    },
    workflow: {
      src: u("photo-1553877522-43269d4ea984", 1000),
      alt: "Beratungsgespräch und strukturierter Analyse-Ablauf",
    },
    report: {
      src: u("photo-1551288049-bebda4e38f71", 1000),
      alt: "Analysebericht mit Kennzahlen und Dashboard-Auswertung",
    },
    areas: {
      website: {
        src: u("photo-1467232004584-a241de8bcf5d", 800),
        alt: "Website und digitaler Auftritt im Fokus",
      },
      processes: {
        src: u("photo-1551434678-e076c223a692", 800),
        alt: "Geschäftsprozesse und Software am Arbeitsplatz",
      },
      digital: {
        src: u("photo-1550751827-4bd374c3f58b", 800),
        alt: "Digitalisierung und technologische Potenziale",
      },
      strategy: {
        src: u("photo-1521737711867-e3b97375f902", 800),
        alt: "Strategieplanung und Roadmap-Entwicklung",
      },
    },
    benefits: {
      clarity: {
        src: u("photo-1556761175-b413da4baf72", 800),
        alt: "Klarheit vor der Investitionsentscheidung",
      },
      advisory: {
        src: u("photo-1522202176988-66273c2fd55f", 800),
        alt: "Partnerschaftliche Beratung auf Augenhöhe",
      },
      project: {
        src: u("photo-1497366216548-37526070297c", 800),
        alt: "Vom Analysebericht zum Umsetzungsprojekt",
      },
    },
  },
  problems: {
    digitalize: {
      src: u("photo-1551288049-bebda4e38f71", 800),
      alt: "Datenanalyse und Prozess-Digitalisierung",
    },
    professional: {
      src: u("photo-1467232004584-a241de8bcf5d", 800),
      alt: "Professioneller Webauftritt auf modernem Display",
    },
    scale: {
      src: u("photo-1556761175-b413da4baf72", 800),
      alt: "Wachsendes Team in modernem Arbeitsumfeld",
    },
  },
  services: {
    analyse: {
      src: u("photo-1553877522-43269d4ea984", 900),
      alt: "Beratungsgespräch zur Unternehmensanalyse",
    },
    "business-core": {
      src: u("photo-1551434678-e076c223a692", 900),
      alt: "Business-Software am Arbeitsplatz",
    },
    webseiten: {
      src: u("photo-1547658719-da2b51169166", 900),
      alt: "Webdesign und moderne Website-Gestaltung",
    },
    apps: {
      src: "/media/showcase/connect/discover.png",
      alt: "UNZE Connect — mobile App-Ansicht Discover",
    },
    ki: {
      src: u("photo-1677442136019-21780ecad995", 900),
      alt: "KI und intelligente Automatisierung",
    },
  },
  industries: {
    umzug: {
      src: u("photo-1600880292203-757bb62b4baf", 900),
      alt: "Logistik und Umzugsunternehmen im Einsatz",
    },
    reinigung: {
      src: u("photo-1560185007-cde436f6a4d0", 900),
      alt: "Professionelle Gebäudereinigung in modernem Umfeld",
    },
    handwerk: {
      src: u("photo-1581094794329-c8112a89af12", 900),
      alt: "Handwerk und technische Projektarbeit",
    },
    arztpraxis: {
      src: u("photo-1579684385127-1ef15d508118", 900),
      alt: "Moderne Arztpraxis mit freundlicher Empfangssituation",
    },
  },
  products: {
    connect: {
      src: u("photo-1522071820081-009f0129c71c", 900),
      alt: "Community-Plattform und vernetzte Teams",
    },
    organizer: {
      src: MY_ORGANIZER_AI_HERO.src,
      alt: MY_ORGANIZER_AI_HERO.alt,
    },
  },
  philosophy: {
    src: u("photo-1522202176988-66273c2fd55f", 1200),
    alt: "Partnerschaftliche Zusammenarbeit im Projekt",
  },
  why: {
    src: u("photo-1521737711867-e3b97375f902", 1400),
    alt: "Professionelles Entwicklungsteam bei der Arbeit",
  },
} as const;

export type BusinessServiceImageKey = keyof typeof BUSINESS_IMAGERY.services;

export function getServiceImageKey(href: string): BusinessServiceImageKey {
  if (href.includes("analyse")) return "analyse";
  if (href.includes("business-core")) return "business-core";
  if (href.includes("webseiten")) return "webseiten";
  if (href.includes("web-apps")) return "apps";
  if (href.includes("ki-automatisierung")) return "ki";
  return "business-core";
}
