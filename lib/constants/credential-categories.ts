import type { CredentialCategory } from "@/types/credential";

export const CREDENTIAL_CATEGORY_OPTIONS: {
  value: CredentialCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "certificate",
    label: "Zertifikat",
    description: "Qualifikationen, Abschl\u00fcsse, Nachweise",
  },
  {
    value: "community_award",
    label: "Community-Auszeichnung",
    description: "Auszeichnungen auf Community-Ebene",
  },
  {
    value: "group_award",
    label: "Gruppen-Auszeichnung",
    description: "Auszeichnungen f\u00fcr Gruppen oder Bereiche",
  },
  {
    value: "event_award",
    label: "Event-Auszeichnung",
    description: "Teilnahme, Check-in, Turnier",
  },
  {
    value: "course_award",
    label: "Kurs-Auszeichnung",
    description: "Kurse und Lernpfade (geplant)",
  },
  {
    value: "service_award",
    label: "Service-Auszeichnung",
    description: "Dienstleistungen und Services",
  },
  {
    value: "product_award",
    label: "Produkt-Auszeichnung",
    description: "Produkte und K\u00e4ufe (geplant)",
  },
  {
    value: "verification",
    label: "Verifizierung",
    description: "Best\u00e4tigte Identit\u00e4t oder Status",
  },
  {
    value: "achievement",
    label: "Erfolg (Achievement)",
    description: "Meilensteine und Gamification",
  },
  {
    value: "legacy",
    label: "Legacy",
    description: "Import aus fr\u00fcherem Badge-System",
  },
];

export function getCredentialCategoryLabel(category: CredentialCategory | string | null | undefined) {
  return (
    CREDENTIAL_CATEGORY_OPTIONS.find((c) => c.value === category)?.label ??
    "Auszeichnung"
  );
}
