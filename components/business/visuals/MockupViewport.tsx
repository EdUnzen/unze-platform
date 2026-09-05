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
 * Hält Proportionen — Screenshot sitzt im Display, ohne Abschneiden.
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
        isPhone ? "h-full min-h-0 w-full bg-transparent" : "bg-gray-50",
        isPhone ? "" : mockupViewportClass(device, presentation),
        className,
      )}
      data-mockup-viewport
      data-device={device}
      data-presentation={presentation}
    >
      {isPhone ? (
        <div className="absolute inset-0 overflow-hidden">
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
