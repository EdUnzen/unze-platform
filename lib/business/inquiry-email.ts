import {
  INQUIRY_ANALYSIS_TIERS,
  INQUIRY_BUDGETS,
  INQUIRY_HOSTING,
  INQUIRY_INFRASTRUCTURE,
  INQUIRY_MODULES,
  INQUIRY_PROJECT_TIERS,
  INQUIRY_SERVICE_MODELS,
  INQUIRY_SERVICE_PACKAGES,
  INQUIRY_TIMELINES,
  INQUIRY_WEBSITE_SCOPE,
  PROJECT_TYPE_LABELS,
} from "@/lib/constants/business-inquiry-config";
import {
  formatEstimateSummary,
  type ProjectEstimate,
} from "@/lib/business/project-estimate.service";
import {
  formatBriefingStatusLines,
  formatMastermindSummary,
} from "@/lib/business/pricing-mastermind.service";
import { formatEuroRange } from "@/lib/business/pricing-utils";

export type ProjectInquiryAnswers = {
  industry?: string;
  projectType: string;
  phone?: string;
  serviceModel?: string;
  analysisTier?: string;
  servicePackage?: string;
  websiteScope?: string;
  projectTier?: string;
  hosting?: string;
  budget?: string;
  timeline?: string;
  preferredDate?: string;
  modules?: string[];
  infrastructure?: string[];
  briefing?: import("@/lib/constants/business-pricing-mastermind").BriefingReadiness;
  estimate?: ProjectEstimate;
};

export type ProjectInquiryPayload = {
  referenceId: string;
  contactName: string | null;
  contactEmail: string;
  company: string | null;
  message: string | null;
  answers: ProjectInquiryAnswers;
};

function labelFrom(
  options: readonly { value: string; label: string }[],
  value?: string,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatList(
  values: string[] | undefined,
  options: readonly { value: string; label: string }[],
): string {
  if (!values?.length) return "—";
  return values.map((v) => options.find((x) => x.value === v)?.label ?? v).join(", ");
}

export function buildAdminInquiryEmail(payload: ProjectInquiryPayload): { subject: string; text: string } {
  const a = payload.answers;
  const subject = `[UNZE Business] Projektanfrage ${payload.referenceId}`;

  const text = [
    "═══════════════════════════════════════",
    "  UNZE BUSINESS — NEUE PROJEKTANFRAGE",
    "═══════════════════════════════════════",
    "",
    `Referenz:        ${payload.referenceId}`,
    `Eingang:         ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
    "",
    "── UNTERNEHMEN ──────────────────────────",
    `Firma:           ${payload.company ?? "—"}`,
    `Branche:         ${a.industry ?? "—"}`,
    `Ansprechpartner: ${payload.contactName ?? "—"}`,
    `E-Mail:          ${payload.contactEmail}`,
    `Telefon:         ${a.phone ?? "—"}`,
    "",
    "── PROJEKT ──────────────────────────────",
    `Gewünschte Lösung: ${PROJECT_TYPE_LABELS[a.projectType] ?? a.projectType}`,
    `Vorgehen:        ${labelFrom(INQUIRY_SERVICE_MODELS, a.serviceModel)}`,
    `Analyse-Stufe:   ${labelFrom(INQUIRY_ANALYSIS_TIERS, a.analysisTier)}`,
    `Servicepaket:    ${labelFrom(INQUIRY_SERVICE_PACKAGES, a.servicePackage)}`,
    `Website-Umfang:  ${labelFrom(INQUIRY_WEBSITE_SCOPE, a.websiteScope)}`,
    `Paket-Stufe:     ${labelFrom(INQUIRY_PROJECT_TIERS, a.projectTier)}`,
    `Budget:          ${labelFrom(INQUIRY_BUDGETS, a.budget)}`,
    `Zeitraum:        ${labelFrom(INQUIRY_TIMELINES, a.timeline)}`,
    `Terminwunsch:    ${a.preferredDate ?? "—"}`,
    "",
    "── HOSTING & INFRASTRUKTUR ───────────────",
    `Situation:       ${labelFrom(INQUIRY_HOSTING, a.hosting)}`,
    `Einrichtung:     ${formatList(a.infrastructure, INQUIRY_INFRASTRUCTURE)}`,
    "",
    "── BRIEFING / MATERIAL ────────────────────",
    ...formatBriefingStatusLines(a.briefing),
    "",
    "── GEWÜNSCHTE MODULE ────────────────────",
    formatList(a.modules, INQUIRY_MODULES),
    "",
    ...(a.estimate
      ? [
          "── AUTOMATISCHE GROBSCHÄTZUNG ──────────",
          `Spanne:          ${formatEuroRange(a.estimate.minCents, a.estimate.maxCents)}`,
          formatEstimateSummary(a.estimate).split("\n").slice(1).join("\n"),
          "",
          ...(a.estimate.mastermind
            ? [
                "── MASTERMIND (intern) ──────────────────",
                formatMastermindSummary(a.estimate.mastermind),
                "",
              ]
            : []),
          `Hinweis: ${a.estimate.disclaimer}`,
          "",
        ]
      : []),
    "── BESCHREIBUNG ─────────────────────────",
    payload.message ?? "—",
    "",
    "── NÄCHSTE SCHRITTE ─────────────────────",
    "1. Anfrage + Schätzung im UNZE Studio prüfen",
    "2. Erstgespräch terminieren",
    "3. Angebot erstellen und versenden",
    "",
    "Bearbeitung: UNZE Studio",
    "www.unze.app/business",
    "═══════════════════════════════════════",
  ].join("\n");

  return { subject, text };
}

export function buildCustomerReceiptEmail(payload: ProjectInquiryPayload): { subject: string; text: string } {
  const subject = `[UNZE Business] Eingangsbestätigung ${payload.referenceId}`;
  const text = [
    "Sehr geehrte Damen und Herren,",
    "",
    "vielen Dank für Ihre Projektanfrage bei UNZE Business.",
    "",
    `Ihre Referenznummer: ${payload.referenceId}`,
    "",
    "Wir haben alle Angaben erhalten und melden uns persönlich",
    "innerhalb von 2 Werktagen für das Erstgespräch.",
    "",
    "Ihre Zusammenfassung:",
    `Unternehmen: ${payload.company ?? "—"}`,
    `Lösung: ${PROJECT_TYPE_LABELS[payload.answers.projectType] ?? payload.answers.projectType}`,
    ...(payload.answers.estimate
      ? [
          `Orientierung: ${formatEuroRange(payload.answers.estimate.minCents, payload.answers.estimate.maxCents)}`,
        ]
      : []),
    "",
    "Bei Rückfragen antworten Sie bitte mit der Referenznummer.",
    "",
    "Mit freundlichen Grüßen",
    "UNZE Business",
    "www.unze.app/business",
  ].join("\n");

  return { subject, text };
}
