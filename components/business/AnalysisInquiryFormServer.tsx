import { BusinessLink } from "@/components/business/BusinessLink";
import { analysisTierToInquiryHref } from "@/lib/business/inquiry-links";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  ANALYSIS_COMPANY_SIZES,
  ANALYSIS_PRICE_DISCLAIMER,
  getAnalysisTier,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { INQUIRY_INDUSTRIES } from "@/lib/constants/business-inquiry-config";

const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-[#00C853]/50 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20";

type Props = {
  tier: AnalysisTierId;
  error?: string | null;
  shopOrderReference?: string | null;
};

/** Reines Server-HTML-Formular — kein Client-JavaScript, kein Webpack-Chunk. */
export function AnalysisInquiryFormServer({ tier, error, shopOrderReference }: Props) {
  const tierMeta = getAnalysisTier(tier)!;
  const c = BUSINESS_COPY.analyse.form;
  const showExtended = tier !== "quick";
  const showPremium = tier === "premium";
  const alreadyPaid = Boolean(shopOrderReference?.trim());

  return (
    <form method="POST" action="/api/business/inquiries/analysis/submit" className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input type="hidden" name="tier" value={tier} />
      {alreadyPaid ? (
        <input type="hidden" name="shopOrderReference" value={shopOrderReference!} />
      ) : null}

      <div className="rounded-2xl border border-[#00C853]/20 bg-[#00C853]/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#00C853]">
          Ausgewählte Stufe
        </p>
        <p className="mt-1 font-semibold text-gray-900">
          Stufe {tierMeta.stage} — {tierMeta.name}
        </p>
        <p className="mt-1 text-sm text-gray-600">{tierMeta.subtitle}</p>
        {tierMeta.requiresPayment && !alreadyPaid ? (
          <p className="mt-2 text-sm font-medium text-gray-900">
            {tierMeta.priceDisplay}
            {tierMeta.pricePeriod ?? ""}
            <span className="ml-2 font-normal text-gray-500">· {ANALYSIS_PRICE_DISCLAIMER}</span>
          </p>
        ) : alreadyPaid ? (
          <p className="mt-2 text-sm font-semibold text-emerald-700">Zahlung bestätigt — Formular absenden</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">{tierMeta.note}</p>
        )}
        {!alreadyPaid ? (
          <BusinessLink
            href={analysisTierToInquiryHref(tier)}
            className="mt-3 inline-block text-sm font-semibold text-[#00C853] hover:underline"
          >
            Analyse über Anfrageformular starten
          </BusinessLink>
        ) : (
          <BusinessLink
            href="#analyse-stufen"
            className="mt-3 inline-block text-sm font-semibold text-[#00C853] hover:underline"
          >
            Stufen-Übersicht
          </BusinessLink>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
            Unternehmen *
          </label>
          <input id="company" name="company" type="text" required className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-gray-700">
            Ansprechpartner *
          </label>
          <input id="contactName" name="contactName" type="text" required className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
            E-Mail *
          </label>
          <input id="contactEmail" name="contactEmail" type="email" required className={INPUT_CLASS} />
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
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefon (optional)
          </label>
          <input id="phone" name="phone" type="tel" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="industry" className="mb-1 block text-sm font-medium text-gray-700">
            Branche *
          </label>
          <select id="industry" name="industry" required className={INPUT_CLASS} defaultValue="">
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
          <select id="companySize" name="companySize" required className={INPUT_CLASS} defaultValue="">
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
        <textarea id="goals" name="goals" required rows={3} className={INPUT_CLASS} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Kurzbeschreibung (optional)
        </label>
        <textarea id="description" name="description" rows={2} className={INPUT_CLASS} />
      </div>

      {showExtended ? (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-900">{c.extendedTitle}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="employeeCount" className="mb-1 block text-sm font-medium text-gray-700">
                Mitarbeiterzahl
              </label>
              <input id="employeeCount" name="employeeCount" type="text" className={INPUT_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="currentSoftware" className="mb-1 block text-sm font-medium text-gray-700">
                Aktuelle Software *
              </label>
              <input
                id="currentSoftware"
                name="currentSoftware"
                type="text"
                required
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="offerProcess" className="mb-1 block text-sm font-medium text-gray-700">
                Angebotsprozess
              </label>
              <input id="offerProcess" name="offerProcess" type="text" className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="invoicing" className="mb-1 block text-sm font-medium text-gray-700">
                Rechnungsstellung
              </label>
              <input id="invoicing" name="invoicing" type="text" className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="crm" className="mb-1 block text-sm font-medium text-gray-700">
                CRM
              </label>
              <input id="crm" name="crm" type="text" className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="marketing" className="mb-1 block text-sm font-medium text-gray-700">
                Marketing
              </label>
              <input id="marketing" name="marketing" type="text" className={INPUT_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="problems" className="mb-1 block text-sm font-medium text-gray-700">
                Aktuelle Probleme *
              </label>
              <textarea id="problems" name="problems" required rows={2} className={INPUT_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="improvements" className="mb-1 block text-sm font-medium text-gray-700">
                Gewünschte Verbesserungen *
              </label>
              <textarea id="improvements" name="improvements" required rows={2} className={INPUT_CLASS} />
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
              required
              placeholder="z. B. KW 30, vormittags"
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-[#00C853] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#00b34a]"
      >
        {alreadyPaid ? c.submitAfterPayment ?? "Analyse starten" : c.submitPaid}
      </button>

      <p className="text-center text-xs text-gray-500">{c.privacyHint}</p>
    </form>
  );
}
