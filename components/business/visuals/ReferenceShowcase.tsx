import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { ReferenceScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import type { ProductMockRef, ReferenceAsset } from "@/lib/constants/business-reference-showcase";
import { cn } from "@/lib/utils/cn";

function mockPreviewContent(mock: ProductMockRef) {
  if (mock.variant === "website") {
    return <WebsitePreview industry={mock.industry ?? "umzug"} page="home" size="gallery" />;
  }
  return <MockScreen variant={mock.variant} industry={mock.industry ?? "umzug"} bare showcase />;
}

type ReferenceBrowserShowcaseProps = {
  label: string;
  caption?: string;
  fallback?: ReactNode;
  device?: DeviceVariant;
  className?: string;
  size?: "standard" | "hero";
  priority?: boolean;
} & (
  | { asset: ReferenceAsset; mock?: never }
  | { asset?: never; mock: ProductMockRef }
);

/** Browser-Rahmen mit Referenz — einheitlich über ProductMockupFrame */
export function ReferenceBrowserShowcase(props: ReferenceBrowserShowcaseProps) {
  const {
    label,
    caption,
    fallback = null,
    device = "laptop",
    className,
    size = "standard",
    priority = false,
  } = props;

  const exportKey = "asset" in props && props.asset ? props.asset.src : `mock-${props.mock?.variant}`;
  const presentation = size === "hero" ? "hero" : "standard";

  const isSynthetic = !("asset" in props && props.asset);

  return (
    <div className={cn(className)} data-export={`reference-browser-${exportKey}`}>
      <ProductMockupFrame
        device={device}
        label={label}
        caption={caption}
        presentation={presentation}
        fillContainer
        synthetic={isSynthetic}
      >
        {"asset" in props && props.asset ? (
          <ReferenceScreenshot
            src={props.asset.src}
            alt={props.asset.alt}
            priority={priority}
            mockupPresentation={presentation}
            embedded
            fallback={fallback ?? mockPreviewContent({ variant: "dashboard" })}
          />
        ) : (
          mockPreviewContent(props.mock!)
        )}
      </ProductMockupFrame>
    </div>
  );
}

type ReferenceFeatureSectionProps = {
  title: string;
  tagline?: string;
  benefits: readonly string[];
  caption?: string;
  href?: string;
  ctaLabel?: string;
  reverse?: boolean;
  fallback?: ReactNode;
  priority?: boolean;
  device?: DeviceVariant;
  visual?: ReactNode;
} & (
  | { asset: ReferenceAsset; mock?: never }
  | { asset?: never; mock: ProductMockRef }
  | { asset?: never; mock?: never }
);

export function ReferenceFeatureSection({
  title,
  tagline,
  benefits,
  caption,
  href,
  ctaLabel = "Mehr erfahren",
  reverse = false,
  fallback,
  priority = false,
  device,
  visual,
  ...source
}: ReferenceFeatureSectionProps) {
  return (
    <article
      className={cn(BUSINESS_VISUAL.featureGrid, reverse && "lg:[&>*:first-child]:order-2")}
      data-export={`reference-feature-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="space-y-6 lg:py-2 lg:pr-4">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h3>
          {tagline ? <p className="mt-4 text-lg leading-relaxed text-gray-600">{tagline}</p> : null}
        </div>
        <ul className="space-y-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
              {b}
            </li>
          ))}
        </ul>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C853] hover:underline"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      {visual ?? (
        <ReferenceBrowserShowcase
          {...(source as { asset: ReferenceAsset } | { mock: ProductMockRef })}
          label={title}
          caption={caption}
          fallback={fallback}
          size="hero"
          priority={priority}
          device={device}
        />
      )}
    </article>
  );
}

type ReferenceCardThumbnailProps = {
  alt: string;
  fallback?: ReactNode;
} & ({ asset: ReferenceAsset; mock?: never } | { asset?: never; mock: ProductMockRef });

export function ReferenceCardThumbnail(props: ReferenceCardThumbnailProps) {
  const { alt, fallback } = props;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100">
      {"asset" in props && props.asset ? (
        <ReferenceScreenshot
          src={props.asset.src}
          alt={alt}
          mockupPresentation="thumbnail"
          fallback={fallback ?? <div className="h-full w-full bg-gray-100" />}
        />
      ) : (
        <ProductMockupFrame device="laptop" presentation="thumbnail" fillContainer={false} synthetic>
          <MockScreen variant={props.mock!.variant} industry={props.mock!.industry ?? "umzug"} bare showcase />
        </ProductMockupFrame>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/90 to-transparent" />
    </div>
  );
}

export function ProductMockShowcase({
  label,
  caption,
  mock,
  size = "hero",
  className,
  device,
}: {
  label: string;
  caption?: string;
  mock: ProductMockRef;
  size?: "standard" | "hero";
  className?: string;
  device?: DeviceVariant;
}) {
  return (
    <ReferenceBrowserShowcase
      mock={mock}
      label={label}
      caption={caption}
      size={size}
      className={className}
      device={device}
    />
  );
}

export type { MockVariant, IndustryId };
