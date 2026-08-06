import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { INDUSTRY_META, type IndustryId } from "@/lib/constants/business-industry-scenarios";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

type IndustryImageKey = keyof typeof BUSINESS_IMAGERY.industries;

const INDUSTRY_IMAGE: Record<IndustryId, IndustryImageKey> = {
  umzug: "umzug",
  reinigung: "reinigung",
  handwerk: "handwerk",
  arztpraxis: "arztpraxis",
};

interface IndustryMockStageProps {
  industry: IndustryId;
  variant: MockVariant;
  device?: DeviceVariant;
  label?: string;
  compact?: boolean;
  className?: string;
  /** Gleiche Device-Größe in Grids (immer Laptop, volle Breite) */
  uniform?: boolean;
}

/**
 * Branchen-Kulisse: echtes Foto + Device-Mock — wirkt wie eine fertige Produktpräsentation.
 */
export function IndustryMockStage({
  industry,
  variant,
  device = "laptop",
  label,
  compact = false,
  className = "",
  uniform = false,
}: IndustryMockStageProps) {
  const meta = INDUSTRY_META[industry];
  const imageKey = INDUSTRY_IMAGE[industry];
  const image = BUSINESS_IMAGERY.industries[imageKey];
  const resolvedDevice = uniform ? "laptop" : device;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-900/5 ${className}`}
      data-export={`industry-mock-${industry}-${variant}`}
    >
      <BusinessPhoto
        src={image.src}
        alt={image.alt}
        fill
        className="absolute inset-0 scale-105 object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-40 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-gray-950/10" />

      <div className="relative p-5 md:p-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
              Branchen-Template
            </p>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-white md:text-xl">
              {meta.label}
            </p>
            <p className="text-sm text-white/75">{meta.tagline}</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {meta.company}
          </span>
        </div>

        <ProductMockupFrame
          device={resolvedDevice}
          label={label ?? meta.label}
          presentation="hero"
          fillContainer={uniform}
          synthetic
          className={uniform ? undefined : "mt-2"}
        >
          <MockScreen
            variant={variant}
            industry={industry}
            device={resolvedDevice}
            compact={compact}
            bare
            showcase
          />
        </ProductMockupFrame>
      </div>
    </div>
  );
}
