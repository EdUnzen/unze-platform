import type { ReactNode } from "react";
import { DeviceFrame, type DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import { BusinessAiContentLabel } from "@/components/business/visuals/BusinessMockDisclaimer";
import { MockupViewport } from "@/components/business/visuals/MockupViewport";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import {
  BUSINESS_MOCKUP_STANDARD,
  type MockupPresentation,
} from "@/lib/constants/business-mockup-standard";
import { cn } from "@/lib/utils/cn";

export type ProductMockupFrameProps = {
  children: ReactNode;
  device?: DeviceVariant;
  label?: string;
  caption?: string;
  presentation?: MockupPresentation;
  className?: string;
  /** Volle Grid-Breite (Standard für Hero/Feature) */
  fillContainer?: boolean;
  priority?: boolean;
  /** Demo-/KI-Visual — dezente EU-Kennzeichnung */
  synthetic?: boolean;
};

/**
 * Einheitliche Mockup-Präsentation UNZE Business.
 * Kombiniert DeviceFrame + MockupViewport — SSOT für alle Screenshots und Previews.
 */
export function ProductMockupFrame({
  children,
  device = "laptop",
  label,
  caption,
  presentation = "standard",
  className,
  fillContainer = true,
  synthetic = false,
}: ProductMockupFrameProps) {
  const isPhone = device === "phone";
  const displayLabel = caption ? undefined : label;

  const captionBlock =
    caption || synthetic ? (
      <figcaption
        className={cn(
          "flex flex-col items-center gap-1.5 px-1 text-center",
          isPhone ? "max-w-sm" : "",
          BUSINESS_MOCKUP_STANDARD.captionGap,
        )}
      >
        {synthetic ? <BusinessAiContentLabel /> : null}
        {caption ? (
          <span className="text-sm leading-relaxed text-gray-500">{caption}</span>
        ) : null}
      </figcaption>
    ) : null;

  if (isPhone) {
    return (
      <figure
        className={cn("mx-auto flex w-full max-w-[280px] flex-col items-stretch", BUSINESS_VISUAL.figureGap, className)}
        data-export="product-mockup-phone"
      >
        <div className="w-full">
          <DeviceFrame variant="phone" label={displayLabel} hideCaption={!!caption || synthetic}>
            <MockupViewport device="phone" presentation={presentation}>
              {children}
            </MockupViewport>
          </DeviceFrame>
        </div>
        {captionBlock}
      </figure>
    );
  }

  return (
    <figure className={cn(BUSINESS_VISUAL.figureGap, "min-w-0", className)} data-export={`product-mockup-${device}`}>
      <DeviceFrame
        variant={device}
        label={displayLabel}
        fillContainer={fillContainer}
        hideCaption={!!caption || synthetic}
      >
        <MockupViewport device={device} presentation={presentation}>
          {children}
        </MockupViewport>
      </DeviceFrame>
      {captionBlock}
    </figure>
  );
}
