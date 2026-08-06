import { formatEuroCents } from "@/lib/business/pricing-utils";
import { formatEmailSignature, STUDIO_COMPANY_PROFILE } from "@/lib/studio/company-profile";
import type { ContractReminderRow, DomainReminderRow, PaymentOverviewRow } from "@/lib/studio/overview";
import type { StudioQuote } from "@/lib/studio/quote-types";

function mailto(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function greeting(name: string | null): string {
  return name ? `Hallo ${name},` : "Guten Tag,";
}

export function buildPaymentReminderMailto(row: PaymentOverviewRow): string {
  const q = row.quote;
  const label = q.company ?? q.customerName ?? q.customerEmail;
  const subject = `[UNZE] Zahlungserinnerung — Angebot ${q.referenceId}`;

  const lines =
    row.bucket === "partial"
      ? [
          `offener Restbetrag: ${formatEuroCents(row.openCents)}`,
          `bereits bezahlt: ${formatEuroCents(q.amountPaidCents)} von ${formatEuroCents(q.chargeTotalCents)}`,
        ]
      : [`offener Betrag: ${formatEuroCents(row.openCents)}`];

  const body = [
    greeting(q.customerName),
    "",
    `freundliche Erinnerung zu Ihrem Angebot ${q.referenceId} (${label}).`,
    "",
    ...lines,
    "",
    "Bitte teilen Sie uns mit, ob die Zahlung bereits unterwegs ist oder ob Sie noch Fragen haben.",
    "Bei Rückfragen antworten Sie einfach auf diese E-Mail mit der Angebotsnummer.",
    "",
    formatEmailSignature(),
  ].join("\n");

  return mailto(q.customerEmail, subject, body);
}

export function buildContractReminderMailto(row: ContractReminderRow): string {
  const { client, contract, reason, dueDate } = row;
  const formatted = new Date(`${dueDate}T12:00:00`).toLocaleDateString("de-DE");

  const subject =
    reason === "billing_due"
      ? `[UNZE] Abrechnung — ${contract.title}`
      : `[UNZE] Vertrag läuft aus — ${contract.title}`;

  const intro =
    reason === "billing_due"
      ? `Ihr Service „${contract.title}“ steht zur Abrechnung an (${formatted}).`
      : `Ihr Vertrag „${contract.title}“ endet am ${formatted}.`;

  const amountLine =
    contract.amountCents != null
      ? `Betrag: ${formatEuroCents(contract.amountCents)}`
      : null;

  const body = [
    greeting(client.contactName),
    "",
    intro,
    "",
    amountLine,
    "",
    "Gerne besprechen wir Verlängerung oder Anpassung — antworten Sie einfach auf diese Nachricht.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return mailto(client.contactEmail, subject, body);
}

export function buildDomainReminderMailto(row: DomainReminderRow): string {
  const { client, domain } = row;
  const formatted = domain.expiresAt
    ? new Date(`${domain.expiresAt}T12:00:00`).toLocaleDateString("de-DE")
    : "—";

  const subject = `[UNZE] Domain ${domain.domain} — Ablauf ${formatted}`;
  const body = [
    greeting(client.contactName),
    "",
    `die Domain ${domain.domain} läuft am ${formatted} ab.`,
    domain.autoRenew ? "Auto-Renew ist bei uns als aktiv markiert — bitte kurz bestätigen, ob das passt." : "",
    "",
    "Sollen wir die Verlängerung für Sie übernehmen? Antworten Sie kurz auf diese E-Mail.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  return mailto(client.contactEmail, subject, body);
}

export function buildPaidConfirmationMailto(quote: StudioQuote): string {
  const subject = `[UNZE] Zahlungsbestätigung — ${quote.referenceId}`;
  const body = [
    greeting(quote.customerName),
    "",
    `vielen Dank — wir haben Ihre Zahlung zu ${quote.referenceId} erhalten.`,
    `Betrag: ${formatEuroCents(quote.amountPaidCents)}`,
    "",
    "Bei Fragen melden Sie sich jederzeit.",
    "",
    formatEmailSignature(),
  ].join("\n");

  return mailto(quote.customerEmail, subject, body);
}

export { STUDIO_COMPANY_PROFILE };
