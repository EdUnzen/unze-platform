import { LegalPage, LegalSection } from "@/components/landing/LegalPage";
import { AGB_SECTIONS } from "@/lib/constants/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von UNZE.",
};

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      {AGB_SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title} body={section.body} />
      ))}
    </LegalPage>
  );
}
