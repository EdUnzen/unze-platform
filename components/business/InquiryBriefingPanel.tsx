"use client";

import {
  BRIEFING_COMPLETE_MESSAGE,
  BRIEFING_REQUIREMENTS,
  type BriefingReadiness,
} from "@/lib/constants/business-pricing-mastermind";
import { Check, Upload } from "lucide-react";

type InquiryBriefingPanelProps = {
  readiness: BriefingReadiness;
  onChange: (next: BriefingReadiness) => void;
  onFilesChange?: (files: File[]) => void;
  showUploads?: boolean;
};

export function InquiryBriefingPanel({
  readiness,
  onChange,
  onFilesChange,
  showUploads = true,
}: InquiryBriefingPanelProps) {
  function toggle(key: keyof BriefingReadiness, value: boolean) {
    onChange({ ...readiness, [key]: value });
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
        Was wir für Ihr Projekt brauchen
      </p>
      <p className="mt-2 text-sm text-gray-700">
        Bitte bestätigen Sie, was Sie bereits haben — und laden Sie Material hoch, sobald möglich.{" "}
        {BRIEFING_COMPLETE_MESSAGE}
      </p>

      <ul className="mt-4 space-y-3">
        {BRIEFING_REQUIREMENTS.map((req) => {
          const checkKey =
            req.id === "logo"
              ? "hasLogo"
              : req.id === "texts"
                ? "hasTexts"
                : req.id === "images"
                  ? "hasImages"
                  : req.id === "legal"
                    ? "hasLegalTexts"
                    : req.id === "reference"
                      ? "hasReference"
                      : null;

          return (
            <li key={req.id} className="rounded-xl border border-white/80 bg-white/70 p-3">
              <div className="flex items-start gap-3">
                {checkKey ? (
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(readiness[checkKey])}
                      onChange={(e) => toggle(checkKey, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]/30"
                    />
                    <span>
                      <span className="font-medium text-gray-900">
                        {req.label}
                        {req.required ? " *" : ""}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-600">{req.detail}</span>
                    </span>
                  </label>
                ) : (
                  <span>
                    <span className="font-medium text-gray-900">{req.label}</span>
                    <span className="mt-0.5 block text-xs text-gray-600">{req.detail}</span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        <label htmlFor="materialNotes" className="mb-1 block text-sm font-medium text-gray-700">
          Hinweise zu Material / Referenz-Template
        </label>
        <textarea
          id="materialNotes"
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#00C853]/50 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20"
          placeholder="z. B. Referenz Arztpraxis, Texte kommen morgen, Logo als PNG angehängt …"
          value={readiness.materialNotes ?? ""}
          onChange={(e) => onChange({ ...readiness, materialNotes: e.target.value })}
        />
      </div>

      {showUploads ? (
        <div className="mt-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Upload className="h-4 w-4" aria-hidden />
            Material hochladen (Logo, Bilder, Texte — optional jetzt)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#00C853]/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#00b34a]"
            onChange={(e) => onFilesChange?.(Array.from(e.target.files ?? []))}
          />
          <p className="mt-1.5 text-xs text-gray-500">Max. empfohlen: 10 MB pro Datei · PDF, Word, Bilder, ZIP</p>
        </div>
      ) : null}

      {readiness.hasLogo &&
      readiness.hasTexts &&
      readiness.hasImages &&
      readiness.hasLegalTexts &&
      readiness.hasReference ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-800">
          <Check className="h-4 w-4" aria-hidden />
          Briefing vollständig — optimale Planung möglich
        </p>
      ) : (
        <p className="mt-4 text-xs text-amber-800">
          Noch nicht vollständig — Lieferzeit startet erst nach vollständigem Material.
        </p>
      )}
    </div>
  );
}
