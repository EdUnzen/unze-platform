import { createAdminClient } from "@/lib/supabase/admin";
import type {
  BillingCycle,
  ClientContract,
  ClientDetail,
  ClientDomain,
  ClientHosting,
  ClientStatus,
  ContractType,
  StudioClient,
} from "@/lib/studio/client-types";
import type { StudioInquiry } from "@/lib/studio/types";

const CLIENT_SELECT =
  "id, company_name, contact_name, contact_email, contact_phone, street, postal_code, city, country, notes, status, source_inquiry_id, created_at, updated_at";

function mapClient(row: Record<string, unknown>): StudioClient {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    contactName: (row.contact_name as string | null) ?? null,
    contactEmail: row.contact_email as string,
    contactPhone: (row.contact_phone as string | null) ?? null,
    street: (row.street as string | null) ?? null,
    postalCode: (row.postal_code as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    country: (row.country as string) ?? "Deutschland",
    notes: (row.notes as string | null) ?? null,
    status: row.status as ClientStatus,
    sourceInquiryId: (row.source_inquiry_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapDomain(row: Record<string, unknown>): ClientDomain {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    domain: row.domain as string,
    registrar: (row.registrar as string | null) ?? null,
    expiresAt: (row.expires_at as string | null) ?? null,
    autoRenew: Boolean(row.auto_renew),
    notes: (row.notes as string | null) ?? null,
  };
}

function mapHosting(row: Record<string, unknown>): ClientHosting {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    provider: row.provider as string,
    planName: (row.plan_name as string | null) ?? null,
    url: (row.url as string | null) ?? null,
    monthlyCents: (row.monthly_cents as number | null) ?? null,
    billingNotes: (row.billing_notes as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

function mapContract(row: Record<string, unknown>): ClientContract {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    title: row.title as string,
    contractType: row.contract_type as ContractType,
    amountCents: (row.amount_cents as number | null) ?? null,
    billingCycle: (row.billing_cycle as BillingCycle | null) ?? null,
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    nextBillingAt: (row.next_billing_at as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

export async function listStudioClients(limit = 100): Promise<StudioClient[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("clients")
    .select(CLIENT_SELECT)
    .neq("status", "archived")
    .order("company_name", { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error("[studio/clients] list failed:", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map(mapClient);
}

export async function getStudioClientById(id: string): Promise<StudioClient | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapClient(data as Record<string, unknown>);
}

export async function getStudioClientDetail(id: string): Promise<ClientDetail | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const client = await getStudioClientById(id);
  if (!client) return null;

  const [domainsRes, hostingRes, contractsRes] = await Promise.all([
    admin.schema("studio").from("client_domains").select("*").eq("client_id", id).order("domain"),
    admin.schema("studio").from("client_hosting").select("*").eq("client_id", id).order("provider"),
    admin
      .schema("studio")
      .from("client_contracts")
      .select("*")
      .eq("client_id", id)
      .order("title"),
  ]);

  return {
    ...client,
    domains: (domainsRes.data ?? []).map((r) => mapDomain(r as Record<string, unknown>)),
    hosting: (hostingRes.data ?? []).map((r) => mapHosting(r as Record<string, unknown>)),
    contracts: (contractsRes.data ?? []).map((r) => mapContract(r as Record<string, unknown>)),
  };
}

export async function getClientByInquiryId(inquiryId: string): Promise<StudioClient | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("source_inquiry_id", inquiryId)
    .maybeSingle();

  if (error || !data) return null;
  return mapClient(data as Record<string, unknown>);
}

export type CreateClientInput = {
  companyName: string;
  contactName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string;
  notes?: string | null;
  sourceInquiryId?: string | null;
};

export async function createStudioClient(input: CreateClientInput): Promise<StudioClient | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("clients")
    .insert({
      company_name: input.companyName.trim(),
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail.trim(),
      contact_phone: input.contactPhone?.trim() || null,
      street: input.street?.trim() || null,
      postal_code: input.postalCode?.trim() || null,
      city: input.city?.trim() || null,
      country: input.country?.trim() || "Deutschland",
      notes: input.notes?.trim() || null,
      source_inquiry_id: input.sourceInquiryId ?? null,
    })
    .select(CLIENT_SELECT)
    .single();

  if (error || !data) {
    console.error("[studio/clients] create failed:", error?.message);
    return null;
  }

  const client = mapClient(data as Record<string, unknown>);

  if (input.sourceInquiryId) {
    await admin
      .schema("studio")
      .from("inquiries")
      .update({ client_id: client.id, updated_at: new Date().toISOString() })
      .eq("id", input.sourceInquiryId);
  }

  return client;
}

export async function createClientFromInquiry(inquiry: StudioInquiry): Promise<StudioClient | null> {
  const existing = await getClientByInquiryId(inquiry.id);
  if (existing) return existing;

  return createStudioClient({
    companyName: inquiry.company ?? inquiry.contactName ?? inquiry.contactEmail,
    contactName: inquiry.contactName,
    contactEmail: inquiry.contactEmail,
    notes: inquiry.message,
    sourceInquiryId: inquiry.id,
  });
}

export async function updateStudioClient(
  id: string,
  patch: Partial<CreateClientInput & { status: ClientStatus }>,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.companyName !== undefined) payload.company_name = patch.companyName.trim();
  if (patch.contactName !== undefined) payload.contact_name = patch.contactName?.trim() || null;
  if (patch.contactEmail !== undefined) payload.contact_email = patch.contactEmail.trim();
  if (patch.contactPhone !== undefined) payload.contact_phone = patch.contactPhone?.trim() || null;
  if (patch.street !== undefined) payload.street = patch.street?.trim() || null;
  if (patch.postalCode !== undefined) payload.postal_code = patch.postalCode?.trim() || null;
  if (patch.city !== undefined) payload.city = patch.city?.trim() || null;
  if (patch.country !== undefined) payload.country = patch.country?.trim() || "Deutschland";
  if (patch.notes !== undefined) payload.notes = patch.notes?.trim() || null;
  if (patch.status !== undefined) payload.status = patch.status;

  const { error } = await admin.schema("studio").from("clients").update(payload).eq("id", id);
  if (error) {
    console.error("[studio/clients] update failed:", error.message);
    return false;
  }
  return true;
}

export async function addClientDomain(
  clientId: string,
  input: { domain: string; registrar?: string; expiresAt?: string; autoRenew?: boolean; notes?: string },
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin.schema("studio").from("client_domains").insert({
    client_id: clientId,
    domain: input.domain.trim(),
    registrar: input.registrar?.trim() || null,
    expires_at: input.expiresAt || null,
    auto_renew: input.autoRenew ?? false,
    notes: input.notes?.trim() || null,
  });

  return !error;
}

export async function addClientHosting(
  clientId: string,
  input: {
    provider: string;
    planName?: string;
    url?: string;
    monthlyCents?: number | null;
    billingNotes?: string;
    notes?: string;
  },
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin.schema("studio").from("client_hosting").insert({
    client_id: clientId,
    provider: input.provider.trim(),
    plan_name: input.planName?.trim() || null,
    url: input.url?.trim() || null,
    monthly_cents: input.monthlyCents ?? null,
    billing_notes: input.billingNotes?.trim() || null,
    notes: input.notes?.trim() || null,
  });

  return !error;
}

export async function addClientContract(
  clientId: string,
  input: {
    title: string;
    contractType: ContractType;
    amountCents?: number | null;
    billingCycle?: BillingCycle | null;
    startsAt?: string;
    endsAt?: string;
    nextBillingAt?: string;
    notes?: string;
  },
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin.schema("studio").from("client_contracts").insert({
    client_id: clientId,
    title: input.title.trim(),
    contract_type: input.contractType,
    amount_cents: input.amountCents ?? null,
    billing_cycle: input.billingCycle ?? null,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    next_billing_at: input.nextBillingAt || null,
    notes: input.notes?.trim() || null,
  });

  return !error;
}

export async function deleteClientAsset(
  table: "client_domains" | "client_hosting" | "client_contracts",
  id: string,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.schema("studio").from(table).delete().eq("id", id);
  return !error;
}
