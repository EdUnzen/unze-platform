"use client";

import { InquiryBriefingPanel } from "@/components/business/InquiryBriefingPanel";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  ANALYSIS_COMPANY_SIZES,
  ANALYSIS_PRICE_DISCLAIMER,
  getAnalysisTier,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { INQUIRY_INDUSTRIES } from "@/lib/constants/business-inquiry-config";
import type { BriefingReadiness } from "@/lib/constants/business-pricing-mastermind";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  initialTier?: AnalysisTierId;
};

export function AnalysisInquiryForm({ initialTier = "quick" }: Props) {
  const router = useRouter();
  const [tier, setTier] = useState<AnalysisTierId>(initialTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingReadiness>({});
  const [briefingFiles, setBriefingFiles] = useState<File[]>([]);

  const tierMeta = getAnalysisTier(tier)!;
  const c = BUSINESS_COPY.analyse.form;
  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-[#00C853]/50 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20";

  useEffect(() => {
    setTier(initialTier);
  }, [initialTier]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/business/inquiries/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          contactName: data.get("contactName"),
          contactEmail: data.get("contactEmail"),
          company: data.get("company"),
          phone: data.get("phone"),
          websiteUrl: data.get("websiteUrl"),
          industry: data.get("industry"),
          companySize: data.get("companySize"),
          goals: data.get("goals"),
          description: data.get("description"),
          employeeCount: data.get("employeeCount"),
          currentSoftware: data.get("currentSoftware"),
          offerProcess: data.get("offerProcess"),
          invoicing: data.get("invoicing"),
          crm: data.get("crm"),
          marketing: data.get("marketing"),
          problems: data.get("problems"),
          improvements: data.get("improvements"),
          preferredCallDate: data.get("preferredCallDate"),
          systemAccessNote: data.get("systemAccessNote"),
          briefing: {
            ...briefing,
            uploadedFileNames: briefingFiles.map((f) => f.name),
          },
          website: data.get("website"),
        }),
      });

      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        referenceId?: string;
        checkoutUrl?: string | null;
        paymentNote?: string;
      };

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

      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }

      const params = new URLSearchParams({ ref: json.referenceId ?? "" });
      if (json.paymentNote) params.set("note", json.paymentNote);
      router.push(`/business/analyse/erfolg?${params.toString()}`);
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  const showExtended = tier !== "quick";
  const showPremium = tier === "premium";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div>
        <label htmlFor="analysis-tier" className="mb-2 block text-sm font-medium text-gray-700">
          Analyse-Stufe *
        </label>
        <select
          id="analysis-tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as AnalysisTierId)}
          className={inputClass}
        >
          <option value="quick">Stufe 1 — Quick Analyse (59,90 €)</option>
          <option value="business">Stufe 2 — Business Analyse (ab 249 €)</option>
          <option value="premium">Stufe 3 — Premium Analyse (ab 490 €)</option>
        </select>
        <p className="mt-2 text-sm text-gray-600">{tierMeta.subtitle}</p>
        {tierMeta.requiresPayment ? (
          <p className="mt-1 text-sm font-medium text-gray-900">
            {tierMeta.priceDisplay}
            {tierMeta.pricePeriod ?? ""}
            <span className="ml-2 font-normal text-gray-500">· {ANALYSIS_PRICE_DISCLAIMER}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">{tierMeta.note}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
            Unternehmen *
          </label>
          <input id="company" name="company" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-gray-700">
            Ansprechpartner *
          </label>
          <input id="contactName" name="contactName" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
            E-Mail *
          </label>
          <input id="contactEmail" name="contactEmail" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-gray-700">
            Website *
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            required
            placeholder="https://"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefon (optional)
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>
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
          <label htmlFor="companySize" className="mb-1 block text-sm font-medium text-gray-700">
            Unternehmensgröße *
          </label>
          <select id="companySize" name="companySize" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Bitte wählen
            </option>
            {ANALYSIS_COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="goals" className="mb-1 block text-sm font-medium text-gray-700">
          Ziele *
        </label>
        <textarea id="goals" name="goals" required rows={3} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Kurzbeschreibung (optional)
        </label>
        <textarea id="description" name="description" rows={2} className={inputClass} />
      </div>

      {showExtended ? (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-900">{c.extendedTitle}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="employeeCount" className="mb-1 block text-sm font-medium text-gray-700">
                Mitarbeiterzahl
              </label>
              <input id="employeeCount" name="employeeCount" type="text" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="currentSoftware" className="mb-1 block text-sm font-medium text-gray-700">
                Aktuelle Software *
              </label>
              <input id="currentSoftware" name="currentSoftware" type="text" required={showExtended} className={inputClass} />
            </div>
            <div>
              <label htmlFor="offerProcess" className="mb-1 block text-sm font-medium text-gray-700">
                Angebotsprozess
              </label>
              <input id="offerProcess" name="offerProcess" type="text" className={inputClass} />
            </div>
            <div>
              <label htmlFor="invoicing" className="mb-1 block text-sm font-medium text-gray-700">
                Rechnungsstellung
              </label>
              <input id="invoicing" name="invoicing" type="text" className={inputClass} />
            </div>
            <div>
              <label htmlFor="crm" className="mb-1 block text-sm font-medium text-gray-700">
                CRM
              </label>
              <input id="crm" name="crm" type="text" className={inputClass} />
            </div>
            <div>
              <label htmlFor="marketing" className="mb-1 block text-sm font-medium text-gray-700">
                Marketing
              </label>
              <input id="marketing" name="marketing" type="text" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="problems" className="mb-1 block text-sm font-medium text-gray-700">
                Aktuelle Probleme *
              </label>
              <textarea id="problems" name="problems" required={showExtended} rows={2} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="improvements" className="mb-1 block text-sm font-medium text-gray-700">
                Gewünschte Verbesserungen *
              </label>
              <textarea id="improvements" name="improvements" required={showExtended} rows={2} className={inputClass} />
            </div>
          </div>
        </div>
      ) : null}

      {showPremium ? (
        <div className="space-y-4 rounded-2xl border border-[#00C853]/20 bg-[#00C853]/5 p-5">
          <h3 className="font-semibold text-gray-900">{c.premiumTitle}</h3>
          <div>
            <label htmlFor="preferredCallDate" className="mb-1 block text-sm font-medium text-gray-700">
              Terminwunsch für Gespräch *
            </label>
            <input
              id="preferredCallDate"
              name="preferredCallDate"
              type="text"
              required={showPremium}
              placeholder="z. B. KW 30, vormittags"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="systemAccessNote" className="mb-1 block text-sm font-medium text-gray-700">
              Optionale Systemzugänge (nur mit Ihrer Zustimmung)
            </label>
            <textarea
              id="systemAccessNote"
              name="systemAccessNote"
              rows={2}
              placeholder="Welche Systeme könnten relevant sein?"
              className={inputClass}
            />
          </div>
        </div>
      ) : null}

      <InquiryBriefingPanel
        readiness={briefing}
        onChange={setBriefing}
        onFilesChange={setBriefingFiles}
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#00C853] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#00b34a] disabled:opacity-60"
      >
        {loading ? "Wird gesendet…" : c.submitPaid}
      </button>

      <p className="text-center text-xs text-gray-500">{c.privacyHint}</p>
    </form>
  );
}
