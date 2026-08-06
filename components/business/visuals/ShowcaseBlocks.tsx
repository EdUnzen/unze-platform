import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen, type MockVariant } from "@/components/business/visuals/MockScreen";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";

export function BusinessVisualShowcase({
  variant,
  device = "laptop",
  label,
  caption,
  className = "",
  delay = 0,
  industry = "umzug",
  presentation = "standard" as const,
}: {
  variant: MockVariant;
  device?: DeviceVariant;
  label?: string;
  caption?: string;
  className?: string;
  delay?: number;
  industry?: import("@/lib/constants/business-industry-scenarios").IndustryId;
  presentation?: "hero" | "standard" | "card";
}) {
  return (
    <BusinessScrollReveal delay={delay} className={className}>
      <ProductMockupFrame
        device={device}
        label={label}
        caption={caption}
        presentation={presentation}
        fillContainer={device !== "phone"}
        synthetic
      >
        <MockScreen variant={variant} industry={industry} device={device} bare showcase />
      </ProductMockupFrame>
    </BusinessScrollReveal>
  );
}

export function BusinessStatsStrip({
  stats,
}: {
  stats: readonly { value: string; label: string }[];
}) {
  return (
    <div
      className="grid grid-cols-2 gap-6 border-y border-gray-100 py-10 md:grid-cols-4"
      data-export="stats-strip"
    >
      {stats.map((s, i) => (
        <BusinessScrollReveal key={s.label} delay={i * 80}>
          <div className="text-center md:text-left">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        </BusinessScrollReveal>
      ))}
    </div>
  );
}

export function BusinessSplitSection({
  title,
  text,
  bullets,
  variant,
  reverse = false,
}: {
  title: string;
  text: string;
  bullets?: string[];
  variant: MockVariant;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid items-start gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <BusinessScrollReveal>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-gray-600">{text}</p>
        {bullets?.length ? (
          <ul className="mt-6 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </BusinessScrollReveal>
      <BusinessVisualShowcase variant={variant} delay={120} presentation="hero" />
    </div>
  );
}
