"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { MockupViewport } from "@/components/business/visuals/MockupViewport";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import {
  BUSINESS_MOCKUP_STANDARD,
  type MockupPresentation,
} from "@/lib/constants/business-mockup-standard";
import { cn } from "@/lib/utils/cn";

type ReferenceScreenshotProps = {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** @deprecated — immer contain; nur Abwärtskompatibilität */
  presentation?: "standard" | "hero" | "card";
  device?: DeviceVariant;
  mockupPresentation?: MockupPresentation;
  /** Innerhalb ProductMockupFrame — kein eigener MockupViewport */
  embedded?: boolean;
};

function screenshotSizes(presentation: MockupPresentation): string {
  if (presentation === "hero") return "(max-width: 768px) 100vw, 900px";
  if (presentation === "card" || presentation === "thumbnail") return "(max-width: 768px) 100vw, 400px";
  return "(max-width: 768px) 100vw, 720px";
}

/** Echter Screenshot — scharfe Darstellung, natürliche Proportionen (immer contain) */
export function ReferenceScreenshot({
  src,
  alt,
  fallback,
  className,
  imageClassName,
  priority = false,
  presentation = "standard",
  device = "laptop",
  mockupPresentation,
  embedded = false,
}: ReferenceScreenshotProps) {
  const [failed, setFailed] = useState(false);

  const resolvedPresentation =
    mockupPresentation ??
    (presentation === "hero" ? "hero" : presentation === "card" ? "card" : "standard");

  const imageContent = failed ? (
    fallback
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      quality={BUSINESS_MOCKUP_STANDARD.screenshotQuality}
      sizes={screenshotSizes(resolvedPresentation)}
        className={cn("object-contain object-center", imageClassName)}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth < 2 || img.naturalHeight < 2) setFailed(true);
        }}
    />
  );

  if (embedded) {
    return <div className={cn("relative h-full w-full", className)}>{imageContent}</div>;
  }

  return (
    <MockupViewport device={device} presentation={resolvedPresentation} className={className}>
      {imageContent}
    </MockupViewport>
  );
}

/** Screenshot im Smartphone-Viewport — füllt den Rahmen ohne Letterboxing */
export function ReferencePhoneScreenshot({
  src,
  alt,
  fallback,
  priority = false,
  presentation = "standard" as MockupPresentation,
  embedded = false,
  fillFrame = true,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  priority?: boolean;
  presentation?: MockupPresentation;
  embedded?: boolean;
  /** object-cover statt contain — entfernt weiße Seitenränder in Captures */
  fillFrame?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const imageContent = failed ? (
    fallback
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      quality={BUSINESS_MOCKUP_STANDARD.screenshotQuality}
      sizes="260px"
      className={
        fillFrame
          ? "object-cover object-top"
          : "object-contain object-center"
      }
      onError={() => setFailed(true)}
      onLoad={(event) => {
        const img = event.currentTarget;
        if (img.naturalWidth < 2 || img.naturalHeight < 2) setFailed(true);
      }}
    />
  );

  if (embedded) {
    return <div className="relative h-full w-full">{imageContent}</div>;
  }

  return (
    <MockupViewport device="phone" presentation={presentation}>
      {imageContent}
    </MockupViewport>
  );
}
