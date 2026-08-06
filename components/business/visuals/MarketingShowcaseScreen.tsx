import type { ReactNode } from "react";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import type { WebsitePageId } from "@/lib/constants/business-website-templates";
import type { MockupPresentation } from "@/lib/constants/business-mockup-standard";
import { cn } from "@/lib/utils/cn";

type MarketingShowcaseScreenProps = {
  variant: MockVariant;
  industry?: IndustryId;
  label: string;
  caption?: string;
  device?: DeviceVariant;
  websitePage?: WebsitePageId;
  presentation?: MockupPresentation;
  className?: string;
};

/** Marketing-Showcase: natürliche Proportionen über ProductMockupFrame */
export function MarketingShowcaseScreen({
  variant,
  industry = "umzug",
  label,
  caption,
  device = "laptop",
  websitePage = "home",
  presentation = "standard",
  className,
}: MarketingShowcaseScreenProps) {
  const content = buildPreview(variant, industry, device, websitePage);

  return (
    <ProductMockupFrame
      device={device}
      label={label}
      caption={caption}
      presentation={presentation}
      fillContainer={device !== "phone"}
      synthetic
      className={className}
    >
      {content}
    </ProductMockupFrame>
  );
}

function buildPreview(
  variant: MockVariant,
  industry: IndustryId,
  device: DeviceVariant,
  websitePage: WebsitePageId,
): ReactNode {
  if (variant === "website") {
    return <WebsitePreview industry={industry} page={websitePage} size="gallery" />;
  }

  return (
    <MockScreen
      variant={variant}
      industry={industry}
      showcase
      bare
      device={device === "phone" ? "phone" : device === "tablet" ? "tablet" : "laptop"}
    />
  );
}

/** Smartphone mit unscharfem App-Hintergrund — für Portale & Mobile. */
export function PhoneShowcaseWithBackdrop({
  variant,
  industry = "umzug",
  label,
  caption,
  className,
}: {
  variant: MockVariant;
  industry?: IndustryId;
  label: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-slate-100 via-white to-emerald-50/40 p-8 md:p-10",
        className,
      )}
      data-export={`phone-backdrop-${variant}`}
    >
      <div className="pointer-events-none absolute inset-0 scale-110 opacity-[0.18] blur-[2px]" aria-hidden>
        <MockScreen variant={variant} industry={industry} showcase bare />
      </div>
      <div className="relative flex justify-center">
        <MarketingShowcaseScreen
          variant={variant}
          industry={industry}
          label={label}
          device="phone"
          presentation="standard"
        />
      </div>
      {caption ? (
        <figcaption className="relative mt-6 text-center text-sm leading-relaxed text-gray-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
