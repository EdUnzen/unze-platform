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
      ? "w-[220px] sm:w-[250px] md:w-[280px] lg:w-[300px]"
      : stage === "side"
        ? "w-[190px] sm:w-[210px] md:w-[230px] lg:w-[250px]"
        : "w-full max-w-[280px]";

  return (
    <div className="flex flex-col items-center">
      <div className={cn("mx-auto", widthClass)}>
        <ProductMockupFrame
          device="phone"
          label={showLabels ? item.title : undefined}
          presentation={stage === "hero" ? "hero" : "standard"}
        >
          {item.mockOnly ? (
            <MockScreen variant={fallbackVariant} device="phone" bare showcase />
          ) : (
            <ReferencePhoneScreenshot
              src={item.src}
              alt={item.alt}
              priority={priority}
              embedded
              fillFrame={!item.mockOnly}
              fallback={
                <MockScreen variant={fallbackVariant} device="phone" bare showcase />
              }
            />
          )}
        </ProductMockupFrame>
      </div>
      {showLabels ? (
        <div className="mt-5 max-w-[220px] text-center">
          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}

/** Drei Smartphones — zentrales Hauptgerät, seitliche leicht zurückgesetzt */
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
  const [left, center, right] = items;

  if (!center) return null;

  return (
    <div
      className={cn(
        "relative flex min-w-0 items-end justify-center gap-2 overflow-x-auto px-2 pb-2 sm:gap-5 md:gap-6 md:overflow-visible md:px-0 md:pb-0",
        className,
      )}
      data-export="app-phone-stage"
    >
      {left ? (
        <div className="hidden shrink-0 translate-y-5 scale-[0.92] opacity-90 sm:block md:translate-y-8 md:scale-[0.94]">
          <AppPhoneShowcaseTile item={left} showLabels={showLabels} stage="side" />
        </div>
      ) : null}
      <div className="relative z-10 shrink-0">
        <AppPhoneShowcaseTile
          item={center}
          priority={priorityIndex === 1}
          showLabels={showLabels}
          stage="hero"
        />
      </div>
      {right ? (
        <div className="hidden shrink-0 translate-y-5 scale-[0.92] opacity-90 sm:block md:translate-y-8 md:scale-[0.94]">
          <AppPhoneShowcaseTile item={right} showLabels={showLabels} stage="side" />
        </div>
      ) : null}
    </div>
  );
}

/** Flache 3er-Reihe — für schmalere Kontexte */
export function AppPhoneCollageShowcase({ className }: { className?: string }) {
  return (
    <div data-export="app-phone-collage">
      <BusinessShowcaseCard className={cn("bg-gradient-to-br from-gray-50 via-white to-emerald-50/30", className)}>
        <AppPhoneStageShowcase items={CONNECT_PLATFORM_SHOWCASE} />
      </BusinessShowcaseCard>
    </div>
  );
}
