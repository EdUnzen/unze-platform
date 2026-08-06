import {
  AppPhoneStageShowcase,
  type PhoneShowcaseItem,
} from "@/components/business/visuals/AppPhoneCollageShowcase";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { ProductBrandPanel } from "@/components/business/visuals/ProductBrandPanel";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { ReferencePhoneScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";
import {
  MY_ORGANIZER_AI_HERO,
  ORGANIZER_PHONE_SHOWCASE,
  UNZE_CONNECT_LOGO,
} from "@/lib/constants/business-product-assets";
import type { OwnProductId } from "@/lib/constants/business-own-products";
import { cn } from "@/lib/utils/cn";

const PRODUCT_BRAND = {
  "unze-connect": {
    src: UNZE_CONNECT_LOGO.src,
    alt: UNZE_CONNECT_LOGO.alt,
    caption: "Offizielles UNZE Connect Logo — Community-Plattform aus eigener Entwicklung",
    phones: CONNECT_PLATFORM_SHOWCASE,
    priorityIndex: 1,
  },
  "my-organizer-ai": {
    src: MY_ORGANIZER_AI_HERO.src,
    alt: MY_ORGANIZER_AI_HERO.alt,
    caption: "My Organizer AI — KI-Organizer für Dokumente, Termine und Aufgaben",
    phones: ORGANIZER_PHONE_SHOWCASE,
    priorityIndex: 1,
  },
} as const;

function ProductShowcaseLayout({
  productId,
  layout,
}: {
  productId: OwnProductId;
  layout: "card" | "compact";
}) {
  const brand = PRODUCT_BRAND[productId];
  const items: PhoneShowcaseItem[] = brand.phones;
  const phoneStage = (
    <AppPhoneStageShowcase
      items={items}
      priorityIndex={brand.priorityIndex}
      showLabels={layout === "card"}
    />
  );

  if (layout === "compact") {
    return (
      <div className="flex h-full min-h-[440px] flex-col sm:min-h-[460px]">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]">
          <ProductBrandPanel
            src={brand.src}
            alt={brand.alt}
            caption={layout === "compact" ? undefined : brand.caption}
            size="compact"
            className="md:min-h-full"
          />
          <div
            className={cn(
              "flex items-center justify-center border-t border-gray-100 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 px-3 py-8 md:border-l md:border-t-0 md:px-4 md:py-10",
            )}
          >
            {phoneStage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <ProductBrandPanel src={brand.src} alt={brand.alt} caption={brand.caption} size="card" />
      <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 p-6 md:border-l md:border-t-0 md:p-8 lg:p-10 xl:p-12">
        {phoneStage}
      </div>
    </div>
  );
}

function SinglePhoneMock({
  variant,
  label,
}: {
  variant: "community" | "dashboard" | "admin" | "profile" | "documents" | "ai" | "calendar";
  label: string;
}) {
  return (
    <ProductMockupFrame device="phone" label={label} presentation="standard" synthetic>
      <MockScreen variant={variant} device="phone" bare showcase />
    </ProductMockupFrame>
  );
}

/** Visuelle Darstellung eigener Produkte — Logo + Dreier-Smartphone-Bühne */
export function OwnProductVisual({
  productId,
  layout = "card",
}: {
  productId: OwnProductId;
  layout?: "card" | "compact";
}) {
  return <ProductShowcaseLayout productId={productId} layout={layout} />;
}

/** Portfolio-Einzelmock — Smartphone statt Browser */
export function PortfolioPhoneShowcase({
  screenshot,
  label,
  variant = "community",
  presentation = "standard",
  priority = false,
}: {
  screenshot?: PhoneShowcaseItem;
  label: string;
  variant?: "community" | "dashboard" | "admin" | "profile";
  presentation?: "standard" | "hero";
  priority?: boolean;
}) {
  if (screenshot?.src) {
    return (
      <ProductMockupFrame device="phone" label={label} presentation={presentation}>
        <ReferencePhoneScreenshot
          src={screenshot.src}
          alt={screenshot.alt}
          priority={priority}
          embedded
          fillFrame
          fallback={<MockScreen variant={variant} device="phone" bare showcase />}
        />
      </ProductMockupFrame>
    );
  }

  return <SinglePhoneMock variant={variant} label={label} />;
}
