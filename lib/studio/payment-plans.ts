import { formatEuroCents } from "@/lib/business/pricing-utils";

/** Zahlungsmodelle — bewusst einfach gehalten (kein komplexes Mehrfach-Modell). */

export type PaymentPlanId = "full" | "split_50_50" | "installments_3" | "installments_6";

export type PaymentStep = "full" | "deposit" | "final" | "installment";

export type PaymentPhase = "unpaid" | "pending" | "deposit_paid" | "completed";

export const PAYMENT_PLANS: Record<
  PaymentPlanId,
  {
    label: string;
    description: string;
    surchargePercent: number;
    installmentCount: number;
  }
> = {
  full: {
    label: "Einmalzahlung",
    description: "Gesamtbetrag in einer Zahlung — ohne Aufschlag.",
    surchargePercent: 0,
    installmentCount: 0,
  },
  split_50_50: {
    label: "50 % Anzahlung · 50 % bei Abnahme",
    description: "Halbe Summe zum Projektstart, Rest nach Abnahme — ohne Aufschlag.",
    surchargePercent: 0,
    installmentCount: 0,
  },
  installments_3: {
    label: "3 Raten (monatlich)",
    description: "3 gleiche Monatsraten — +5 % Gesamtaufschlag für Ratenrisiko.",
    surchargePercent: 5,
    installmentCount: 3,
  },
  installments_6: {
    label: "6 Raten (monatlich)",
    description: "6 gleiche Monatsraten — +8 % Gesamtaufschlag für Ratenrisiko.",
    surchargePercent: 8,
    installmentCount: 6,
  },
};

export function isPaymentPlanId(value: string): value is PaymentPlanId {
  return value in PAYMENT_PLANS;
}

export function calculateChargeTotal(listTotalCents: number, planId: PaymentPlanId): number {
  const plan = PAYMENT_PLANS[planId];
  return Math.round(listTotalCents * (1 + plan.surchargePercent / 100));
}

export function calculateSplitAmounts(chargeTotalCents: number): {
  depositCents: number;
  finalCents: number;
} {
  const depositCents = Math.round(chargeTotalCents / 2);
  const finalCents = chargeTotalCents - depositCents;
  return { depositCents, finalCents };
}

export function calculateInstallmentAmount(
  chargeTotalCents: number,
  installmentCount: number,
): number {
  return Math.ceil(chargeTotalCents / installmentCount);
}

export function describePaymentPlan(
  planId: PaymentPlanId,
  listTotalCents: number,
): string {
  const plan = PAYMENT_PLANS[planId];
  const charge = calculateChargeTotal(listTotalCents, planId);

  if (planId === "full") {
    return `Einmalzahlung: ${formatEuroCents(charge)}`;
  }

  if (planId === "split_50_50") {
    const { depositCents, finalCents } = calculateSplitAmounts(charge);
    return `Anzahlung ${formatEuroCents(depositCents)} · Rest bei Abnahme ${formatEuroCents(finalCents)}`;
  }

  const monthly = calculateInstallmentAmount(charge, plan.installmentCount);
  return `${plan.installmentCount}× ${formatEuroCents(monthly)}/Monat (Gesamt ${formatEuroCents(charge)}, inkl. ${plan.surchargePercent} % Aufschlag)`;
}

export function getNextPaymentStep(
  planId: PaymentPlanId,
  phase: PaymentPhase,
): PaymentStep | null {
  if (phase === "completed") return null;

  if (planId === "full") {
    return phase === "unpaid" || phase === "pending" ? "full" : null;
  }

  if (planId === "split_50_50") {
    if (phase === "unpaid" || phase === "pending") return "deposit";
    if (phase === "deposit_paid") return "final";
    return null;
  }

  if (planId === "installments_3" || planId === "installments_6") {
    return "installment";
  }

  return null;
}

export function getPaymentStepLabel(step: PaymentStep): string {
  switch (step) {
    case "full":
      return "Gesamtzahlung";
    case "deposit":
      return "Anzahlung (50 %)";
    case "final":
      return "Restzahlung bei Abnahme (50 %)";
    case "installment":
      return "Ratenzahlung starten";
  }
}
