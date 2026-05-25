"use client";

import { PLATFORM_IDENTITY_OPTIONS } from "@/lib/constants/access";
import type { JoinApplication, JoinQuestion } from "@/types/access";

interface ApplicationAnswersPanelProps {
  application: JoinApplication;
  questions: JoinQuestion[];
}

function formatAnswerValue(
  application: JoinApplication,
  question: JoinQuestion,
): string {
  const answer = application.answers?.find((a) => a.questionId === question.id);
  if (!answer) return "—";

  if (question.questionType === "checkbox" || question.questionType === "rules_consent") {
    return answer.valueBoolean ? "Ja" : "Nein";
  }

  if (
    question.questionType === "file_upload" ||
    question.questionType === "image_upload" ||
    question.questionType === "age_proof" ||
    question.questionType === "identity_proof"
  ) {
    const fileName =
      answer.valueText ??
      (answer.valueJson?.fileName as string | undefined) ??
      "Datei hochgeladen";
    return fileName;
  }

  if (question.questionType === "age_verification" && answer.valueText) {
    try {
      return new Date(answer.valueText).toLocaleDateString("de-DE");
    } catch {
      return answer.valueText;
    }
  }

  return answer.valueText?.trim() || "—";
}

export function ApplicationAnswersPanel({
  application,
  questions,
}: ApplicationAnswersPanelProps) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const answeredQuestionIds = new Set(
    (application.answers ?? [])
      .map((a) => a.questionId)
      .filter(Boolean) as string[],
  );

  const relevantQuestions = questions.filter((q) => answeredQuestionIds.has(q.id));

  const virtualAnswers = (application.answers ?? []).filter(
    (a) =>
      !a.questionId &&
      (a.valueJson?.virtualQuestion || a.valueJson?.label || a.valueText),
  );

  const hasPlatforms = (application.platformIdentities?.length ?? 0) > 0;

  if (
    relevantQuestions.length === 0 &&
    virtualAnswers.length === 0 &&
    !hasPlatforms
  ) {
    return (
      <p className="mt-2 text-xs text-unze-ink-muted">
        Keine Antworten hinterlegt.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl bg-unze-surface-muted/60 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
        Antworten
      </p>
      {relevantQuestions.map((question) => (
        <div key={question.id}>
          <p className="text-[10px] font-medium text-unze-ink-secondary">
            {question.label}
          </p>
          <p className="text-xs text-unze-ink">{formatAnswerValue(application, question)}</p>
        </div>
      ))}
      {virtualAnswers.map((answer, index) => (
        <div key={`virtual-${index}`}>
          <p className="text-[10px] font-medium text-unze-ink-secondary">
            {(answer.valueJson?.label as string) ?? "Geburtsdatum"}
          </p>
          <p className="text-xs text-unze-ink">
            {answer.valueText
              ? new Date(answer.valueText).toLocaleDateString("de-DE")
              : "—"}
          </p>
        </div>
      ))}
      {hasPlatforms && (
        <div className="space-y-1 border-t border-unze-border/60 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
            Plattform-IDs
          </p>
          {application.platformIdentities!.map((identity) => {
            const opt = PLATFORM_IDENTITY_OPTIONS.find(
              (p) => p.value === identity.platformType,
            );
            return (
              <p key={identity.platformType} className="text-xs text-unze-ink">
                <span className="font-medium">{opt?.label ?? identity.platformType}:</span>{" "}
                {identity.value}
              </p>
            );
          })}
        </div>
      )}
      {relevantQuestions.length === 0 && hasPlatforms && questionMap.size > 0 && null}
    </div>
  );
}
