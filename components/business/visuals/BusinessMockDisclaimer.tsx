import { cn } from "@/lib/utils/cn";
import { BUSINESS_MOCK_PREVIEW } from "@/lib/constants/business-pricing-policy";

type BusinessMockDisclaimerProps = {
  className?: string;
  /** inline = eine Zeile unter Visuals; note = dezenter Hinweisblock */
  variant?: "inline" | "note";
};

/** Leichte EU-Transparenzkennzeichnung für Demo-/KI-Visuals — kein Warnbanner */
export function BusinessMockDisclaimer({
  className,
  variant = "inline",
}: BusinessMockDisclaimerProps) {
  const c = BUSINESS_MOCK_PREVIEW;

  if (variant === "note") {
    return (
      <p
        className={cn(
          "mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-center text-xs leading-relaxed text-gray-500",
          className,
        )}
        role="note"
      >
        <span className="font-medium text-gray-600">{c.badge}.</span> {c.footnote}
      </p>
    );
  }

  return (
    <p className={cn("text-center text-xs leading-relaxed text-gray-500", className)} role="note">
      {c.footnote}
    </p>
  );
}

/** Kleines Label direkt am Demo-/KI-Visual */
export function BusinessAiContentLabel({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "onDark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
        tone === "onDark"
          ? "bg-white/10 text-white/70"
          : "bg-gray-100 text-gray-500",
        className,
      )}
    >
      {BUSINESS_MOCK_PREVIEW.badge}
    </span>
  );
}
