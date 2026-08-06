"use client";

import { InquiryBriefingPanel } from "@/components/business/InquiryBriefingPanel";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  INQUIRY_HOSTING,
  INQUIRY_INDUSTRIES,
} from "@/lib/constants/business-inquiry-config";
import type { BriefingReadiness } from "@/lib/constants/business-pricing-mastermind";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BusinessQuickInquiryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingReadiness>({});
  const [briefingFiles, setBriefingFiles] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/business/inquiries/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: data.get("contactName"),
          contactEmail: data.get("contactEmail"),
          company: data.get("company"),
          industry: data.get("industry"),
          phone: data.get("phone"),
          projectType: data.get("projectType"),
          hosting: data.get("hosting"),
          budget: data.get("budget"),
          timeline: data.get("timeline"),
          message: data.get("message"),
          briefing: {
            ...briefing,
            uploadedFileNames: briefingFiles.map((f) => f.name),
          },
          website: data.get("website"),
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; referenceId?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Anfrage fehlgeschlagen");
        return;
      }

      if (briefingFiles.length > 0 && json.referenceId) {
        const uploadData = new FormData();
        uploadData.append("referenceId", json.referenceId);
        for (const file of briefingFiles) {
          uploadData.append("files", file);
        }
        await fetch("/api/business/inquiries/briefing-files", {
          method: "POST",
          body: uploadData,
        });
      }

      router.push(
        `/business/anfrage/erfolg?ref=${encodeURIComponent(json.referenceId ?? "")}`,
      );
    } catch {
      setError("Netzwerkfehler - bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  const c = BUSINESS_COPY.inquiry;

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-[#00C853]/50 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-gray-700">
            {c.nameLabel}
          </label>
          <input id="contactName" name="contactName" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
            {c.companyLabel}
          </label>
          <input id="company" name="company" type="text" required className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
            {c.emailLabel}
          </label>
          <input id="contactEmail" name="contactEmail" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            {c.phoneLabel}
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="industry" className="mb-1 block text-sm font-medium text-gray-700">
            Branche *
          </label>
          <select id="industry" name="industry" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Bitte wählen
            </option>
            {INQUIRY_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hosting" className="mb-1 block text-sm font-medium text-gray-700">
            Hosting / Infrastruktur *
          </label>
          <select id="hosting" name="hosting" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Bitte wählen
            </option>
            {INQUIRY_HOSTING.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="projectType" className="mb-1 block text-sm font-medium text-gray-700">
          {c.projectTypeLabel}
        </label>
        <select id="projectType" name="projectType" required className={inputClass} defaultValue="">
          <option value="" disabled>
            {"Bitte wählen"}
          </option>
          {c.projectTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          {c.messageLabel}
        </label>
        <textarea id="message" name="message" required rows={5} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-700">
            {c.budgetLabel}
          </label>
          <input id="budget" name="budget" type="text" className={inputClass} />
        </div>
        <div>
          <label htmlFor="timeline" className="mb-1 block text-sm font-medium text-gray-700">
            {c.timelineLabel}
          </label>
          <input id="timeline" name="timeline" type="text" className={inputClass} />
        </div>
      </div>

      <InquiryBriefingPanel
        readiness={briefing}
        onChange={setBriefing}
        onFilesChange={setBriefingFiles}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-gray-500">{c.privacyHint}</p>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#00C853] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00b34a] disabled:opacity-60"
      >
        {loading ? "Wird gesendet…" : c.submitLabel}
      </button>
    </form>
  );
}
