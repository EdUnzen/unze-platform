"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import {
  tbcScreenshotAlt,
  tbcScreenshotPath,
  TBC_TEMPLATES,
  type TbcTemplateId,
  type TbcTemplatePageId,
} from "@/lib/constants/business-core-template-screenshots";
import type { MockupPresentation } from "@/lib/constants/business-mockup-standard";
import { cn } from "@/lib/utils/cn";

type ShopTbcScreenshotProps = {
  templateId: TbcTemplateId;
  page?: TbcTemplatePageId;
  label?: string;
  variant?: "card" | "hero" | "gallery";
  className?: string;
  priority?: boolean;
};

const variantPresentation: Record<NonNullable<ShopTbcScreenshotProps["variant"]>, MockupPresentation> = {
  card: "card",
  hero: "hero",
  gallery: "standard",
};

/** Echter TBC-Screenshot — proportional in ProductMockupFrame */
export function ShopTbcScreenshot({
  templateId,
  page = "home",
  label,
  variant = "card",
  className,
  priority = false,
}: ShopTbcScreenshotProps) {
  const [failed, setFailed] = useState(false);
  const src = tbcScreenshotPath(templateId, page);
  const alt = tbcScreenshotAlt(templateId, page);
  const template = TBC_TEMPLATES[templateId];
  const presentation = variantPresentation[variant];

  const fallback = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">TBC Template</p>
      <p className="font-semibold text-gray-800">{template.company}</p>
      <p className="text-xs text-gray-500">{template.label}</p>
      <p className="mt-2 text-[10px] text-gray-400">
        Vorschau wird geladen — ggf. TBC Studio starten und{" "}
        <code className="rounded bg-gray-200 px-1">npm run marketing:capture:tbc</code> ausführen.
      </p>
    </div>
  );

  const content = failed ? (
    fallback
  ) : (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-contain object-center"
        onError={() => setFailed(true)}
      />
    </div>
  );

  const frame = (
    <ProductMockupFrame device="laptop" presentation={presentation} fillContainer>
      {content}
    </ProductMockupFrame>
  );

  if (!label) {
    return <div className={className}>{frame}</div>;
  }

  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>
      {frame}
      <figcaption className="border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700">
        {label}
      </figcaption>
    </figure>
  );
}
