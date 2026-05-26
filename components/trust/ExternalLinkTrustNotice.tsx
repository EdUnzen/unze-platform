import { AlertTriangle } from "lucide-react";

interface ExternalLinkTrustNoticeProps {
  communityTitle: string;
}

export function ExternalLinkTrustNotice({
  communityTitle,
}: ExternalLinkTrustNoticeProps) {
  return (
    <aside className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-[11px] leading-relaxed text-amber-950">
      <p className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Externe Links (Discord, WhatsApp, etc.) führen aus UNZE heraus.{" "}
          <strong>{communityTitle}</strong> und der Community Owner sind für Inhalte
          auf externen Plattformen verantwortlich. UNZE kann bei Meldungen moderieren
          oder Communities sperren — übernimmt aber keine Haftung für externe Dienste.
        </span>
      </p>
    </aside>
  );
}
