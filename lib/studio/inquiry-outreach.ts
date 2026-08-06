import type { ProjectEstimate } from "@/lib/business/project-estimate.service";
import { formatEuroCents, formatEuroRange } from "@/lib/business/pricing-utils";
import {
  BRIEFING_COMPLETE_MESSAGE,
  BRIEFING_REQUIREMENTS,
  type BriefingReadiness,
} from "@/lib/constants/business-pricing-mastermind";
import { formatEmailSignature } from "@/lib/studio/company-profile";
import { describePaymentPlan } from "@/lib/studio/payment-plans";

export type InquiryEmailTemplateId =
  | "receipt_followup"
  | "briefing_incomplete"
  | "missing_texts"
  | "missing_logo"
  | "missing_images"
  | "missing_legal"
  | "missing_reference"
  | "project_start_after_briefing"
  | "payment_split_50_50"
  | "offer_in_preparation";

export type InquiryOutreachContext = {
  referenceId: string;
  contactName: string | null;
  contactEmail: string;
  company: string | null;
  inquiryType?: string;
  briefing?: BriefingReadiness | null;
  estimate?: ProjectEstimate | null;
};

export type InquiryEmailDraft = {
  templateId: InquiryEmailTemplateId;
  subject: string;
  body: string;
  mailtoHref: string;
};

export type InquiryEmailTemplateMeta = {
  id: InquiryEmailTemplateId;
  label: string;
  description: string;
};

export const INQUIRY_EMAIL_TEMPLATES: InquiryEmailTemplateMeta[] = [
  {
    id: "receipt_followup",
    label: "Eingang — freundliche Rückmeldung",
    description: "Anfrage bestätigen, Erstgespräch anbieten",
  },
  {
    id: "briefing_incomplete",
    label: "Briefing unvollständig",
    description: "Alle fehlenden Materialien auflisten",
  },
  {
    id: "missing_texts",
    label: "Texte fehlen",
    description: "Freundlich Texte anfordern — ohne Text kein Start",
  },
  {
    id: "missing_logo",
    label: "Logo fehlt",
    description: "Logo anfordern (PNG/SVG)",
  },
  {
    id: "missing_images",
    label: "Bilder fehlen",
    description: "Hero- und Referenzbilder anfordern",
  },
  {
    id: "missing_legal",
    label: "Rechtstexte fehlen",
    description: "Impressum & Datenschutz anfordern",
  },
  {
    id: "missing_reference",
    label: "Referenz-Template unklar",
    description: "Branche/Vorlage aus Designsystem klären",
  },
  {
    id: "project_start_after_briefing",
    label: "Start erst nach Material",
    description: "Lieferzeit beginnt ab vollständigem Briefing",
  },
  {
    id: "payment_split_50_50",
    label: "Zahlung 50 / 50",
    description: "Standard: 50 % Anzahlung, 50 % bei Abnahme",
  },
  {
    id: "offer_in_preparation",
    label: "Angebot in Vorbereitung",
    description: "Angebot folgt in Kürze",
  },
];

const BRIEFING_CHECKS = [
  { key: "hasLogo" as const, templateId: "missing_logo" as const, itemLabel: "Logo (PNG oder SVG)" },
  { key: "hasTexts" as const, templateId: "missing_texts" as const, itemLabel: "Texte (Leistungen, Über uns, Kontakt)" },
  { key: "hasImages" as const, templateId: "missing_images" as const, itemLabel: "Bilder (Hero, optional Team/Referenzen)" },
  {
    key: "hasLegalTexts" as const,
    templateId: "missing_legal" as const,
    itemLabel: "Impressum & Datenschutz",
  },
  {
    key: "hasReference" as const,
    templateId: "missing_reference" as const,
    itemLabel: "Referenz-Template / Branche aus unserem Designsystem",
  },
];

function mailto(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function greeting(name: string | null): string {
  return name ? `Hallo ${name},` : "Sehr geehrte Damen und Herren,";
}

function refLine(referenceId: string): string {
  return `Ihre Referenznummer: ${referenceId}`;
}

function companyLine(company: string | null): string | null {
  return company ? `Unternehmen: ${company}` : null;
}

export function getMissingBriefingItems(briefing?: BriefingReadiness | null): string[] {
  if (!briefing) {
    return BRIEFING_REQUIREMENTS.filter((r) => r.required).map((r) => r.label);
  }

  const missing: string[] = [];
  for (const check of BRIEFING_CHECKS) {
    if (!briefing[check.key]) {
      missing.push(check.itemLabel);
    }
  }
  return missing;
}

export function isBriefingComplete(briefing?: BriefingReadiness | null): boolean {
  if (!briefing) return false;
  return BRIEFING_CHECKS.every((check) => Boolean(briefing[check.key]));
}

export function suggestInquiryEmailTemplate(
  context: InquiryOutreachContext,
): InquiryEmailTemplateId {
  const missing = getMissingBriefingItems(context.briefing);

  if (missing.length > 0) {
    if (!context.briefing?.hasTexts) return "missing_texts";
    if (!context.briefing?.hasLogo) return "missing_logo";
    if (!context.briefing?.hasImages) return "missing_images";
    if (!context.briefing?.hasLegalTexts) return "missing_legal";
    if (!context.briefing?.hasReference) return "missing_reference";
    return "briefing_incomplete";
  }

  if (context.estimate && context.inquiryType === "project") {
    return "payment_split_50_50";
  }

  return "receipt_followup";
}

function buildReceiptFollowup(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Ihre Anfrage ${ctx.referenceId} — wir melden uns`;
  const body = [
    greeting(ctx.contactName),
    "",
    "vielen Dank für Ihre Anfrage bei UNZE Business.",
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "Wir haben alle Angaben erhalten und melden uns persönlich innerhalb von 2 Werktagen",
    "für ein kurzes Erstgespräch — per E-Mail oder Telefon, wie es Ihnen passt.",
    "",
    "Für eine zügige Planung können Sie uns gerne schon Material schicken (Logo, Texte, Bilder).",
    "Erst wenn das Briefing vollständig ist, starten wir die Umsetzung.",
    "",
    "Bei Rückfragen antworten Sie einfach auf diese E-Mail mit der Referenznummer.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "receipt_followup",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildBriefingIncomplete(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const missing = getMissingBriefingItems(ctx.briefing);
  const subject = `[UNZE Business] Material für ${ctx.referenceId} — bitte nachreichen`;

  const body = [
    greeting(ctx.contactName),
    "",
    "vielen Dank für Ihre Anfrage — damit wir optimal planen und starten können, fehlt uns noch folgendes Material:",
    "",
    ...missing.map((item) => `• ${item}`),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    BRIEFING_COMPLETE_MESSAGE,
    "",
    "Bitte senden Sie die fehlenden Unterlagen per Antwort auf diese E-Mail (Anhänge sind willkommen).",
    "Ohne vollständiges Material können wir leider nicht mit der Umsetzung beginnen.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "briefing_incomplete",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildMissingTexts(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Texte für ${ctx.referenceId} — bitte nachsenden`;

  const body = [
    greeting(ctx.contactName),
    "",
    "vielen Dank für Ihre Anfrage — ein kurzer Hinweis zum weiteren Ablauf:",
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "Falls noch keine Texte vorliegen, bitte ich Sie, diese nachzusenden — sonst kann ich leider nicht anfangen.",
    "",
    "Was wir brauchen (gern als Word/Docs oder klar strukturiert):",
    "• Firmenname und Kurzbeschreibung",
    "• Leistungen / Angebote",
    "• Über uns (optional, aber hilfreich)",
    "• Kontaktdaten für die Seite",
    "",
    "Sobald die Texte da sind, planen wir den nächsten Schritt und melden uns mit dem Angebot.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "missing_texts",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildMissingLogo(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Logo für ${ctx.referenceId} — bitte zusenden`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "für die Einrichtung Ihres Projekts benötigen wir noch Ihr Logo.",
    "",
    "Ideal: PNG oder SVG, mind. 500 px breit, transparent wenn möglich.",
    "Bitte senden Sie die Datei als Antwort auf diese E-Mail.",
    "",
    "Ohne Logo können wir die Seite nicht final einrichten — vielen Dank für Ihre Unterstützung.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "missing_logo",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildMissingImages(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Bilder für ${ctx.referenceId} — bitte zusenden`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "für ein stimmiges Ergebnis fehlen uns noch Bilder — z. B. Hero-Motiv und optional Team oder Referenzen.",
    "",
    "Gern als JPG oder WebP in guter Auflösung (keine Handy-Screenshots, wenn möglich).",
    "Alternativ können wir auf Stock-Bilder zurückgreifen — bitte kurz Bescheid geben, falls das gewünscht ist.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "missing_images",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildMissingLegal(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Impressum & Datenschutz — ${ctx.referenceId}`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "für die Veröffentlichung benötigen wir noch Ihre Rechtstexte:",
    "• Impressum (vollständig, rechtskonform)",
    "• Datenschutzerklärung",
    "",
    "Falls Sie noch keine Texte haben, können wir Platzhalter einsetzen — bitte bestätigen Sie das kurz.",
    "Rechtssichere Texte sollten idealerweise von Ihrem Anwalt oder einem Generator stammen.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "missing_legal",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildMissingReference(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Referenz-Template — ${ctx.referenceId}`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "damit wir schnell starten können: Welche Branche bzw. welches Referenz-Template aus unserem",
    "Designsystem passt am besten zu Ihrem Projekt? (z. B. Arztpraxis, Handwerk, Umzug, Beratung)",
    "",
    ctx.briefing?.materialNotes
      ? `Ihr Hinweis bisher: „${ctx.briefing.materialNotes}“`
      : "Falls Sie unsicher sind, beschreiben Sie kurz Ihre Branche — wir schlagen eine passende Vorlage vor.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "missing_reference",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildProjectStartAfterBriefing(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Projektstart — ${ctx.referenceId}`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "kurz zur Einordnung: Die geplante Lieferzeit startet erst, wenn Ihr Briefing vollständig ist",
    "(Logo, Texte, Bilder, Rechtstexte, Referenz-Template).",
    "",
    BRIEFING_COMPLETE_MESSAGE,
    "",
    "Sobald alles vorliegt, bestätigen wir den Start und nennen Ihnen den verbindlichen Zeitplan.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "project_start_after_briefing",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildPaymentSplit5050(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const estimate = ctx.estimate;
  const priceCents = estimate?.suggestedCents ?? 0;
  const planDescription = priceCents > 0 ? describePaymentPlan("split_50_50", priceCents) : null;

  const subject = `[UNZE Business] Angebot & Zahlung — ${ctx.referenceId}`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "vielen Dank für das vertrauensvolle Gespräch — hier die Eckdaten zu Ihrem Projekt:",
    "",
    ...(estimate
      ? [
          `Orientierung: ${formatEuroRange(estimate.minCents, estimate.maxCents)}`,
          `Empfohlen: ${formatEuroCents(estimate.suggestedCents)}`,
        ]
      : ["Wir erstellen Ihnen ein verbindliches Angebot auf Basis Ihrer Anfrage."]),
    "",
    "Unser Standard-Zahlungsmodell (streng und fair für beide Seiten):",
    "• 50 % Anzahlung zum Projektstart",
    "• 50 % Restzahlung bei Abnahme",
    "",
    ...(planDescription
      ? [`Konkret: ${planDescription}`, ""]
      : ["Die genauen Beträge nennen wir Ihnen im Angebot.", ""]),
    "Die Anzahlung sichert Ihren Projekttermin; die Restzahlung erfolgt erst nach Ihrer Freigabe.",
    "",
    "Das formale Angebot mit Zahlungslink folgt in einer separaten Nachricht.",
    "Bei Fragen antworten Sie bitte mit der Referenznummer.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "payment_split_50_50",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

function buildOfferInPreparation(ctx: InquiryOutreachContext): InquiryEmailDraft {
  const subject = `[UNZE Business] Angebot in Vorbereitung — ${ctx.referenceId}`;

  const body = [
    greeting(ctx.contactName),
    "",
    refLine(ctx.referenceId),
    companyLine(ctx.company),
    "",
    "Ihr Angebot ist in Vorbereitung — wir melden uns innerhalb der nächsten Werktage",
    "mit dem verbindlichen Angebot und dem Zahlungslink.",
    "",
    "Zahlungsmodell wie besprochen: 50 % Anzahlung zum Start, 50 % bei Abnahme.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    templateId: "offer_in_preparation",
    subject,
    body,
    mailtoHref: mailto(ctx.contactEmail, subject, body),
  };
}

export function buildInquiryEmailDraft(
  templateId: InquiryEmailTemplateId,
  context: InquiryOutreachContext,
): InquiryEmailDraft {
  switch (templateId) {
    case "receipt_followup":
      return buildReceiptFollowup(context);
    case "briefing_incomplete":
      return buildBriefingIncomplete(context);
    case "missing_texts":
      return buildMissingTexts(context);
    case "missing_logo":
      return buildMissingLogo(context);
    case "missing_images":
      return buildMissingImages(context);
    case "missing_legal":
      return buildMissingLegal(context);
    case "missing_reference":
      return buildMissingReference(context);
    case "project_start_after_briefing":
      return buildProjectStartAfterBriefing(context);
    case "payment_split_50_50":
      return buildPaymentSplit5050(context);
    case "offer_in_preparation":
      return buildOfferInPreparation(context);
    default:
      return buildReceiptFollowup(context);
  }
}

export function getInquiryOutreachSuggestionNote(context: InquiryOutreachContext): string | null {
  const missing = getMissingBriefingItems(context.briefing);
  const mm = context.estimate?.mastermind;

  if (missing.length > 0) {
    return `Mastermind: Briefing ${mm?.briefingScore ?? 0} % — ${missing.length} Punkt(e) fehlen. Vorlage „Material nachfordern“ empfohlen.`;
  }

  if (mm?.marginStatus === "tight") {
    return "Mastermind: enge Marge — Briefing strikt einhalten, Scope nicht erweitern.";
  }

  if (context.estimate) {
    return "Mastermind: Briefing OK — Zahlungsmodell 50/50 kommunizieren.";
  }

  return null;
}
