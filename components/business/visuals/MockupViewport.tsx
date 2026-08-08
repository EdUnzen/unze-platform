import type { ReactNode } from "react";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import {
  mockupViewportClass,
  type MockupPresentation,
} from "@/lib/constants/business-mockup-standard";
import { cn } from "@/lib/utils/cn";

type MockupViewportProps = {
  children: ReactNode;
  device?: DeviceVariant;
  presentation?: MockupPresentation;
  className?: string;
};

/**
 * Einheitlicher Viewport für Screenshots und Live-Previews.
 * Hält Proportionen, erzwingt keine Verzerrung — Inhalt wird vollständig sichtbar gehalten.
 */
export function MockupViewport({
  children,
  device = "laptop",
  presentation = "standard",
  className,
}: MockupViewportProps) {
  const isPhone = device === "phone";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        isPhone ? "aspect-[9/19] bg-[#1c1c1e]" : "bg-gray-50",
        mockupViewportClass(device, presentation),
        className,
      )}
      style={isPhone ? { aspectRatio: "9 / 19" } : undefined}
      data-mockup-viewport
      data-device={device}
      data-presentation={presentation}
    >
      {isPhone ? (
        /* Dunkler Innenrand sichtbar gegen weißes App-UI — Inline-Style, damit Tailwind JIT nicht auslässt */
        <div
          className="absolute overflow-hidden rounded-[1.35rem] bg-white"
          style={{ inset: 8 }}
        >
          <div className="relative h-full w-full">{children}</div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div className="relative h-full w-full">{children}</div>
        </div>
      )}
    </div>
  );
}

/** Äußere Showcase-Karte — Luft, Rundung, Tiefe */
export function MockupShowcaseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(BUSINESS_VISUAL.showcaseCard, "overflow-hidden", className)}
      data-mockup-showcase-shell
    >
      {children}
    </div>
  );
}
