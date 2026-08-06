export type ClientStatus = "active" | "paused" | "archived";
export type ContractType = "maintenance" | "hosting" | "support" | "other";
export type BillingCycle = "monthly" | "yearly" | "one_time";

export interface StudioClient {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string;
  contactPhone: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  notes: string | null;
  status: ClientStatus;
  sourceInquiryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDomain {
  id: string;
  clientId: string;
  domain: string;
  registrar: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  notes: string | null;
}

export interface ClientHosting {
  id: string;
  clientId: string;
  provider: string;
  planName: string | null;
  url: string | null;
  monthlyCents: number | null;
  billingNotes: string | null;
  notes: string | null;
}

export interface ClientContract {
  id: string;
  clientId: string;
  title: string;
  contractType: ContractType;
  amountCents: number | null;
  billingCycle: BillingCycle | null;
  startsAt: string | null;
  endsAt: string | null;
  nextBillingAt: string | null;
  notes: string | null;
}

export interface ClientDetail extends StudioClient {
  domains: ClientDomain[];
  hosting: ClientHosting[];
  contracts: ClientContract[];
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Aktiv",
  paused: "Pausiert",
  archived: "Archiviert",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  maintenance: "Wartung",
  hosting: "Hosting",
  support: "Support",
  other: "Sonstiges",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monatlich",
  yearly: "Jährlich",
  one_time: "Einmalig",
};
