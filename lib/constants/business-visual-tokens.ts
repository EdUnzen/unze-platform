import { DEVICE_VIEWPORT_ASPECT } from "@/lib/constants/business-mockup-standard";

/** Einheitliche Abstände, Proportionen und Formensprache — Qualitätsstandard Design */
export const BUSINESS_VISUAL = {
  /** Desktop/Laptop-Viewport — siehe business-mockup-standard.ts */
  screenshotAspect: DEVICE_VIEWPORT_ASPECT.laptop,
  photoAspect: "aspect-[4/3]",
  /** Mockup-Showcase: Abstand Mockup ↔ Nachbar-Element */
  mockupBreathingRoom: "p-8 md:p-10 lg:p-12",
  /** Abstand Überschrift → Inhalt */
  sectionIntroMb: "mb-20 md:mb-24",
  sectionContentMt: "mt-20 md:mt-24",
  /** Abstand zwischen großen Showcase-Blöcken */
  showcaseStack: "space-y-28 md:space-y-36",
  featureStack: "space-y-28 md:space-y-36",
  featureGrid: "grid items-start gap-14 lg:grid-cols-2 lg:gap-24 xl:gap-28",
  cardGrid: "grid gap-10 md:gap-12 lg:gap-14",
  /** Durchgängig weiche Formen — keine Mischung eckig/rund */
  cardRadius: "rounded-3xl",
  containerRadius: "rounded-3xl",
  showcaseCard: "rounded-3xl border border-gray-100 bg-white p-9 shadow-sm md:p-11 lg:p-14",
  figureGap: "space-y-7",
  captionMt: "mt-7",
  /** Dezenter Sektions-Link — einheitlich auf der Startseite */
  sectionLink:
    "inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 hover:underline hover:underline-offset-4",
} as const;
