import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";

/** Präsentationsgröße — steuert Mindesthöhe und Lesbarkeit */
export type MockupPresentation = "hero" | "standard" | "card" | "thumbnail" | "compact";

/**
 * Verbindlicher Mockup-Standard UNZE Business.
 * SSOT: CORSA_MASTER_STANDARD/01_Kernsystem/Business_Mockup_Praesentations_Standard.md
 */
export const BUSINESS_MOCKUP_STANDARD = {
  principle:
    "Ein Screenshot darf niemals nur Dekoration sein. Der Besucher muss innerhalb weniger Sekunden erkennen, was er sieht, wie professionell das Produkt aufgebaut ist und welchen Nutzen es bietet.",
  objectFit: "contain" as const,
  screenshotQuality: 92,
  /** Innenabstand im Viewport (Browser-Inhalt) */
  viewportPadding: "p-0",
  /** Abstand Mockup → Caption */
  captionGap: "mt-5 md:mt-6",
} as const;

/** Natürliche Viewport-Proportionen pro Gerät — kein Erzwingen falscher Ratio */
export const DEVICE_VIEWPORT_ASPECT: Record<DeviceVariant, string> = {
  laptop: "aspect-[16/10]",
  desktop: "aspect-[16/10]",
  tablet: "aspect-[3/4]",
  phone: "aspect-[9/19]",
};

/** Mindesthöhen — Lesbarkeit vor Dekoration */
export const PRESENTATION_MIN_HEIGHT: Record<MockupPresentation, string> = {
  hero: "min-h-[240px] sm:min-h-[300px] md:min-h-[380px] lg:min-h-[440px]",
  standard: "min-h-[200px] md:min-h-[280px]",
  card: "min-h-[160px] md:min-h-[200px]",
  thumbnail: "min-h-[120px] max-h-[200px]",
  compact: "min-h-[80px] md:min-h-[100px]",
};

/** Phone-Showcase: feste Breite, volle Proportion */
export const PHONE_SHOWCASE_WIDTH = "w-full max-w-[280px]";

export function mockupViewportClass(
  device: DeviceVariant,
  presentation: MockupPresentation = "standard",
): string {
  const aspect = DEVICE_VIEWPORT_ASPECT[device];
  const minH = PRESENTATION_MIN_HEIGHT[presentation];
  return `${aspect} ${minH} w-full`;
}

export const MOCKUP_DESIGN_DIRECTIVE =
  "Screenshots und App-Vorschauen immer vollständig und proportional (object-fit: contain) in passenden DeviceFrames darstellen. UNZE-Connect-UI als Referenz für Mockups — Inhalte anonymisieren. Keine Verzerrung, kein unkontrolliertes Beschneiden.";
