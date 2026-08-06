export type StudioInquiryStatus =
  | "neue_anfrage"
  | "kontaktiert"
  | "angebot"
  | "abgeschlossen"
  | "abgelehnt"
  | "zahlung_ausstehend";

export interface StudioInquiry {
  id: string;
  businessInquiryId: string;
  referenceId: string;
  inquiryType: string;
  contactName: string | null;
  contactEmail: string;
  company: string | null;
  message: string | null;
  answers: Record<string, unknown>;
  status: StudioInquiryStatus;
  createdAt: string;
  updatedAt: string;
}
