/** Absender-Daten für Angebote, Rechnungen, Briefkopf und E-Mail-Entwürfe (Impressum). */
export const STUDIO_COMPANY_PROFILE = {
  brandName: "UNZE",
  studioName: "UNZE Studio",
  legalName: "Patrick Becker",
  tagline: "Individuelle Software & Web-Lösungen",
  documentSubtitle: "UNZE Business · Patrick Becker",
  street: "Im Funkenstück 6",
  postalCode: "56567",
  city: "Neuwied",
  country: "Deutschland",
  phone: "+49 151 28959024",
  email: "support@unze.app",
  website: "www.unze.app",
  businessWebsite: "www.unze.app/business",
  logoSrc: "/brand/unze-logo.png",
  logoFallbackSrc: "/landing/unze-logo.png",
  taxNumber: "32/009/57934",
  /** Nur auf Angeboten, Rechnungen und in Studio-Dokumenten — nicht auf der öffentlichen Website */
  vatNote:
    "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).",
} as const;

export function formatCompanyAddressLines(): string[] {
  const p = STUDIO_COMPANY_PROFILE;
  return [
    p.brandName,
    p.legalName,
    p.street,
    `${p.postalCode} ${p.city}`,
    p.country,
  ];
}

export function formatCompanyContactLines(): string[] {
  const p = STUDIO_COMPANY_PROFILE;
  return [`Tel. ${p.phone}`, p.email, p.businessWebsite];
}

export function formatEmailSignature(): string {
  const p = STUDIO_COMPANY_PROFILE;
  return [
    "Mit freundlichen Grüßen",
    p.studioName,
    p.legalName,
    `${p.street}, ${p.postalCode} ${p.city}`,
    p.email,
    p.businessWebsite,
  ].join("\n");
}
