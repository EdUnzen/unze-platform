import type { DeviceVariant, MockLayout, MockVariant } from "@/lib/constants/business-mock-types";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";

import { AiPreview } from "./previews/AiPreview";
import { AdminPreview } from "./previews/AdminPreview";
import { AnalyticsPreview } from "./previews/AnalyticsPreview";
import { CalendarPreview } from "./previews/CalendarPreview";
import { CommunityPreview } from "./previews/CommunityPreview";
import { CustomersPreview } from "./previews/CustomersPreview";
import { DashboardPreview } from "./previews/DashboardPreview";
import { DocumentsPreview } from "./previews/DocumentsPreview";
import { EmployeesPreview } from "./previews/EmployeesPreview";
import { InvoicesPreview } from "./previews/InvoicesPreview";
import { MarketingPreview } from "./previews/MarketingPreview";
import { OffersPreview } from "./previews/OffersPreview";
import { ProfilePreview } from "./previews/ProfilePreview";
import { WebAppPreview } from "./previews/WebAppPreview";
import { WebsitePreview } from "./previews/WebsitePreview";

export type { MockLayout, MockVariant } from "@/lib/constants/business-mock-types";

type PreviewProps = { compact?: boolean; industry?: IndustryId; layout?: MockLayout; bare?: boolean };

const PREVIEWS: Record<MockVariant, React.ComponentType<PreviewProps>> = {
  dashboard: DashboardPreview,
  customers: CustomersPreview,
  offers: OffersPreview,
  invoices: InvoicesPreview,
  employees: EmployeesPreview,
  calendar: CalendarPreview,
  documents: DocumentsPreview,
  marketing: MarketingPreview,
  analytics: AnalyticsPreview,
  website: WebsitePreview,
  webapp: WebAppPreview,
  ai: AiPreview,
  community: CommunityPreview,
  admin: AdminPreview,
  profile: ProfilePreview,
};

export function mockPropsForDevice(device?: DeviceVariant): {
  compact: boolean;
  layout: MockLayout;
  className: string;
} {
  switch (device) {
    case "phone":
      return { compact: true, layout: "mobile", className: "!aspect-[9/19]" };
    case "tablet":
      return { compact: true, layout: "tablet", className: "!aspect-[3/4]" };
    default:
      return { compact: false, layout: "desktop", className: "" };
  }
}

/** Server-Komponente — reine SVG/HTML-Vorschauen, kein Client-Bundle. */
export function MockScreen({
  variant = "dashboard",
  className = "",
  compact = false,
  industry = "umzug",
  device,
  layout: layoutProp,
  showcase = false,
  bare = false,
}: {
  variant?: MockVariant;
  className?: string;
  compact?: boolean;
  industry?: IndustryId;
  device?: DeviceVariant;
  layout?: MockLayout;
  /** Marketing-Showcase: keine feste Aspect-Ratio, kein Abschneiden */
  showcase?: boolean;
  /** Kein innerer AppWindowChrome — wenn bereits DeviceFrame drumherum */
  bare?: boolean;
}) {
  const deviceProps = device ? mockPropsForDevice(device) : null;
  const layout = layoutProp ?? deviceProps?.layout ?? (compact ? "mobile" : "desktop");
  const isCompact = showcase ? false : (deviceProps?.compact ?? compact);
  const useBare = bare || showcase;
  const mergedClass = [deviceProps?.className, className].filter(Boolean).join(" ");

  const Preview = PREVIEWS[variant];

  if (showcase) {
    return (
      <div
        className={`h-full min-h-[200px] w-full overflow-hidden bg-[#f8fafc] ${mergedClass}`}
        data-export={`mock-${variant}-${layout}-showcase`}
      >
        <Preview compact={isCompact} industry={industry} layout={layout} bare={useBare} />
      </div>
    );
  }

  return (
    <div
      className={`aspect-[16/10] w-full overflow-hidden bg-[#f8fafc] ${mergedClass}`}
      data-export={`mock-${variant}-${layout}`}
    >
      <Preview compact={isCompact} industry={industry} layout={layout} bare={useBare} />
    </div>
  );
}
