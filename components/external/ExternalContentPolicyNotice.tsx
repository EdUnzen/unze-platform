import { EXTERNAL_CONTENT_POLICY } from "@/lib/constants/reports";
import { Info } from "lucide-react";

export function ExternalContentPolicyNotice() {
  return (
    <aside className="rounded-2xl border border-unze-border/80 bg-unze-surface-muted/40 px-3 py-2.5 text-[11px] leading-relaxed text-unze-ink-secondary">
      <p className="flex items-start gap-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-unze-green" aria-hidden />
        <span>{EXTERNAL_CONTENT_POLICY}</span>
      </p>
    </aside>
  );
}
