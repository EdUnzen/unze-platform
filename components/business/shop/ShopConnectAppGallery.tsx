"use client";

import { ReferencePhoneScreenshot } from "@/components/business/visuals/ReferenceScreenshot";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { AppPhoneStageShowcase } from "@/components/business/visuals/AppPhoneCollageShowcase";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";
import { cn } from "@/lib/utils/cn";

type ShopConnectAppGalleryProps = {
  variant?: "card" | "detail" | "compact";
  className?: string;
};

/** Echte UNZE Connect Screenshots — Smartphone-Rahmen, proportional */
export function ShopConnectAppGallery({ variant = "detail", className }: ShopConnectAppGalleryProps) {
  const isCompact = variant === "card";

  if (isCompact) {
    return (
      <div className={cn("space-y-3", className)}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CONNECT_PLATFORM_SHOWCASE.map((preview) => (
            <li key={preview.id}>
              <ProductMockupFrame device="phone" presentation="card" label={preview.title}>
                <ReferencePhoneScreenshot
                  src={preview.src}
                  alt={`${preview.title} — UNZE Connect`}
                  embedded
                  fallback={<MockScreen variant="community" device="phone" bare showcase />}
                />
              </ProductMockupFrame>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Referenz · UNZE Connect
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          Echte App-Oberflächen aus unserem Netzwerk — Ihre Web-App wird individuell umgesetzt.
        </p>
      </div>
      <AppPhoneStageShowcase items={CONNECT_PLATFORM_SHOWCASE} showLabels />
    </div>
  );
}
