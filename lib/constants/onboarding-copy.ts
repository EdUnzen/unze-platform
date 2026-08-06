import { CTA_COMMUNITIES_DISCOVER } from "@/lib/constants/cta-copy";
import {
  HOME_VALUE_PROPS,
  PLATFORM_PILLAR_LIST,
  PLATFORM_SUBTITLE_ONBOARDING,
  PLATFORM_TAGLINE_WITH_VERIFICATION,
} from "./platform-copy";

export const ONBOARDING_STORAGE_KEY = "unze-onboarding-complete-v1";

export const ONBOARDING_COPY = {
  title: "Willkommen bei UNZE",
  subtitle: PLATFORM_SUBTITLE_ONBOARDING,
  whatIsUnze: PLATFORM_TAGLINE_WITH_VERIFICATION,
  howItWorks:
    "Entdecke Communities, tritt Gruppen bei, nimm an Events teil, buche Services und sammle Auszeichnungen sowie Zertifikate — alles vernetzt.",
  pillars: HOME_VALUE_PROPS.map(({ title, description }) => ({
    title,
    description,
  })),
  discoverCta: CTA_COMMUNITIES_DISCOVER,
  installTitle: "UNZE installieren",
  installAndroidTitle: "Installation auf Android",
  installIosTitle: "Installation auf iPhone",
  installAndroid:
    "Tippe auf „App installieren“, um UNZE wie eine native App zu nutzen. Alternativ: Browser-Menü → „App installieren“ oder „Zum Startbildschirm hinzufügen“.",
  installIosIntro:
    "Auf dem iPhone funktioniert UNZE wie eine App über den Home-Bildschirm:",
  installIosSteps: [
    "Teilen-Symbol in Safari antippen",
    "„Zum Home-Bildschirm“ wählen",
    "„Hinzufügen“ bestätigen",
  ],
} as const;

/** Für Hilfetexte — konsistente Begriffe ohne HTML-Entities. */
export const ONBOARDING_PILLAR_LIST_SHORT = `${PLATFORM_PILLAR_LIST} erklärt`;
