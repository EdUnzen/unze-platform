/** Landingpage-Inhalte - Marketing-only (www.unze.app) */
import { CTA_APP_USE, CTA_CREATOR, CTA_PROJECT_INQUIRY } from "@/lib/constants/cta-copy";
import { PLATFORM_TAGLINE } from "@/lib/constants/platform-copy";

export const LANDING_SEO = {
  title: "UNZE – Plattform & digitale Lösungen",
  description:
    "UNZE Connect ist die Plattform für Communities im DACH-Raum. UNZE Business entwickelt individuelle Web-Apps, Plattformen und Automatisierungen.",
  ogUrl: "https://www.unze.app",
  themeColor: "#00C853",
} as const;

export const LANDING_SEARCH_CATEGORIES = [
  "Bildung",
  "Business",
  "Entertainment",
  "Fitness",
  "Fotografie",
  "Gaming",
  "Handwerk",
  "Musik",
  "Technik",
  "Sport",
] as const;

export const LANDING_HERO = {
  badge: "UNZE Connect",
  title: "Entdecke Communities.",
  subtitle: PLATFORM_TAGLINE,
  heroImage: "/landing/hero-light.webp",
} as const;

export const LANDING_WHY = {
  eyebrow: "Warum UNZE?",
  title: "Mehr als ein Link zu Discord oder WhatsApp",
  intro:
    "Klassische Community-Plattformen sind oft unübersichtlich, schwer monetarisierbar und bieten wenig Vertrauen. UNZE ist eine Plattform, die Communities sichtbar macht und Struktur schafft.",
  differentiators: [
    {
      title: "Struktur statt Chaos",
      text: "Gruppen, Events, Services und Rollen – alles an einem Ort, klar organisiert und für Mitglieder verständlich.",
    },
    {
      title: "Vertrauen durch Transparenz",
      text: "Bewertungen und Verifizierung helfen dir, seriöse Communities von leeren Versprechen zu unterscheiden.",
    },
    {
      title: "Qualifikationen, die bleiben",
      text: "Auszeichnungen und Zertifikate gehören dir als Nutzer – Communities vergeben sie, du entscheidest, was sichtbar ist.",
    },
    {
      title: "Monetarisierung optional",
      text: "Creator können Premium-Communities, Events und Services anbieten – mit sicherer Zahlungsabwicklung über Stripe.",
    },
  ],
} as const;

export const LANDING_MEMBER_BENEFITS = {
  eyebrow: "Für Mitglieder",
  title: "Finde Communities, denen du vertrauen kannst",
  items: [
    {
      title: "Entdecken & vergleichen",
      text: "Durchsuche Communities nach Kategorie, lies Bewertungen und erkenne verifizierte Projekte auf einen Blick.",
    },
    {
      title: "Qualifikationen sammeln",
      text: "Erhalte Auszeichnungen und Zertifikate von Communities – sie gehören dir und können Zugang zu Gruppen, Events oder Services eröffnen.",
    },
    {
      title: "Strukturierter Beitritt",
      text: "Tritt Communities mit klaren Regeln, Gruppen und Events bei – direkt in der UNZE Connect App.",
    },
    {
      title: "Deine Sichtbarkeit",
      text: "Du bestimmst, welche Auszeichnungen auf deinem Profil erscheinen – deine digitale Identität, deine Entscheidung.",
    },
  ],
} as const;

export const LANDING_MONETIZATION = {
  eyebrow: "Monetarisierung",
  title: "Creator verdienen – Mitglieder zahlen sicher",
  intro:
    "Premium-Communities, kostenpflichtige Events und buchbare Services: Creator entscheiden selbst, ob und wie sie monetarisieren. Zahlungen laufen über Stripe – transparent und sicher.",
  points: [
    "Premium-Communities mit monatlicher oder einmaliger Mitgliedschaft",
    "Events mit Ticketverkauf und Check-in-Qualifikationen",
    "Buchbare Services direkt in der Community",
    "Crowd Partner für gemeinsame Projekte und Revenue-Sharing",
  ],
  cta: "Als Creator starten",
  ctaHref: "/auth/login?mode=signup",
} as const;

export const LANDING_QUALIFICATIONS = {
  eyebrow: "Auszeichnungen & Zertifikate",
  title: "Deine Qualifikationen – für immer deins",
  intro:
    "Auszeichnungen und Zertifikate gehören grundsätzlich dem Nutzer. Communities vergeben sie – die Community besitzt sie nicht. Sie dokumentieren deine Leistung, Teilnahme oder Qualifikation.",
  uses: [
    {
      title: "Zugang zu Communities",
      text: "Creator können optional Voraussetzungen definieren – z. B. bestimmte Zertifikate für den Beitritt.",
    },
    {
      title: "Zugang zu Gruppen",
      text: "Exklusive Gruppen nur für Mitglieder mit passenden Qualifikationen.",
    },
    {
      title: "Zugang zu Events",
      text: "Events können Check-in-Auszeichnungen vergeben oder bestimmte Qualifikationen voraussetzen.",
    },
    {
      title: "Zugang zu Services",
      text: "Buchbare Services nur für qualifizierte Mitglieder – optional durch Creator konfigurierbar.",
    },
  ],
  note:
    "Du entscheidest selbst, welche Auszeichnungen auf deinem öffentlichen Profil sichtbar sind. Bei öffentlichen Rollen (Creator, Moderator, Coach) können rollenrelevante Qualifikationen verpflichtend sichtbar sein.",
} as const;

export const LANDING_COMMUNITY_BADGES = {
  eyebrow: "Community-Badges",
  title: "Automatische Plattform-Auszeichnungen",
  intro:
    "Community-Badges sind automatische Auszeichnungen für Communities – vergeben ausschließlich durch UNZE. Creator und Nutzer haben darauf keinen Einfluss.",
  badges: [
    {
      label: "Verifiziert",
      text: "Community wurde von UNZE geprüft und verifiziert.",
    },
    {
      label: "Beliebt",
      text: "Besonders viel Aktivität und Wachstum in kurzer Zeit.",
    },
    {
      label: "Besonders aktiv",
      text: "Regelmäßige Events, Services oder Mitgliederaktivität.",
    },
    {
      label: "Stark wachsend",
      text: "Schnelles Mitgliederwachstum und steigende Community-Qualität.",
    },
  ],
  distinction:
    "Community-Badges zeigen den Status einer Community. Auszeichnungen und Zertifikate zeigen deine persönlichen Qualifikationen – zwei getrennte Systeme für mehr Klarheit.",
} as const;

export const LANDING_BETA = {
  eyebrow: "Beta-Phase",
  title: "Jetzt einsteigen lohnt sich",
  intro:
    "UNZE Connect ist live und wächst. Als früher Creator oder aktives Mitglied baust du Reputation, Netzwerk und Sichtbarkeit auf – bevor die Plattform breiter skaliert.",
  reasons: [
    "Frühe Creator erhalten mehr Sichtbarkeit im Verzeichnis",
    "Auszeichnungen und Qualifikationen bleiben dauerhaft in deinem Profil",
    "Direkter Einfluss auf Produktentwicklung durch Beta-Feedback",
    "Keine versteckten Kosten für Mitglieder – Premium ist optional",
  ],
  cta: "Beta beitreten",
  ctaHref: "/auth/login?mode=signup",
} as const;

export const LANDING_STATS = [
  { label: "Mitglieder", value: "12.400+" },
  { label: "Communities", value: "9+" },
] as const;

export const LANDING_ABOUT = {
  title: "Was ist UNZE?",
  intro:
    "UNZE ist die Plattform für Communities im deutschsprachigen Raum. Wir bringen Menschen zusammen, die gemeinsame Interessen teilen.",
  pillars: [
    {
      title: "Entdecken",
      text: "Durchsuche Communities aus Gaming, Fitness, Technik, Business und vielen weiteren Bereichen.",
    },
    {
      title: "Verbinden",
      text: "Finde Gleichgesinnte und tritt Communities bei, die zu deinen Interessen passen.",
    },
    {
      title: "Wachsen",
      text: "Erstelle deine eigene Community und baue eine engagierte Gemeinschaft auf.",
    },
  ],
  image: "/landing/about-people.webp",
  imageAlt: "Menschen verbinden sich über UNZE",
} as const;

export const LANDING_FEATURES = {
  title: "Was UNZE Connect bietet",
  subtitle:
    "Alles, was du brauchst, um Communities zu finden, kennenzulernen und der Plattform beizutreten – klar getrennt von der Marketing-Website.",
  items: [
    {
      title: "Community-Verzeichnis",
      text: "Durchsuche Communities nach Kategorie und Interessen. Finde genau die Gruppe, die zu dir passt.",
    },
    {
      title: "Bewertungen",
      text: "Lies echte Bewertungen anderer Mitglieder und erkenne verifizierte Communities auf einen Blick.",
    },
    {
      title: "Strukturierter Beitritt",
      text: "Tritt Communities mit klaren Strukturen, Gruppen und Events bei – direkt in der App.",
    },
    {
      title: "Verifizierung & Vertrauen",
      text: "Verifizierte Communities und Auszeichnungen schaffen Transparenz.",
    },
    {
      title: "Premium Communities",
      text: "Monetarisierte Communities mit sicherer Zahlungsabwicklung – optional für Creator.",
    },
    {
      title: "Multi-Plattform",
      text: "Verbinde Discord, Telegram, WhatsApp und mehr – zentral über UNZE verwaltet.",
    },
  ],
} as const;

export const LANDING_NETWORK = {
  title: "Dein Netzwerk wartet",
  paragraphs: [
    "UNZE macht Communities sichtbar und verbindet Menschen mit gemeinsamen Interessen. Von offenen Gruppen bis hin zu Premium-Communities mit exklusiven Inhalten.",
    "Entdecke Communities auf dieser Website – Beitritt, Verwaltung und App-Funktionen ausschließlich auf UNZE Connect.",
  ],
  cta: CTA_APP_USE,
} as const;

export const LANDING_CTA = {
  title: "Bereit für UNZE Connect?",
  subtitle:
    "Installiere die App, tritt Communities bei – oder starte dein eigenes Projekt mit UNZE Business.",
  primary: CTA_APP_USE,
  secondary: "Communities ansehen",
  secondaryHref: "/communities",
  image: "/landing/cta-community.webp",
} as const;

export const LANDING_CREATOR = {
  eyebrow: "Für Creator",
  title: "Deine Community. Deine Regeln. Dein Business.",
  intro:
    "Als Creator verwaltest du Mitglieder, Gruppen, Events und Services in UNZE Connect – mit Dashboard, Rollen, Auszeichnungen und optionaler Monetarisierung über Stripe.",
  points: [
    "Creator-Dashboard mit Statistiken, Mitglieder- und Umsatzübersicht",
    "Gruppen, Events, Services und Moderatoren zentral verwalten",
    "Auszeichnungen und Zertifikate vergeben – als Zugangsvoraussetzungen nutzbar",
    "Verifizierung und Sichtbarkeit im öffentlichen Community-Verzeichnis",
    "Crowd Partner und Revenue-Sharing für gemeinsame Projekte",
  ],
  stats: [
    { label: "Communities", value: "9+" },
    { label: "Mitglieder", value: "12.400+" },
    { label: "Events", value: "Live" },
    { label: "Services", value: "Buchbar" },
  ],
  cta: CTA_CREATOR,
  ctaHref: "/auth/login?mode=signup",
} as const;

export const LANDING_BUSINESS_BAND = {
  eyebrow: "UNZE Business",
  title: "Individuelle digitale Lösungen",
  description:
    "Webseiten, Plattformen, Communities und Automatisierung – entwickelt von UNZE Business, betrieben auf professioneller Infrastruktur.",
  cta: CTA_PROJECT_INQUIRY,
  href: "/business",
} as const;

export const LANDING_COMMUNITY_TEASER = {
  eyebrow: "Mehr entdecken",
  title: "Community-Verzeichnis durchsuchen",
  description: "Live-Daten aus UNZE Connect — filterbar nach Kategorie und Interesse.",
  cta: "Vollständiges Verzeichnis öffnen",
} as const;

export const COMMUNITIES_PAGE = {
  eyebrow: "UNZE Connect",
  title: "Entdecke Communities.",
  description:
    "Stöbere, filtere und finde Communities – live aus UNZE Connect. Demo-Einträge sind als Demo gekennzeichnet.",
} as const;

export const LANDING_NAV = [
  { label: "Communities", href: "/communities" },
  { label: "UNZE Business", href: "/business" },
] as const;

export const LANDING_FOOTER = {
  tagline:
    "UNZE Connect ist die Plattform für Communities. UNZE Business entwickelt individuelle digitale Produkte.",
  platform: [
    { label: "Communities", href: "/communities" },
    { label: "UNZE Business", href: "/business" },
    { label: "App nutzen", href: "__APP__" },
  ],
  legal: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutzerklärung", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
  ],
  contact: {
    email: "support@unze.app",
    web: "www.unze.app",
  },
  copyright: `© ${new Date().getFullYear()} UNZE. Alle Rechte vorbehalten.`,
} as const;
