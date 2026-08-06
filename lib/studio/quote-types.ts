import type { PaymentPhase, PaymentPlanId } from "@/lib/studio/payment-plans";

export type QuoteLineItem = {
  label: string;
  quantity: number;
  unitCents: number;
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "paid";
export type QuotePaymentStatus = "unpaid" | "pending" | "partial" | "paid" | "refunded";

export interface StudioQuote {
  id: string;
  inquiryId: string | null;
  referenceId: string;
  status: QuoteStatus;
  title: string | null;
  customerName: string | null;
  customerEmail: string;
  company: string | null;
  subtotalCents: number;
  taxRate: number;
  taxCents: number;
  totalCents: number;
  paymentPlan: PaymentPlanId;
  chargeTotalCents: number;
  amountPaidCents: number;
  paymentPhase: PaymentPhase;
  installmentCount: number | null;
  installmentsPaid: number;
  validUntil: string | null;
  notes: string | null;
  lineItems: QuoteLineItem[];
  estimateSnapshot: Record<string, unknown> | null;
  stripeCheckoutSessionId: string | null;
  stripeSubscriptionId: string | null;
  paymentStatus: QuotePaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
