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
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        device === "phone" ? "bg-white" : "bg-gray-50",
        mockupViewportClass(device, presentation),
        className,
      )}
      data-mockup-viewport
      data-device={device}
      data-presentation={presentation}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-full w-full min-h-0 min-w-0">{children}</div>
      </div>
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
      className={cn(
        BUSINESS_VISUAL.showcaseCard,
        "overflow-hidden",
        className,
      )}
      data-mockup-showcase-shell
    >
      {children}
    </div>
  );
}
