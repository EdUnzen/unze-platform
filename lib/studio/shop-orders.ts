import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CreateShopOrderInput,
  OrderMessageDirection,
  ShopOrderStatus,
  ShopPaymentStatus,
  StudioOrderMessage,
  StudioShopOrder,
} from "@/lib/studio/shop-order-types";
import type { ShopProductType } from "@/lib/constants/business-shop-catalog";

const ORDER_SELECT =
  "id, reference_id, product_id, product_slug, product_name, product_type, customer_name, customer_email, company, customer_message, status, payment_status, subtotal_cents, tax_rate, tax_cents, total_cents, processing_time, source, stripe_checkout_session_id, stripe_subscription_id, client_id, inquiry_id, metadata, paid_at, completed_at, created_at, updated_at";

function mapOrder(row: Record<string, unknown>): StudioShopOrder {
  return {
    id: row.id as string,
    referenceId: row.reference_id as string,
    productId: row.product_id as string,
    productSlug: row.product_slug as string,
    productName: row.product_name as string,
    productType: row.product_type as ShopProductType,
    customerName: (row.customer_name as string | null) ?? null,
    customerEmail: row.customer_email as string,
    company: (row.company as string | null) ?? null,
    customerMessage: (row.customer_message as string | null) ?? null,
    status: row.status as ShopOrderStatus,
    paymentStatus: row.payment_status as ShopPaymentStatus,
    subtotalCents: row.subtotal_cents as number,
    taxRate: Number(row.tax_rate),
    taxCents: row.tax_cents as number,
    totalCents: row.total_cents as number,
    processingTime: (row.processing_time as string | null) ?? null,
    source: (row.source as string | null) ?? null,
    stripeCheckoutSessionId: (row.stripe_checkout_session_id as string | null) ?? null,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    clientId: (row.client_id as string | null) ?? null,
    inquiryId: (row.inquiry_id as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    paidAt: (row.paid_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapMessage(row: Record<string, unknown>): StudioOrderMessage {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    direction: row.direction as OrderMessageDirection,
    subject: (row.subject as string | null) ?? null,
    body: row.body as string,
    fromEmail: (row.from_email as string | null) ?? null,
    toEmail: (row.to_email as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function createShopOrder(input: CreateShopOrderInput): Promise<StudioShopOrder | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .insert({
      product_id: input.productId,
      product_slug: input.productSlug,
      product_name: input.productName,
      product_type: input.productType,
      customer_name: input.customerName?.trim() || null,
      customer_email: input.customerEmail.trim().toLowerCase(),
      company: input.company?.trim() || null,
      customer_message: input.customerMessage?.trim() || null,
      subtotal_cents: input.subtotalCents,
      tax_rate: input.taxRate ?? 0,
      tax_cents: input.taxCents ?? 0,
      total_cents: input.totalCents,
      processing_time: input.processingTime ?? null,
      source: input.source ?? null,
      metadata: input.metadata ?? {},
      status: "pending_payment",
      payment_status: "pending",
    })
    .select(ORDER_SELECT)
    .single();

  if (error || !data) {
    console.error("[shop-orders] create failed:", error?.message);
    return null;
  }

  return mapOrder(data as Record<string, unknown>);
}

export async function getShopOrderById(id: string): Promise<StudioShopOrder | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data as Record<string, unknown>);
}

export async function getShopOrderByReference(referenceId: string): Promise<StudioShopOrder | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .select(ORDER_SELECT)
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data as Record<string, unknown>);
}

export async function listShopOrders(limit = 50): Promise<StudioShopOrder[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(mapOrder);
}

export async function listPaidShopOrders(limit = 50): Promise<StudioShopOrder[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .select(ORDER_SELECT)
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(mapOrder);
}

export async function updateShopOrderCheckoutSession(
  orderId: string,
  sessionId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .schema("studio")
    .from("shop_orders")
    .update({
      stripe_checkout_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return !error;
}

export async function markShopOrderPaid(input: {
  orderId: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string | null;
}): Promise<StudioShopOrder | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("studio")
    .from("shop_orders")
    .update({
      status: "paid",
      payment_status: "paid",
      stripe_checkout_session_id: input.stripeSessionId,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      paid_at: now,
      updated_at: now,
    })
    .eq("id", input.orderId)
    .select(ORDER_SELECT)
    .single();

  if (error || !data) {
    console.error("[shop-orders] mark paid failed:", error?.message);
    return null;
  }

  return mapOrder(data as Record<string, unknown>);
}

export async function updateShopOrderStatus(
  orderId: string,
  status: ShopOrderStatus,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "completed") {
    patch.completed_at = new Date().toISOString();
  }

  const { error } = await admin.schema("studio").from("shop_orders").update(patch).eq("id", orderId);
  return !error;
}

export async function linkShopOrderClient(orderId: string, clientId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .schema("studio")
    .from("shop_orders")
    .update({ client_id: clientId, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return !error;
}

export async function listOrderMessages(orderId: string): Promise<StudioOrderMessage[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("order_messages")
    .select("id, order_id, direction, subject, body, from_email, to_email, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(mapMessage);
}

export async function appendOrderMessage(input: {
  orderId: string;
  direction: OrderMessageDirection;
  subject?: string | null;
  body: string;
  fromEmail?: string | null;
  toEmail?: string | null;
  createdByStudioUserId?: string | null;
}): Promise<StudioOrderMessage | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("order_messages")
    .insert({
      order_id: input.orderId,
      direction: input.direction,
      subject: input.subject ?? null,
      body: input.body,
      from_email: input.fromEmail ?? null,
      to_email: input.toEmail ?? null,
      created_by_studio_user_id: input.createdByStudioUserId ?? null,
    })
    .select("id, order_id, direction, subject, body, from_email, to_email, created_at")
    .single();

  if (error || !data) {
    console.error("[shop-orders] message failed:", error?.message);
    return null;
  }

  return mapMessage(data as Record<string, unknown>);
}

export async function findClientIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  const { data } = await admin
    .schema("studio")
    .from("clients")
    .select("id")
    .eq("contact_email", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

export async function createClientFromShopOrder(order: StudioShopOrder): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await findClientIdByEmail(order.customerEmail);
  if (existing) {
    await linkShopOrderClient(order.id, existing);
    return existing;
  }

  const { data, error } = await admin
    .schema("studio")
    .from("clients")
    .insert({
      company_name: order.company?.trim() || order.customerName?.trim() || order.customerEmail,
      contact_name: order.customerName,
      contact_email: order.customerEmail,
      status: "active",
      notes: `Automatisch aus Shop-Auftrag ${order.referenceId}`,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[shop-orders] client create failed:", error?.message);
    return null;
  }

  const clientId = data.id as string;
  await linkShopOrderClient(order.id, clientId);
  return clientId;
}
