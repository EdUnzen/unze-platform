/**
 * Geschlossene Beta - zentrale Kommunikation (Marketing read-only).
 * Nach Plattformstart: NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA=false setzen.
 */
import { getRegisterUrl, platformUrl } from "@/lib/constants/site";
import { CTA_COMMUNITIES_DISCOVER, CTA_CREATOR } from "@/lib/constants/cta-copy";

/** Geschlossene Beta aktiv (Default: true bis offizieller Start). */
export function isClosedBeta(): boolean {
  return process.env.NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA !== "false";
}

export const BETA_BANNER = {
  label: "Geschlossene Beta",
  message:
    "UNZE Connect befindet sich in der geschlossenen Beta. Creator und Crowd Partner gesucht – Demo-Communities dienen der Plattform-Demonstration.",
  href: "/#beta-status",
  linkLabel: "Beta-Status",
} as const;

export const BETA_HERO = {
  badge: "Geschlossene Beta",
  title: "Finde deine Community.",
  subtitle:
    "Entdecke lebendige Communities – oder werde Creator und Crowd Partner in der Beta.",
} as const;

export const BETA_TRANSPARENCY = {
  eyebrow: "Beta-Status",
  title: "Transparent. Ehrlich. Im aktiven Ausbau.",
  intro:
    "Während der geschlossenen Beta entwickeln wir UNZE Connect gemeinsam mit ausgewählten Creators weiter. Hier siehst du, was bereits produktiv ist und was sich noch im Test befindet.",
  demo: {
    title: "Demo-Communities",
    text:
      "Einige Communities dienen ausschließlich der Demonstration der Plattform. Sie sind in der App und im Verzeichnis als Demo gekennzeichnet. Nach dem offiziellen Plattformstart werden Demo-Communities entfernt – dann zeigen wir ausschließlich echte Creator-Communities.",
  },
  payments: {
    title: "Zahlungen & Monetarisierung",
    text:
      "Während der Beta sind keine offiziellen kostenpflichtigen Community-Mitgliedschaften oder produktiven Zahlungsprozesse vorgesehen. Kostenlose Communities können bereits getestet werden. Stripe, Monetarisierung und produktive Zahlungsabläufe werden erst nach erfolgreichem Abschluss der Beta freigeschaltet.",
  },
  crowdPartner: {
    title: "Crowd Partner",
    text:
      "Ausgewählte Creator können während der Beta am Crowd-Partner-Programm teilnehmen: persönlicher Empfehlungslink, automatische Zuordnung neuer Registrierungen, Auswertungen im Creator-Dashboard und vollständiger Test der Referral-Logik.",
  },
  afterLaunch: {
    title: "Nach dem Plattformstart",
    text:
      "Automatischer Wechsel in den Produktivmodus: Demo-Communities entfernt, Zahlungsfunktionen aktiviert, echte Creator-Communities veröffentlicht, Beta-Hinweise reduziert. Die Landingpage wird zur offiziellen Produktpräsentation von UNZE Connect.",
  },
} as const;

export type BetaFeatureStatus = "live" | "beta" | "planned";

export const BETA_FEATURE_STATUS: ReadonlyArray<{
  feature: string;
  status: BetaFeatureStatus;
  note: string;
}> = [
  {
    feature: "Kostenlose Communities",
    status: "live",
    note: "Beitritt und Nutzung in der Beta testbar",
  },
  {
    feature: "Demo-Communities",
    status: "beta",
    note: "Zur Plattform-Demonstration, nach Start entfernt",
  },
  {
    feature: "Creator-Dashboard",
    status: "live",
    note: "Mitglieder, Gruppen, Events, Services",
  },
  {
    feature: "Auszeichnungen & Zertifikate",
    status: "beta",
    note: "Funktional, Daten nach Start produktiv",
  },
  {
    feature: "Crowd Partner",
    status: "beta",
    note: "Ausgewählte Creator, Referral-Logik im Test",
  },
  {
    feature: "Stripe & Premium-Zahlungen",
    status: "planned",
    note: "Freischaltung nach Beta-Abschluss",
  },
  {
    feature: "Verifizierungen & Bewertungen",
    status: "beta",
    note: "Aktiv, nach Start nur produktive Daten",
  },
];

export const BETA_STATUS_LABELS: Record<BetaFeatureStatus, string> = {
  live: "Produktiv",
  beta: "Beta-Test",
  planned: "Nach Beta",
};

export const BETA_CTAS = {
  creator: {
    label: CTA_CREATOR,
    href: getRegisterUrl(),
  },
  crowdPartner: {
    label: "Crowd Partner",
    href: platformUrl("/dashboard/crowd-partner"),
  },
  explore: {
    label: CTA_COMMUNITIES_DISCOVER,
    href: "/communities",
  },
} as const;

export const BETA_LANDING_CREATOR = {
  eyebrow: "Creator & Crowd Partner gesucht",
  title: "Wachse mit UNZE in der Beta",
  intro:
    "In der geschlossenen Beta suchen wir ausgewählte Creator und Crowd Partner. Du testest die Plattform, gibst Feedback und baust deine Community auf – gemeinsam mit UNZE.",
  points: [
    "Voller Zugang zum Creator-Dashboard",
    "Persönlicher Empfehlungslink – automatisch erstellt",
    "Referral-Tracking und Auswertungen im Dashboard",
    "Demo-Communities zeigen alle Funktionen live",
    "Premium-Zahlungen erst nach offiziellem Plattformstart",
  ],
  cta: "Creator werden",
  ctaHref: getRegisterUrl(),
} as const;

export const BETA_CREATOR_BAND = {
  eyebrow: "Creator & Crowd Partner gesucht",
  title: "Gestalte UNZE Connect mit",
  intro:
    "Als Beta-Creator testest du alle Funktionen, gibst Feedback und baust deine Community auf – bevor die Plattform öffentlich skaliert. Crowd Partner testen zusätzlich die Referral-Logik mit persönlichem Link und Dashboard-Auswertungen.",
  points: [
    "Früher Zugang zu allen Creator-Funktionen",
    "Sichtbarkeit im Community-Verzeichnis",
    "Direkter Einfluss auf die Produktentwicklung",
    "Crowd Partner: Empfehlungslink und Auswertungen",
  ],
} as const;

export const BETA_MONETIZATION = {
  eyebrow: "Monetarisierung",
  title: "Geplant nach Beta-Abschluss",
  intro:
    "Premium-Communities, kostenpflichtige Events und buchbare Services sind technisch vorbereitet, aber während der Beta nicht produktiv. Nach dem offiziellen Start werden Stripe und alle Zahlungsabläufe freigeschaltet.",
  points: [
    "Premium-Communities (Stripe) – nach Beta",
    "Event-Tickets und Services – nach Beta",
    "Kostenlose Communities – jetzt testbar",
    "Crowd Partner – ausgewählte Creator in der Beta",
  ],
  cta: "Creator werden",
  ctaHref: getRegisterUrl(),
} as const;
