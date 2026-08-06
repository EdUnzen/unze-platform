import { LegalPage, LegalSection } from "@/components/landing/LegalPage";
import { DATENSCHUTZ_SECTIONS } from "@/lib/constants/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung der UNZE Plattform.",
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      {DATENSCHUTZ_SECTIONS.map((section) => (
        <LegalSection
          key={section.title}
          title={section.title}
          body={"body" in section ? section.body : undefined}
          subsections={"subsections" in section ? section.subsections : undefined}
        />
      ))}
    </LegalPage>
  );
}
