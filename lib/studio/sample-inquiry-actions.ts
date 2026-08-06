"use server";

import { calculateProjectEstimate } from "@/lib/business/project-estimate.service";
import { submitProjectInquiry } from "@/lib/business/inquiry.service";
import {
  getSampleScenarioById,
  SAMPLE_INQUIRY_SCENARIOS,
} from "@/lib/business/sample-inquiries";
import { getStudioSession } from "@/lib/studio/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function seedSampleInquiryAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) redirect("/admin");

  const scenarioId = String(formData.get("scenarioId") ?? "");
  const scenario = getSampleScenarioById(scenarioId);
  if (!scenario) redirect("/studio/app/schaetzung-test?error=unknown");

  try {
    const result = await submitProjectInquiry(scenario.input);
    revalidatePath("/studio/app");
    revalidatePath("/studio/app/schaetzung-test");
    redirect(
      `/studio/app/schaetzung-test?seeded=1&ref=${encodeURIComponent(result.referenceId)}&id=${scenarioId}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "seed-failed";
    redirect(`/studio/app/schaetzung-test?error=${encodeURIComponent(message)}`);
  }
}

export async function getSampleEstimatePreviews() {
  return SAMPLE_INQUIRY_SCENARIOS.map((scenario) => {
    const input = scenario.input;
    const answers = {
      industry: input.industry ?? undefined,
      projectType: input.projectType!,
      phone: input.phone ?? undefined,
      budget: input.budget ?? undefined,
      timeline: input.timeline ?? undefined,
      preferredDate: input.preferredDate ?? undefined,
      modules: input.modules,
    };
    const estimate = calculateProjectEstimate(answers, { message: input.message });
    return { scenario, estimate };
  });
}
