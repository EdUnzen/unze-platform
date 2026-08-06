import type { ShopProductType } from "@/lib/constants/business-shop-catalog";

export type ShopOrderStatus =
  | "pending_payment"
  | "paid"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ShopPaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export type OrderMessageDirection = "inbound" | "outbound" | "system";

export type StudioShopOrder = {
  id: string;
  referenceId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productType: ShopProductType;
  customerName: string | null;
  customerEmail: string;
  company: string | null;
  customerMessage: string | null;
  status: ShopOrderStatus;
  paymentStatus: ShopPaymentStatus;
  subtotalCents: number;
  taxRate: number;
  taxCents: number;
  totalCents: number;
  processingTime: string | null;
  source: string | null;
  stripeCheckoutSessionId: string | null;
  stripeSubscriptionId: string | null;
  clientId: string | null;
  inquiryId: string | null;
  metadata: Record<string, unknown>;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioOrderMessage = {
  id: string;
  orderId: string;
  direction: OrderMessageDirection;
  subject: string | null;
  body: string;
  fromEmail: string | null;
  toEmail: string | null;
  createdAt: string;
};

export type CreateShopOrderInput = {
  productId: string;
  productSlug: string;
  productName: string;
  productType: ShopProductType;
  customerName?: string | null;
  customerEmail: string;
  company?: string | null;
  customerMessage?: string | null;
  subtotalCents: number;
  taxRate?: number;
  taxCents?: number;
  totalCents: number;
  processingTime?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
};
