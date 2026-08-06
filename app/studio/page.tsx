import { CtaLink, LegalPage } from "@/components/landing/LegalPage";
import { BUSINESS_CONTENT } from "@/lib/constants/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UNZE Studio",
  description: "UNZE Studio - Webseiten, Hosting, Agenturleistungen und Business-Angebote.",
};

export default function StudioPage() {
  const mailSubject = encodeURIComponent("UNZE Studio Anfrage");
  const mailBody = encodeURIComponent(
    "Hallo UNZE Team,\n\nich interessiere mich für UNZE Studio / Business-Angebote.\n\n",
  );
  const mailHref = `mailto:${BUSINESS_CONTENT.email}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <LegalPage title="UNZE Studio">
      <p className="text-lg font-medium text-gray-800">
        Webseiten, Hosting, Servicepakete und Agenturleistungen für Creator und Unternehmen.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        UNZE Studio ist der Business-Bereich von UNZE. Er wird schrittweise ausgebaut und bleibt
        technisch von der Plattform-Datenbank getrennt. Aktuell kannst du uns für individuelle
        Anfragen kontaktieren.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-gray-600">
        {BUSINESS_CONTENT.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href={mailHref}>Anfrage senden</CtaLink>
        <CtaLink href="/business" variant="secondary">
          UNZE Business
        </CtaLink>
      </div>
    </LegalPage>
  );
}
