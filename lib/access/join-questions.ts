import type { CommunityAccessConfig, JoinQuestion } from "@/types/access";

/** Virtuelle Altersfrage wenn requireAgeVerification aktiv, aber keine Frage konfiguriert */
export const VIRTUAL_AGE_QUESTION_ID = "__age_verification__";

export function getEffectiveJoinQuestions(
  questions: JoinQuestion[],
  access?: CommunityAccessConfig | null,
): JoinQuestion[] {
  const hasAgeQuestion = questions.some(
    (q) => q.questionType === "age_verification" && q.isActive,
  );

  if (!access?.requireAgeVerification || hasAgeQuestion) {
    return questions;
  }

  const minAge = access.minAge ?? 18;
  const virtualQuestion: JoinQuestion = {
    id: VIRTUAL_AGE_QUESTION_ID,
    communityId: questions[0]?.communityId ?? "",
    questionType: "age_verification",
    label: `Geburtsdatum (Mindestalter: ${minAge} Jahre)`,
    placeholder: null,
    options: [],
    isRequired: true,
    sortOrder: -1,
    config: { virtual: true, minAge },
    isActive: true,
  };

  return [virtualQuestion, ...questions];
}

export function calculateAgeFromBirthDate(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export function isVirtualAgeQuestionId(questionId: string): boolean {
  return questionId === VIRTUAL_AGE_QUESTION_ID;
}
