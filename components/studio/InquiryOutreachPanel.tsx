"use client";

import {
  buildInquiryEmailDraft,
  getInquiryOutreachSuggestionNote,
  INQUIRY_EMAIL_TEMPLATES,
  suggestInquiryEmailTemplate,
  type InquiryEmailTemplateId,
  type InquiryOutreachContext,
} from "@/lib/studio/inquiry-outreach";
import { Mail } from "lucide-react";
import { useMemo, useState } from "react";

type InquiryOutreachPanelProps = {
  context: InquiryOutreachContext;
};

export function InquiryOutreachPanel({ context }: InquiryOutreachPanelProps) {
  const suggestedId = useMemo(() => suggestInquiryEmailTemplate(context), [context]);
  const [selectedId, setSelectedId] = useState<InquiryEmailTemplateId>(suggestedId);

  const draft = useMemo(
    () => buildInquiryEmailDraft(selectedId, context),
    [selectedId, context],
  );
  const suggestionNote = useMemo(() => getInquiryOutreachSuggestionNote(context), [context]);
  const selectedMeta = INQUIRY_EMAIL_TEMPLATES.find((t) => t.id === selectedId);

  async function copyBody() {
    try {
      await navigator.clipboard.writeText(draft.body);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Kunden-E-Mail (Vorlage)
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Freundliche Antworten — vorgefertigt, anpassbar in Ihrem Mailprogramm.
          </p>
        </div>
        {selectedId === suggestedId ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Mastermind-Empfehlung
          </span>
        ) : null}
      </div>

      {suggestionNote ? (
        <p className="mt-3 rounded-lg border border-sky-200/80 bg-sky-50/80 px-3 py-2 text-xs text-sky-900">
          {suggestionNote}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="inquiry-email-template" className="mb-1 block text-xs font-medium text-gray-600">
            Vorlage wählen
          </label>
          <select
            id="inquiry-email-template"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value as InquiryEmailTemplateId)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {INQUIRY_EMAIL_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
                {template.id === suggestedId ? " ★" : ""}
              </option>
            ))}
          </select>
          {selectedMeta ? (
            <p className="mt-1 text-xs text-gray-500">{selectedMeta.description}</p>
          ) : null}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Betreff</p>
          <p className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
            {draft.subject}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Nachricht</p>
          <textarea
            readOnly
            rows={14}
            value={draft.body}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={draft.mailtoHref}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#1DB872" }}
        >
          <Mail className="h-4 w-4" aria-hidden />
          E-Mail öffnen
        </a>
        <button
          type="button"
          onClick={copyBody}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Text kopieren
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Standard-Zahlung: 50 % Anzahlung · 50 % bei Abnahme. Mastermind-Zahlen erscheinen nie in
        Kunden-Mails.
      </p>
    </section>
  );
}
