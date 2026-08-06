import { ContactCard, CtaLink, LegalPage } from "@/components/landing/LegalPage";
import { KONTAKT_CONTENT } from "@/lib/constants/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt zu UNZE — support@unze.app",
};

export default function KontaktPage() {
  return (
    <LegalPage title={KONTAKT_CONTENT.title}>
      <p className="text-sm leading-relaxed text-gray-600">{KONTAKT_CONTENT.intro}</p>
      <ContactCard
        email={KONTAKT_CONTENT.email}
        phone={KONTAKT_CONTENT.phone}
        address={KONTAKT_CONTENT.address}
      />
      <div className="mt-8">
        <CtaLink href={`mailto:${KONTAKT_CONTENT.email}`}>E-Mail senden</CtaLink>
      </div>
    </LegalPage>
  );
}
