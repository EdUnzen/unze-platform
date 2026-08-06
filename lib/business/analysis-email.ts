import type { AnalysisNotifyPayload } from "@/lib/business/analysis-notify";
import { formatBriefingStatusLines } from "@/lib/business/pricing-mastermind.service";
import { getAnalysisTier } from "@/lib/constants/business-analysis-tiers";

export function buildAdminAnalysisEmail(payload: AnalysisNotifyPayload): { subject: string; text: string } {
  const a = payload.answers;
  const tier = getAnalysisTier(a.tier);
  const subject = `[UNZE Business] Analyse-Anfrage ${payload.referenceId} — ${tier?.name ?? a.tier}`;

  const text = [
    "═══════════════════════════════════════",
    "  UNZE BUSINESS — NEUE ANALYSE-ANFRAGE",
    "═══════════════════════════════════════",
    "",
    `Referenz:        ${payload.referenceId}`,
    `Stufe:           ${tier?.name ?? a.tier} (Stufe ${a.tierStage})`,
    `Zahlung:         ${a.paymentStatus ?? "—"}`,
    `Eingang:         ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
    "",
    "── UNTERNEHMEN ──────────────────────────",
    `Firma:           ${payload.company ?? "—"}`,
    `Website:         ${a.websiteUrl ?? "—"}`,
    `Branche:         ${a.industry ?? "—"}`,
    `Größe:           ${a.companySize ?? "—"}`,
    `Ansprechpartner: ${payload.contactName ?? "—"}`,
    `E-Mail:          ${payload.contactEmail}`,
    "",
    "── ZIELE ────────────────────────────────",
    a.goals ?? "—",
    "",
    ...(a.currentSoftware
      ? [
          "── PROZESSE / SOFTWARE ──────────────────",
          `Mitarbeiter:     ${a.employeeCount ?? "—"}`,
          `Software:        ${a.currentSoftware}`,
          `Angebote:        ${a.offerProcess ?? "—"}`,
          `Rechnungen:      ${a.invoicing ?? "—"}`,
          `CRM:             ${a.crm ?? "—"}`,
          `Marketing:       ${a.marketing ?? "—"}`,
          `Probleme:        ${a.problems ?? "—"}`,
          `Verbesserungen:  ${a.improvements ?? "—"}`,
          "",
        ]
      : []),
    ...(a.preferredCallDate
      ? [`Terminwunsch:    ${a.preferredCallDate}`, `Systemzugang:    ${a.systemAccessNote ?? "—"}`, ""]
      : []),
    "── BRIEFING / MATERIAL (für spätere Umsetzung) ─",
    ...formatBriefingStatusLines(a.briefing),
    "",
    "── NÄCHSTE SCHRITTE ─────────────────────",
    "1. KI-Analyse starten (Analyse Core)",
    "2. Entwurf prüfen und ergänzen",
    "3. Bericht freigeben",
    "",
    "Bearbeitung: UNZE Studio",
    "www.unze.app/business/analyse",
    "═══════════════════════════════════════",
  ].join("\n");

  return { subject, text };
}

export function buildCustomerAnalysisReceiptEmail(
  payload: AnalysisNotifyPayload,
): { subject: string; text: string } {
  const tier = getAnalysisTier(payload.answers.tier);
  const paid = payload.answers.paymentStatus === "paid";
  const subject = `[UNZE Business] Analyse ${payload.referenceId} — Eingang bestätigt`;

  const text = [
    "Sehr geehrte Damen und Herren,",
    "",
    paid
      ? "vielen Dank für Ihre Zahlung und Analyse-Anfrage bei UNZE Business."
      : "vielen Dank für Ihre Analyse-Anfrage bei UNZE Business.",
    "",
    `Referenznummer: ${payload.referenceId}`,
    `Gewählte Stufe: ${tier?.name ?? payload.answers.tier}`,
    "",
    paid || payload.answers.tier === "quick"
      ? "Wir starten die Auswertung und melden uns, sobald der Analyseentwurf zur Qualitätsprüfung bereit ist."
      : "Wir melden uns zur Zahlungsabwicklung und starten anschließend die Auswertung.",
    "",
    "Mit freundlichen Grüßen",
    "UNZE Business",
    "www.unze.app/business",
  ].join("\n");

  return { subject, text };
}
