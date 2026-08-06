import type { CredentialCategory } from "@/types/credential";

export const CREDENTIAL_CATEGORY_OPTIONS: {
  value: CredentialCategory;
  label: string;
  displayTerm: string;
  description: string;
}[] = [
  {
    value: "certificate",
    label: "Zertifikat",
    displayTerm: "Zertifikat",
    description: "Qualifikationen, Abschlüsse, Nachweise",
  },
  {
    value: "community_award",
    label: "Community-Auszeichnung",
    displayTerm: "Community-Auszeichnung",
    description: "Auszeichnungen auf Community-Ebene",
  },
  {
    value: "group_award",
    label: "Gruppen-Auszeichnung",
    displayTerm: "Gruppen-Auszeichnung",
    description: "Auszeichnungen für Gruppen oder Bereiche",
  },
  {
    value: "event_award",
    label: "Event-Auszeichnung",
    displayTerm: "Teilnahmezertifikat",
    description: "Teilnahme, Check-in, Turnier",
  },
  {
    value: "course_award",
    label: "Kurs-Auszeichnung",
    displayTerm: "Abschlusszertifikat",
    description: "Kurse und Lernpfade",
  },
  {
    value: "service_award",
    label: "Service-Auszeichnung",
    displayTerm: "Service-Nachweis",
    description: "Services",
  },
  {
    value: "product_award",
    label: "Produkt-Auszeichnung",
    displayTerm: "Kauf-Nachweis",
    description: "Produkte und Käufe",
  },
  {
    value: "verification",
    label: "Verifizierung",
    displayTerm: "Verifizierungsnachweis",
    description: "Bestätigte Identität oder Status",
  },
  {
    value: "achievement",
    label: "Erfolg (Achievement)",
    displayTerm: "Erfolg",
    description: "Meilensteine und Gamification",
  },
  {
    value: "legacy",
    label: "Legacy",
    displayTerm: "Auszeichnung",
    description: "Import aus früherem Badge-System",
  },
];

export function getCredentialCategoryLabel(
  category: CredentialCategory | string | null | undefined,
) {
  return (
    CREDENTIAL_CATEGORY_OPTIONS.find((c) => c.value === category)?.label ??
    "Auszeichnung"
  );
}

/** Fachliche Bezeichnung für Nutzer-Oberfläche (Auszeichnung / Zertifikat / Qualifikation / Nachweis). */
export function getCredentialDisplayTerm(
  category: CredentialCategory | string | null | undefined,
  options?: { isCollectionQualification?: boolean },
) {
  if (options?.isCollectionQualification) {
    return "Qualifikation";
  }

  const match = CREDENTIAL_CATEGORY_OPTIONS.find((c) => c.value === category);
  return match?.displayTerm ?? "Auszeichnung";
}
