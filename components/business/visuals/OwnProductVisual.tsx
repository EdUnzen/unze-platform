import {
  AppPhoneStageShowcase,
  type PhoneShowcaseItem,
} from "@/components/business/visuals/AppPhoneCollageShowcase";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { ProductBrandPanel } from "@/components/business/visuals/ProductBrandPanel";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { ReferencePhoneScreenshot, ReferenceScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";
import {
  MY_ORGANIZER_AI_HERO,
  ORGANIZER_PHONE_SHOWCASE,
  UNZE_CONNECT_LOGO,
} from "@/lib/constants/business-product-assets";
import type { OwnProductId } from "@/lib/constants/business-own-products";

const PRODUCT_BRAND = {
  "unze-connect": {
    src: UNZE_CONNECT_LOGO.src,
    alt: UNZE_CONNECT_LOGO.alt,
    productName: "UNZE Connect",
    caption: "Community-Plattform aus eigener Entwicklung",
    phones: CONNECT_PLATFORM_SHOWCASE as readonly PhoneShowcaseItem[],
    screens: [] as readonly { src: string; alt: string; label: string }[],
    priorityIndex: 1,
  },
  "my-organizer-ai": {
    src: MY_ORGANIZER_AI_HERO.src,
    alt: MY_ORGANIZER_AI_HERO.alt,
    productName: "My Organizer AI",
    caption: "Offizielles App-Icon — Assistent, Dokumente & Kalender",
    phones: [] as readonly PhoneShowcaseItem[],
    screens: ORGANIZER_PHONE_SHOWCASE.map((s) => ({
      src: s.src,
      alt: s.alt,
      label: s.title,
    })),
    priorityIndex: 0,
  },
} as const;

function OrganizerDesktopStage({
  screens,
}: {
  screens: readonly { src: string; alt: string; label: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:gap-8" data-export="organizer-desktop-stage">
      {screens.slice(0, 2).map((screen) => (
        <figure key={screen.src} className="min-w-0">
          <ProductMockupFrame device="laptop" label={screen.label} presentation="standard" fillContainer>
            <ReferenceScreenshot
              src={screen.src}
              alt={screen.alt}
              embedded
              mockupPresentation="standard"
              fallback={<MockScreen variant="ai" bare showcase />}
            />
          </ProductMockupFrame>
        </figure>
      ))}
    </div>
  );
}

function ProductShowcaseLayout({
  productId,
  layout,
}: {
  productId: OwnProductId;
  layout: "card" | "compact";
}) {
  const brand = PRODUCT_BRAND[productId];
  const hasPhones = brand.phones.length > 0;
  const hasScreens = brand.screens.length > 0;

  const visual = hasPhones ? (
    <AppPhoneStageShowcase
      items={brand.phones}
      priorityIndex={brand.priorityIndex}
      showLabels={layout === "card"}
    />
  ) : hasScreens ? (
    <OrganizerDesktopStage screens={brand.screens} />
  ) : null;

  if (layout === "compact") {
    return (
      <div className="flex h-full min-h-[360px] flex-col">
        {visual ? (
          <div className="grid flex-1 grid-cols-1 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)]">
            <div className="flex items-center justify-center bg-white">
              <ProductBrandPanel
                src={brand.src}
                alt={brand.alt}
                productName={brand.productName}
                size="compact"
              />
            </div>
            <div className="flex items-center justify-center border-t border-gray-100 bg-gray-50/80 px-4 py-6 md:border-l md:border-t-0 md:px-6 md:py-8">
              {visual}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-white">
            <ProductBrandPanel
              src={brand.src}
              alt={brand.alt}
              productName={brand.productName}
              caption={brand.caption}
              size="compact"
            />
          </div>
        )}
      </div>
    );
  }

  if (!visual) {
    return (
      <div className="flex min-h-[380px] items-center justify-center bg-white p-10 md:p-14">
        <ProductBrandPanel
          src={brand.src}
          alt={brand.alt}
          productName={brand.productName}
          caption={brand.caption}
          size="card"
        />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      <div className="flex items-center justify-center border-b border-gray-100 bg-white md:border-b-0 md:border-r">
        <ProductBrandPanel
          src={brand.src}
          alt={brand.alt}
          productName={brand.productName}
          caption={brand.caption}
          size="card"
        />
      </div>
      <div className="bg-gray-50/70 p-5 md:p-7 lg:p-9">{visual}</div>
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

/** Visuelle Darstellung eigener Produkte */
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
