import {
  AppPhoneShowcaseTile,
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
import { isOwnProductDiscontinued, UNZE_OWN_PRODUCTS } from "@/lib/constants/business-own-products";
import { DiscontinuedOverlay } from "@/components/business/visuals/DiscontinuedMark";

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
    caption: "Nicht mehr für neue Kunden — Bestandskunden behalten Zugang",
    phones: [] as readonly PhoneShowcaseItem[],
    screens: ORGANIZER_PHONE_SHOWCASE.map((s) => ({
      src: s.src,
      alt: s.alt,
      label: s.title,
    })),
    priorityIndex: 0,
  },
} as const;

const PORTFOLIO_VARIANT_FOR_PRODUCT: Partial<
  Record<OwnProductId, "community" | "dashboard" | "admin" | "profile">
> = {
  "unze-connect": "dashboard",
};

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
  const discontinued = isOwnProductDiscontinued(
    UNZE_OWN_PRODUCTS.find((p) => p.id === productId) ?? { availability: "available" },
  );
  const faded = discontinued ? "opacity-50 grayscale" : "";
  const hasPhones = brand.phones.length > 0;
  const hasScreens = brand.screens.length > 0;

  const visual = hasPhones ? (
    <ul className="grid justify-items-center gap-8 px-4 py-8 sm:grid-cols-3 sm:gap-6 md:px-8">
      {brand.phones.slice(0, 3).map((item, i) => (
        <li key={item.id} className="w-full max-w-[248px]">
          <AppPhoneShowcaseTile
            item={item}
            priority={i === brand.priorityIndex || i === 0}
            showLabels={layout === "card"}
          />
        </li>
      ))}
    </ul>
  ) : hasScreens ? (
    <OrganizerDesktopStage screens={brand.screens} />
  ) : null;

  if (layout === "compact") {
    if (hasPhones) {
      const shot = brand.phones[brand.priorityIndex] ?? brand.phones[0];
      return (
        <div className="relative flex justify-center bg-gray-50/80 px-4 py-8 md:py-10">
          {discontinued ? <DiscontinuedOverlay /> : null}
          <div className={`w-full max-w-[248px] ${faded}`}>
            <PortfolioPhoneShowcase
              screenshot={shot}
              label=""
              variant={PORTFOLIO_VARIANT_FOR_PRODUCT[productId] ?? "community"}
              presentation="standard"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-[280px] items-center justify-center bg-gray-50/80 px-6 py-10">
        {discontinued ? <DiscontinuedOverlay /> : null}
        <div className={faded || undefined}>
          <ProductBrandPanel
            src={brand.src}
            alt={brand.alt}
            productName={brand.productName}
            caption={brand.caption}
            size="compact"
            discontinued={discontinued}
          />
        </div>
      </div>
    );
  }

  if (!visual) {
    return (
      <div className="relative flex min-h-[380px] items-center justify-center bg-white p-10 md:p-14">
        {discontinued ? <DiscontinuedOverlay /> : null}
        <div className={faded || undefined}>
          <ProductBrandPanel
            src={brand.src}
            alt={brand.alt}
            productName={brand.productName}
            caption={brand.caption}
            size="card"
            discontinued={discontinued}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      {discontinued ? <DiscontinuedOverlay /> : null}
      <div className={`flex items-center justify-center border-b border-gray-100 bg-white md:border-b-0 md:border-r ${faded}`}>
        <ProductBrandPanel
          src={brand.src}
          alt={brand.alt}
          productName={brand.productName}
          caption={brand.caption}
          size="card"
          discontinued={discontinued}
        />
      </div>
      <div className={`bg-gray-50/70 p-5 md:p-7 lg:p-9 ${faded}`}>{visual}</div>
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
  chrome = "slim",
}: {
  screenshot?: PhoneShowcaseItem;
  label: string;
  variant?: "community" | "dashboard" | "admin" | "profile";
  presentation?: "standard" | "hero";
  priority?: boolean;
  chrome?: "standard" | "slim";
}) {
  if (screenshot?.src) {
    return (
      <ProductMockupFrame device="phone" label={label} presentation={presentation} chrome={chrome}>
        <ReferencePhoneScreenshot
          src={screenshot.src}
          alt={screenshot.alt}
          priority={priority}
          embedded
          fallback={<MockScreen variant={variant} device="phone" bare showcase />}
        />
      </ProductMockupFrame>
    );
  }

  return <SinglePhoneMock variant={variant} label={label} />;
}
