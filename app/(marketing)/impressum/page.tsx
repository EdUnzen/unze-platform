import { LegalPage, LegalSection } from "@/components/landing/LegalPage";
import { IMPRESSUM_SECTIONS } from "@/lib/constants/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von UNZE.",
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      {IMPRESSUM_SECTIONS.map((section) => (
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
