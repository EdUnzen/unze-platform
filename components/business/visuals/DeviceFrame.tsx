import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";

export type DeviceVariant = "laptop" | "desktop" | "tablet" | "phone";

const DEVICE_LABELS: Record<DeviceVariant, string> = {
  laptop: "Laptop",
  desktop: "Desktop",
  tablet: "Tablet",
  phone: "Smartphone",
};

/** Einheitlicher, weicher Browser-/Geräterahmen — durchgängig abgerundet */
export function DeviceFrame({
  children,
  label,
  variant = "laptop",
  className = "",
  fillContainer = false,
  hideCaption = false,
  chrome = "slim",
}: {
  children: ReactNode;
  label?: string;
  variant?: DeviceVariant;
  className?: string;
  fillContainer?: boolean;
  hideCaption?: boolean;
  chrome?: "standard" | "slim";
}) {
  const displayLabel = hideCaption ? undefined : (label ?? DEVICE_LABELS[variant]);
  const phoneChrome =
    chrome === "standard"
      ? { border: 5, padding: 6, inset: 8 }
      : { border: 3.5, padding: 4, inset: 6 };

  if (variant === "phone") {
    return (
      <div className={cn("mx-auto h-auto w-full max-w-[320px] shrink-0", className)} data-export="device-phone">
        {/* 1:1 Werkstatt OrganizerPhoneFrame — rund, Display kantenlos */}
        <div
          className="h-auto w-full shadow-lg"
          style={{
            borderRadius: "2.25rem",
            border: `${phoneChrome.border}px solid hsl(222 20% 14%)`,
            background: "hsl(222 20% 14%)",
            padding: phoneChrome.padding,
          }}
        >
          <div
            className="relative h-auto w-full overflow-hidden"
            style={{
              aspectRatio: "9 / 19.5",
              borderRadius: "1.85rem",
              background: "hsl(222 20% 14%)",
            }}
          >
            {/* Werkstatt-UI hat pt-9/px-3. Screenshots gehen in die Ecke — Glasrand,
                damit Logo und Glocke nicht unter der Gehäuse-Rundung liegen. */}
            <div
              className="absolute overflow-hidden"
              style={{ inset: phoneChrome.inset, borderRadius: "0.5rem" }}
            >
              {children}
            </div>
          </div>
        </div>
        {displayLabel ? (
          <p className="mt-4 max-w-full px-2 text-center text-xs font-medium leading-snug text-gray-500 break-words">
            {displayLabel}
          </p>
        ) : null}
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div className={cn("mx-auto max-w-md", className)} data-export="device-tablet">
        <div
          className={cn(
            "overflow-hidden border-[4px] border-gray-800 bg-gray-800 p-2 shadow-2xl shadow-gray-900/20",
            BUSINESS_VISUAL.containerRadius,
          )}
        >
          <div className={cn("overflow-hidden bg-white", BUSINESS_VISUAL.containerRadius)}>{children}</div>
        </div>
        {displayLabel ? (
          <p className="mt-4 text-center text-sm font-medium text-gray-500">{displayLabel}</p>
        ) : null}
      </div>
    );
  }

  const widthClass = fillContainer ? "max-w-none w-full" : variant === "desktop" ? "max-w-5xl" : "max-w-4xl";

  return (
    <div className={cn("mx-auto", widthClass, className)} data-export={`device-${variant}`}>
      <div
        className={cn(
          "overflow-hidden border border-gray-200/90 bg-white shadow-xl shadow-gray-900/10 ring-1 ring-black/[0.04] transition duration-500 hover:shadow-2xl hover:shadow-[#00C853]/5",
          BUSINESS_VISUAL.containerRadius,
        )}
      >
        <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex flex-1 items-center justify-center">
            <span className="rounded-full bg-gray-100 px-3 py-0.5 font-mono text-[10px] text-gray-400">
              app.unze.business
            </span>
          </div>
        </div>
        <div className="overflow-hidden bg-white">{children}</div>
      </div>
      {displayLabel ? (
        <p className="mt-5 max-w-full px-2 text-center text-sm font-medium leading-snug text-gray-500 break-words">
          {displayLabel}
        </p>
      ) : null}
    </div>
  );
}

export const DEVICE_OPTIONS: { id: DeviceVariant; label: string }[] = [
  { id: "desktop", label: "Desktop" },
  { id: "laptop", label: "Laptop" },
  { id: "tablet", label: "Tablet" },
  { id: "phone", label: "Smartphone" },
];
