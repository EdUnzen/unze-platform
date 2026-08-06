import { BusinessShowcaseCard } from "@/components/business/BusinessUi";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { ReferencePhoneScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";
import { cn } from "@/lib/utils/cn";

export type PhoneShowcaseItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  fallbackVariant?: MockVariant;
  mockOnly?: boolean;
};

const DEFAULT_FALLBACK: Record<string, MockVariant> = {
  discover: "community",
  dashboard: "dashboard",
  community: "community",
  admin: "admin",
  profile: "profile",
  login: "community",
  documents: "documents",
  assistant: "ai",
  calendar: "calendar",
};

export function AppPhoneShowcaseTile({
  item,
  priority = false,
  showLabels = true,
  stage = "standard",
}: {
  item: PhoneShowcaseItem;
  priority?: boolean;
  showLabels?: boolean;
  stage?: "standard" | "hero" | "side";
}) {
  const fallbackVariant = item.fallbackVariant ?? DEFAULT_FALLBACK[item.id] ?? "community";
  const widthClass =
    stage === "hero"
      ? "w-[200px] sm:w-[220px] md:w-[240px]"
      : stage === "side"
        ? "w-[180px] sm:w-[200px] md:w-[220px]"
        : "w-full max-w-[240px]";

  return (
    <div className="flex flex-col items-center">
      <div className={cn("mx-auto", widthClass)}>
        <ProductMockupFrame
          device="phone"
          label={showLabels ? item.title : undefined}
          presentation={stage === "hero" ? "hero" : "standard"}
          className="!w-full [&_[data-export=device-phone]]:!w-full"
        >
          {item.mockOnly || !item.src ? (
            <MockScreen variant={fallbackVariant} device="phone" bare showcase />
          ) : (
            <ReferencePhoneScreenshot
              src={item.src}
              alt={item.alt}
              priority={priority}
              embedded
              fillFrame
              fallback={<MockScreen variant={fallbackVariant} device="phone" bare showcase />}
            />
          )}
        </ProductMockupFrame>
      </div>
      {showLabels ? (
        <div className="mt-4 max-w-[200px] text-center">
          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Drei Smartphones nebeneinander — gleiche Größe, kein Scale/Overlap.
 * Auf schmalen Viewports: horizontales Scrollen statt Quetschen.
 */
export function AppPhoneStageShowcase({
  items,
  className,
  priorityIndex = 1,
  showLabels = false,
}: {
  items: readonly PhoneShowcaseItem[];
  className?: string;
  priorityIndex?: number;
  showLabels?: boolean;
}) {
  const phones = items.slice(0, 3);
  if (phones.length === 0) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 items-end justify-center gap-4 overflow-x-auto px-2 pb-1 sm:gap-5 md:gap-6 md:overflow-visible md:px-0",
        className,
      )}
      data-export="app-phone-stage"
    >
      {phones.map((item, index) => (
        <div key={item.id} className="shrink-0">
          <AppPhoneShowcaseTile
            item={item}
            priority={index === priorityIndex}
            showLabels={showLabels}
            stage={index === 1 ? "hero" : "side"}
          />
        </div>
      ))}
    </div>
  );
}

/** Flache 3er-Reihe in Showcase-Karte */
export function AppPhoneCollageShowcase({ className }: { className?: string }) {
  return (
    <div data-export="app-phone-collage">
      <BusinessShowcaseCard
        className={cn("bg-gradient-to-br from-gray-50 via-white to-emerald-50/30", className)}
      >
        <AppPhoneStageShowcase items={CONNECT_PLATFORM_SHOWCASE} showLabels />
      </BusinessShowcaseCard>
    </div>
  );
}
