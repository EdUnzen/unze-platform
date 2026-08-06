import { DocumentLogo } from "@/components/studio/DocumentLogo";
import {
  STUDIO_COMPANY_PROFILE,
  formatCompanyAddressLines,
  formatCompanyContactLines,
} from "@/lib/studio/company-profile";

type DocumentLetterheadProps = {
  documentLabel: string;
  referenceId: string;
  dateLabel: string;
  dateValue: string;
  secondaryDateLabel?: string;
  secondaryDateValue?: string;
};

export function DocumentLetterhead({
  documentLabel,
  referenceId,
  dateLabel,
  dateValue,
  secondaryDateLabel,
  secondaryDateValue,
}: DocumentLetterheadProps) {
  const p = STUDIO_COMPANY_PROFILE;
  const addressLines = formatCompanyAddressLines();
  const contactLines = formatCompanyContactLines();

  return (
    <header className="border-b border-gray-200 pb-6 print:border-gray-400">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <DocumentLogo />
          <p className="mt-3 text-base font-bold tracking-tight text-gray-900">{p.studioName}</p>
          <p className="text-sm text-gray-700">{p.documentSubtitle}</p>
          <p className="text-xs text-gray-500">{p.tagline}</p>
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {documentLabel}
          </p>
          <p className="mt-1 font-mono font-semibold text-emerald-700">{referenceId}</p>
          <p className="mt-2 text-gray-500">
            {dateLabel}: {dateValue}
          </p>
          {secondaryDateLabel && secondaryDateValue ? (
            <p className="text-gray-500">
              {secondaryDateLabel}: {secondaryDateValue}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Absender</p>
          <address className="mt-2 not-italic leading-relaxed text-gray-700">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Kontakt</p>
          <div className="mt-2 leading-relaxed text-gray-700">
            {contactLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-2 text-xs text-gray-500">Steuernr. {p.taxNumber}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DocumentFooter({ closingNote }: { closingNote: string }) {
  const p = STUDIO_COMPANY_PROFILE;
  return (
    <footer className="mt-16 border-t border-gray-200 pt-6 text-xs text-gray-500 print:border-gray-400">
      <p className="font-medium text-gray-700">{p.studioName}</p>
      <p className="mt-1">
        {p.legalName} · {p.street} · {p.postalCode} {p.city} · {p.country}
      </p>
      <p className="mt-1">
        {p.phone} · {p.email} · {p.businessWebsite}
      </p>
      <p className="mt-2">{p.vatNote}</p>
      <p className="mt-2">{closingNote}</p>
    </footer>
  );
}
