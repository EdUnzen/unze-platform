import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ExternalLinkTrustNoticeProps {
  communityTitle: string;
  compact?: boolean;
  className?: string;
}

export function ExternalLinkTrustNotice({
  communityTitle,
  compact = false,
  className,
}: ExternalLinkTrustNoticeProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-amber-200/80 bg-amber-50/80 text-amber-950",
        compact ? "px-2.5 py-2 text-[10px] leading-relaxed" : "px-3 py-2.5 text-[11px] leading-relaxed",
        className,
      )}
    >
      <p className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          {compact ? (
            <>
              Inhalt liegt auf einer externen Plattform.{" "}
              <strong>{communityTitle}</strong> ist verantwortlich. UNZE moderiert bei
              Meldungen — kein Re-Upload fremder Medien.
            </>
          ) : (
            <>
              Externe Links (Discord, WhatsApp, YouTube, TikTok, etc.) führen aus UNZE
              heraus. <strong>{communityTitle}</strong> und der Community Owner sind für
              Inhalte auf externen Plattformen verantwortlich. UNZE kann bei Meldungen
              moderieren oder Communities sperren — übernimmt aber keine Haftung für
              externe Dienste. Fremde Videos/Bilder werden nicht auf UNZE neu gehostet.
            </>
          )}
        </span>
      </p>
    </aside>
  );
}
