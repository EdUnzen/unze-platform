"use client";

import { InquiryBriefingPanel } from "@/components/business/InquiryBriefingPanel";
import { InquiryEstimatePreview } from "@/components/business/InquiryEstimatePreview";
import { calculateProjectEstimate } from "@/lib/business/project-estimate.service";
import type { BriefingReadiness } from "@/lib/constants/business-pricing-mastermind";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  INQUIRY_ANALYSIS_TIERS,
  INQUIRY_BUDGETS,
  INQUIRY_HOSTING,
  INQUIRY_INDUSTRIES,
  INQUIRY_INFRASTRUCTURE,
  INQUIRY_MODULES,
  INQUIRY_PROJECT_TIERS,
  INQUIRY_SERVICE_MODELS,
  INQUIRY_SERVICE_PACKAGES,
  INQUIRY_TIMELINES,
  INQUIRY_WEBSITE_SCOPE,
} from "@/lib/constants/business-inquiry-config";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const STEPS = ["Unternehmen", "Projekt", "Infrastruktur", "Details"] as const;

function readPrefill(searchParams: URLSearchParams) {
  return {
    projectType: searchParams.get("typ") ?? "",
    analysisTier: searchParams.get("analyse") ?? "",
    servicePackage: searchParams.get("paket") ?? "",
  };
}

export function BusinessProjectInquiryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = useMemo(() => readPrefill(searchParams), [searchParams]);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectType, setProjectType] = useState(
    prefill.projectType || (prefill.analysisTier ? "analysis" : ""),
  );
  const [websiteScope, setWebsiteScope] = useState("");
  const [projectTier, setProjectTier] = useState("starter");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [briefing, setBriefing] = useState<BriefingReadiness>({});
  const [briefingFiles, setBriefingFiles] = useState<File[]>([]);

  const isWebsiteProject = projectType === "website";

  const liveEstimate = useMemo(() => {
    if (!projectType || step < 1) return null;
    return calculateProjectEstimate({
      projectType,
      websiteScope: websiteScope || undefined,
      projectTier: isWebsiteProject ? projectTier : undefined,
      industry: industry || undefined,
      budget: budget || undefined,
      timeline: timeline || undefined,
      modules: selectedModules,
      infrastructure: selectedInfrastructure,
      briefing,
    });
  }, [
    projectType,
    websiteScope,
    projectTier,
    industry,
    budget,
    timeline,
    selectedModules,
    selectedInfrastructure,
    briefing,
    step,
    isWebsiteProject,
  ]);

  const c = BUSINESS_COPY.inquiry;
  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-[#00C853]/50 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20";

  const showWebsiteScope = isWebsiteProject;
  const showModules =
    projectType === "business_core" || projectType === "webapp" || projectType === "industry";
  const showAnalysisTier =
    projectType === "analysis" || projectType === "" || prefill.analysisTier !== "";
  const showServicePackage =
    projectType === "service" ||
    projectType === "business_core" ||
    projectType === "website" ||
    projectType === "webapp" ||
    prefill.servicePackage !== "";

  function toggleValue(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((m) => m !== value) : [...list, value]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (step < STEPS.length - 1) {
      if (step === 0) {
        if (!data.get("company") || !data.get("industry") || !data.get("contactName") || !data.get("contactEmail")) {
          setError("Bitte alle Pflichtfelder ausfüllen");
          return;
        }
      }
      if (step === 1 && !data.get("projectType")) {
        setError("Bitte gewünschte Lösung wählen");
        return;
      }
      if (step === 1 && data.get("projectType") === "website" && !data.get("projectTier")) {
        setError("Bitte Paket-Stufe wählen");
        return;
      }
      if (step === 2 && !data.get("hosting")) {
        setError("Bitte Hosting-Situation wählen");
        return;
      }
      setError(null);
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    setError(null);

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
          serviceModel: data.get("serviceModel"),
          analysisTier: data.get("analysisTier"),
          servicePackage: data.get("servicePackage"),
          websiteScope: data.get("websiteScope"),
          projectTier: data.get("projectTier"),
          hosting: data.get("hosting"),
          budget: data.get("budget"),
          timeline: data.get("timeline"),
          preferredDate: data.get("preferredDate"),
          message: data.get("message"),
          modules: selectedModules,
          infrastructure: selectedInfrastructure,
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
      setError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <p className="text-sm text-gray-600">
        Strukturierte Projektanfrage — wir sehen im Studio sofort, was Sie brauchen. Kurze Rückfragen
        per E-Mail sind möglich; für ein Angebot bitte alle relevanten Felder ausfüllen.
      </p>

      <div className="flex gap-1.5">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-1.5 py-2 text-center text-[10px] font-semibold transition sm:text-xs ${
              i === step
                ? "bg-[#00C853] text-white"
                : i < step
                  ? "bg-[#00C853]/15 text-[#00C853]"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
              {c.companyLabel} *
            </label>
            <input id="company" name="company" type="text" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="industry" className="mb-1 block text-sm font-medium text-gray-700">
              Branche *
            </label>
            <select
              id="industry"
              name="industry"
              required
              className={inputClass}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-gray-700">
                Ansprechpartner *
              </label>
              <input id="contactName" name="contactName" type="text" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
                {c.emailLabel} *
              </label>
              <input id="contactEmail" name="contactEmail" type="email" required className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              {c.phoneLabel}
            </label>
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="projectType" className="mb-1 block text-sm font-medium text-gray-700">
              Gewünschte Lösung *
            </label>
            <select
              id="projectType"
              name="projectType"
              required
              className={inputClass}
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option value="" disabled>
                Bitte wählen
              </option>
              {c.projectTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {showWebsiteScope ? (
            <div>
              <label htmlFor="websiteScope" className="mb-1 block text-sm font-medium text-gray-700">
                Website-Umfang
              </label>
              <select
                id="websiteScope"
                name="websiteScope"
                className={inputClass}
                value={websiteScope}
                onChange={(e) => setWebsiteScope(e.target.value)}
              >
                <option value="">Noch offen</option>
                {INQUIRY_WEBSITE_SCOPE.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showWebsiteScope ? (
            <div>
              <label htmlFor="projectTier" className="mb-1 block text-sm font-medium text-gray-700">
                Paket-Stufe *
              </label>
              <select
                id="projectTier"
                name="projectTier"
                required
                className={inputClass}
                value={projectTier}
                onChange={(e) => setProjectTier(e.target.value)}
              >
                {INQUIRY_PROJECT_TIERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Starter = Werkstatt-Referenz im Designsystem · Premium = individuelles Design / Sonderstruktur
              </p>
            </div>
          ) : null}

          <div>
            <label htmlFor="serviceModel" className="mb-1 block text-sm font-medium text-gray-700">
              Vorgehen / Modell
            </label>
            <select id="serviceModel" name="serviceModel" className={inputClass} defaultValue="">
              <option value="">Bitte wählen</option>
              {INQUIRY_SERVICE_MODELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {showAnalysisTier ? (
            <div>
              <label htmlFor="analysisTier" className="mb-1 block text-sm font-medium text-gray-700">
                Analyse-Stufe (falls gewünscht)
              </label>
              <select
                id="analysisTier"
                name="analysisTier"
                className={inputClass}
                defaultValue={prefill.analysisTier || ""}
              >
                <option value="">Noch offen</option>
                {INQUIRY_ANALYSIS_TIERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showServicePackage ? (
            <div>
              <label htmlFor="servicePackage" className="mb-1 block text-sm font-medium text-gray-700">
                Servicepaket-Interesse
              </label>
              <select
                id="servicePackage"
                name="servicePackage"
                className={inputClass}
                defaultValue={prefill.servicePackage || ""}
              >
                <option value="">Noch offen</option>
                {INQUIRY_SERVICE_PACKAGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showModules ? (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Gewünschte Module (optional)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {INQUIRY_MODULES.map((mod) => (
                  <label
                    key={mod.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      selectedModules.includes(mod.value)
                        ? "border-[#00C853]/40 bg-[#00C853]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.value)}
                      onChange={() => toggleValue(selectedModules, mod.value, setSelectedModules)}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]/30"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-700">
                Budget
              </label>
              <select
                id="budget"
                name="budget"
                className={inputClass}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="">Noch offen</option>
                {INQUIRY_BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timeline" className="mb-1 block text-sm font-medium text-gray-700">
                Gewünschter Zeitraum
              </label>
              <select
                id="timeline"
                name="timeline"
                className={inputClass}
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              >
                <option value="">Flexibel</option>
                {INQUIRY_TIMELINES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {step >= 1 && step < 2 && liveEstimate ? (
        <InquiryEstimatePreview estimate={liveEstimate} compact />
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="hosting" className="mb-1 block text-sm font-medium text-gray-700">
              Hosting & Infrastruktur *
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
            <p className="mt-1.5 text-xs text-gray-500">
              Verträge mit Hosting-Anbietern schließen Sie direkt ab — wir richten alles fachgerecht ein.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Gewünschte Einrichtungs-Leistungen (optional)
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {INQUIRY_INFRASTRUCTURE.map((item) => (
                <label
                  key={item.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    selectedInfrastructure.includes(item.value)
                      ? "border-[#00C853]/40 bg-[#00C853]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInfrastructure.includes(item.value)}
                    onChange={() =>
                      toggleValue(selectedInfrastructure, item.value, setSelectedInfrastructure)
                    }
                    className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]/30"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              In Business/Premium oft inklusive: SEO, Newsletter. Nicht angehakt → automatische Gutschrift in der
              Schätzung.
            </p>
          </div>

          {liveEstimate ? <InquiryEstimatePreview estimate={liveEstimate} compact /> : null}

          <InquiryBriefingPanel
            readiness={briefing}
            onChange={setBriefing}
            onFilesChange={setBriefingFiles}
          />
        </div>
      ) : null}

      {step === 3 && liveEstimate ? <InquiryEstimatePreview estimate={liveEstimate} compact /> : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
              {c.messageLabel} *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className={inputClass}
              placeholder="Beschreiben Sie Ihr Vorhaben, Ihre Ziele und besondere Anforderungen…"
            />
          </div>
          <div>
            <label htmlFor="preferredDate" className="mb-1 block text-sm font-medium text-gray-700">
              Terminwunsch für Erstgespräch (optional)
            </label>
            <input
              id="preferredDate"
              name="preferredDate"
              type="text"
              className={inputClass}
              placeholder="z. B. KW 28, vormittags"
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Zurück
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-[#00C853] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00b34a] disabled:opacity-60"
        >
          {loading
            ? "Wird gesendet…"
            : step < STEPS.length - 1
              ? "Weiter"
              : c.submitLabel}
        </button>
      </div>
      {step === STEPS.length - 1 ? (
        <p className="text-xs text-gray-500">{c.privacyHint}</p>
      ) : null}
    </form>
  );
}
