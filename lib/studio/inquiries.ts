import { createAdminClient } from "@/lib/supabase/admin";
import type { StudioInquiry, StudioInquiryStatus } from "@/lib/studio/types";

interface InquiryRow {
  id: string;
  business_inquiry_id: string;
  reference_id: string;
  inquiry_type: string;
  contact_name: string | null;
  contact_email: string;
  company: string | null;
  message: string | null;
  answers: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapInquiry(row: InquiryRow): StudioInquiry {
  return {
    id: row.id,
    businessInquiryId: row.business_inquiry_id,
    referenceId: row.reference_id,
    inquiryType: row.inquiry_type,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    company: row.company,
    message: row.message,
    answers: row.answers ?? {},
    status: row.status as StudioInquiryStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const INQUIRY_SELECT =
  "id, business_inquiry_id, reference_id, inquiry_type, contact_name, contact_email, company, message, answers, status, created_at, updated_at";

export async function listStudioInquiries(limit = 50): Promise<StudioInquiry[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("inquiries")
    .select(INQUIRY_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[studio] list inquiries failed:", error?.message);
    return [];
  }

  return (data as InquiryRow[]).map(mapInquiry);
}

export async function getStudioInquiryById(id: string): Promise<StudioInquiry | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("inquiries")
    .select(INQUIRY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("[studio] get inquiry failed:", error?.message);
    return null;
  }

  return mapInquiry(data as InquiryRow);
}

export async function updateStudioInquiryStatus(
  id: string,
  status: StudioInquiryStatus,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .schema("studio")
    .from("inquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[studio] update inquiry status failed:", error.message);
    return false;
  }

  return true;
}
