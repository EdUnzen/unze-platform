"use server";

import { getStudioSession } from "@/lib/studio/auth";
import type { BillingCycle, ClientStatus, ContractType } from "@/lib/studio/client-types";
import {
  addClientContract,
  addClientDomain,
  addClientHosting,
  createClientFromInquiry,
  createStudioClient,
  deleteClientAsset,
  updateStudioClient,
} from "@/lib/studio/clients";
import { getStudioInquiryById } from "@/lib/studio/inquiries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function requireSession() {
  return getStudioSession().then((s) => {
    if (!s) redirect("/admin");
    return s;
  });
}

function parseEuroToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const num = Number.parseFloat(normalized);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s || null;
}

export async function createClientAction(formData: FormData) {
  await requireSession();

  const client = await createStudioClient({
    companyName: String(formData.get("companyName") ?? ""),
    contactName: emptyToNull(formData.get("contactName")),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: emptyToNull(formData.get("contactPhone")),
    street: emptyToNull(formData.get("street")),
    postalCode: emptyToNull(formData.get("postalCode")),
    city: emptyToNull(formData.get("city")),
    country: String(formData.get("country") ?? "Deutschland"),
    notes: emptyToNull(formData.get("notes")),
  });

  if (!client) redirect("/studio/app/kunden/neu?error=1");
  revalidatePath("/studio/app/kunden");
  redirect(`/studio/app/kunden/${client.id}?saved=1`);
}

export async function createClientFromInquiryAction(formData: FormData) {
  await requireSession();

  const inquiryId = String(formData.get("inquiryId") ?? "");
  const inquiry = await getStudioInquiryById(inquiryId);
  if (!inquiry) redirect("/studio/app");

  const client = await createClientFromInquiry(inquiry);
  if (!client) redirect(`/studio/app/inquiries/${inquiryId}?error=client`);

  revalidatePath("/studio/app/kunden");
  revalidatePath(`/studio/app/inquiries/${inquiryId}`);
  redirect(`/studio/app/kunden/${client.id}?fromLead=1`);
}

export async function updateClientAction(formData: FormData) {
  await requireSession();

  const id = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "active") as ClientStatus;

  const ok = await updateStudioClient(id, {
    companyName: String(formData.get("companyName") ?? ""),
    contactName: emptyToNull(formData.get("contactName")),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: emptyToNull(formData.get("contactPhone")),
    street: emptyToNull(formData.get("street")),
    postalCode: emptyToNull(formData.get("postalCode")),
    city: emptyToNull(formData.get("city")),
    country: String(formData.get("country") ?? "Deutschland"),
    notes: emptyToNull(formData.get("notes")),
    status,
  });

  revalidatePath(`/studio/app/kunden/${id}`);
  revalidatePath("/studio/app/kunden");
  redirect(`/studio/app/kunden/${id}?${ok ? "saved=1" : "error=1"}`);
}

export async function addDomainAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");

  await addClientDomain(clientId, {
    domain: String(formData.get("domain") ?? ""),
    registrar: emptyToNull(formData.get("registrar")) ?? undefined,
    expiresAt: emptyToNull(formData.get("expiresAt")) ?? undefined,
    autoRenew: formData.get("autoRenew") === "on",
    notes: emptyToNull(formData.get("notes")) ?? undefined,
  });

  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}?saved=1`);
}

export async function addHostingAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");

  await addClientHosting(clientId, {
    provider: String(formData.get("provider") ?? ""),
    planName: emptyToNull(formData.get("planName")) ?? undefined,
    url: emptyToNull(formData.get("url")) ?? undefined,
    monthlyCents: parseEuroToCents(String(formData.get("monthlyEuro") ?? "")),
    billingNotes: emptyToNull(formData.get("billingNotes")) ?? undefined,
    notes: emptyToNull(formData.get("notes")) ?? undefined,
  });

  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}?saved=1`);
}

export async function addContractAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");

  await addClientContract(clientId, {
    title: String(formData.get("title") ?? ""),
    contractType: String(formData.get("contractType") ?? "maintenance") as ContractType,
    amountCents: parseEuroToCents(String(formData.get("amountEuro") ?? "")),
    billingCycle: (emptyToNull(formData.get("billingCycle")) as BillingCycle | null) ?? null,
    startsAt: emptyToNull(formData.get("startsAt")) ?? undefined,
    endsAt: emptyToNull(formData.get("endsAt")) ?? undefined,
    nextBillingAt: emptyToNull(formData.get("nextBillingAt")) ?? undefined,
    notes: emptyToNull(formData.get("notes")) ?? undefined,
  });

  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}?saved=1`);
}

export async function deleteDomainAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");
  const id = String(formData.get("id") ?? "");
  await deleteClientAsset("client_domains", id);
  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}`);
}

export async function deleteHostingAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");
  const id = String(formData.get("id") ?? "");
  await deleteClientAsset("client_hosting", id);
  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}`);
}

export async function deleteContractAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");
  const id = String(formData.get("id") ?? "");
  await deleteClientAsset("client_contracts", id);
  revalidatePath(`/studio/app/kunden/${clientId}`);
  redirect(`/studio/app/kunden/${clientId}`);
}
