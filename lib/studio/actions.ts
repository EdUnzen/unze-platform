"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStudioSession } from "@/lib/studio/auth";
import {
  STUDIO_INQUIRY_STATUSES,
} from "@/lib/studio/constants";
import { updateStudioInquiryStatus } from "@/lib/studio/inquiries";
import type { StudioInquiryStatus } from "@/lib/studio/types";

function isValidStatus(value: string): value is StudioInquiryStatus {
  return STUDIO_INQUIRY_STATUSES.includes(value as StudioInquiryStatus);
}

export async function updateInquiryStatusAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) {
    redirect("/admin");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !isValidStatus(status)) {
    redirect("/studio/app");
  }

  await updateStudioInquiryStatus(id, status);
  revalidatePath("/studio/app");
  revalidatePath(`/studio/app/inquiries/${id}`);
  redirect(`/studio/app/inquiries/${id}?saved=1`);
}
