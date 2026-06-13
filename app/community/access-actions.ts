"use server";

import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import { mapDbError } from "@/lib/db/user-facing-errors";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getEffectiveJoinQuestions } from "@/lib/access/join-questions";
import {
  getJoinQuestions,
  submitJoinApplication,
} from "@/services/access/access.service";
import { fetchCommunityBySlugFromDb } from "@/services/community/community.repository";
import { joinCommunity } from "@/services/community/member.service";
import {
  proofsToFileMeta,
  uploadApplicationProofs,
} from "@/services/storage/proof.service";
import type { JoinApplicationAnswer, JoinPlatformIdentity } from "@/types/access";
import type { PlatformIdentityType } from "@/types/database";
import { revalidatePath } from "next/cache";

function isUploadQuestion(type: string): boolean {
  return (
    type === "file_upload" ||
    type === "image_upload" ||
    type === "age_proof" ||
    type === "identity_proof"
  );
}

export async function submitJoinApplicationAction(
  communityId: string,
  slug: string,
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community) return { error: "Community nicht gefunden" };

  if (
    community.access?.requireRulesConsent &&
    community.access.communityRules &&
    formData.get("rules_consent") !== "on"
  ) {
    return { error: "Zustimmung zu den Regeln erforderlich" };
  }

  const rawQuestions = await getJoinQuestions(communityId, true);
  const questions = getEffectiveJoinQuestions(rawQuestions, community.access);

  const uploadResult = await uploadApplicationProofs({
    communityId,
    userId: user.id,
    questions,
    formData,
  });

  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

  const fileProofs = proofsToFileMeta(uploadResult.proofs);

  const answers: JoinApplicationAnswer[] = questions.map((q) => {
    if (q.questionType === "checkbox" || q.questionType === "rules_consent") {
      return {
        questionId: q.id,
        valueText: null,
        valueBoolean: formData.get(`q_${q.id}`) === "on",
        valueJson: null,
      };
    }
    if (isUploadQuestion(q.questionType)) {
      const proof = fileProofs.find((f) => f.questionId === q.id);
      return {
        questionId: q.id,
        valueText: proof?.fileName ?? null,
        valueBoolean: null,
        valueJson: proof
          ? {
              fileName: proof.fileName,
              size: proof.fileSizeBytes,
              storagePath: proof.storagePath,
            }
          : null,
      };
    }
    return {
      questionId: q.id,
      valueText: String(formData.get(`q_${q.id}`) ?? "").trim() || null,
      valueBoolean: null,
      valueJson: null,
    };
  });

  const platformIdentities: JoinPlatformIdentity[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("platform_") && String(value).trim()) {
      platformIdentities.push({
        platformType: key.replace("platform_", "") as PlatformIdentityType,
        value: String(value).trim(),
      });
    }
  }

  const result = await submitJoinApplication({
    communityId,
    userId: user.id,
    answers,
    platformIdentities,
    fileProofs,
  });

  if (result.error && !result.joined) {
    return { error: result.error };
  }

  revalidatePath(`/community/${slug}`);
  return {
    success: true,
    joined: result.joined ?? false,
    alreadyMember: result.alreadyMember ?? false,
    message: result.joined
      ? result.alreadyMember
        ? ACTION_MESSAGES.community.alreadyMember
        : ACTION_MESSAGES.community.joined
      : ACTION_MESSAGES.community.applicationSent,
  };
}

export async function joinCommunityAction(communityId: string, slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community) return { error: "Community nicht gefunden" };

  if (community.joinAccess?.requiresApplication) {
    return { error: "Bitte Beitrittsantrag ausfüllen", requiresApplication: true };
  }

  const result = await joinCommunity(
    communityId,
    user.id,
    community.visibility,
  );

  if (result.error) return { error: mapDbError(result.error) };

  revalidatePath(`/community/${slug}`);
  revalidatePath("/favorites");
  return {
    success: true,
    alreadyMember: result.alreadyMember ?? false,
    message: result.alreadyMember
      ? ACTION_MESSAGES.community.alreadyMember
      : ACTION_MESSAGES.community.joined,
  };
}

export async function withdrawJoinApplicationAction(
  communityId: string,
  slug: string,
  applicationId: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const { withdrawJoinApplication } = await import(
    "@/services/access/access.service"
  );
  const result = await withdrawJoinApplication(
    applicationId,
    user.id,
    communityId,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/community/${slug}`);
  return { success: true, message: "Antrag zurückgezogen" };
}

export async function loadJoinFormData(communityId: string) {
  const questions = await getJoinQuestions(communityId, true);
  return { questions };
}
