import { DEVICE_VIEWPORT_ASPECT } from "@/lib/constants/business-mockup-standard";

/** Einheitliche Abstände, Proportionen und Formensprache — Qualitätsstandard Design */
export const BUSINESS_VISUAL = {
  /** Desktop/Laptop-Viewport — siehe business-mockup-standard.ts */
  screenshotAspect: DEVICE_VIEWPORT_ASPECT.laptop,
  photoAspect: "aspect-[4/3]",
  /** Mockup-Showcase: Abstand Mockup ↔ Nachbar-Element */
  mockupBreathingRoom: "p-6 md:p-8 lg:p-10",
  /** Abstand Überschrift → Inhalt */
  sectionIntroMb: "mb-16 md:mb-20",
  sectionContentMt: "mt-16 md:mt-20",
  /** Abstand zwischen großen Showcase-Blöcken */
  showcaseStack: "space-y-24 md:space-y-32",
  featureStack: "space-y-24 md:space-y-32",
  featureGrid: "grid items-start gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-24",
  cardGrid: "grid gap-8 md:gap-10 lg:gap-12",
  /** Durchgängig weiche Formen — keine Mischung eckig/rund */
  cardRadius: "rounded-3xl",
  containerRadius: "rounded-3xl",
  showcaseCard: "rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10 lg:p-12",
  figureGap: "space-y-6",
  captionMt: "mt-6",
  /** Dezenter Sektions-Link — einheitlich auf der Startseite */
  sectionLink:
    "inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 hover:underline hover:underline-offset-4",
} as const;
