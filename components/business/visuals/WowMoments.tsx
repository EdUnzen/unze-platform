"use client";

import type { ReactNode } from "react";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen } from "@/components/business/visuals/MockScreen";

/** Wow-Moment: Laptop + Smartphone mit realistischen App-Oberflächen */
export function DualDeviceWow() {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-indigo-50/40 via-white to-gray-50 py-12 md:py-16" data-export="wow-dual-device">
      <div className="container relative mx-auto flex max-w-5xl items-end justify-center gap-8 px-4">
        <div className="w-full max-w-xl transition duration-500 hover:scale-[1.01]">
          <ProductMockupFrame device="laptop" label="Web-App Desktop" presentation="hero" fillContainer synthetic>
            <MockScreen variant="webapp" bare showcase />
          </ProductMockupFrame>
        </div>
        <div className="hidden w-[220px] shrink-0 pb-10 sm:block motion-safe:animate-[float_5s_ease-in-out_infinite]">
          <ProductMockupFrame device="phone" label="PWA mobil" presentation="standard" synthetic>
            <MockScreen variant="webapp" device="phone" bare showcase />
          </ProductMockupFrame>
        </div>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </section>
  );
}

/** Wow-Moment: pulsierender KI-Orb mit realistischem Chat-UI */
export function AiPulseWow() {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12" data-export="wow-ai-pulse">
      <div className="container relative mx-auto max-w-lg px-4">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#00C853]/5" style={{ animationDuration: "4s" }} />
        <ProductMockupFrame device="laptop" presentation="standard" fillContainer synthetic>
          <MockScreen variant="ai" bare showcase />
        </ProductMockupFrame>
      </div>
    </section>
  );
}

/** Wow-Moment: Preis-Karten mit Glow */
export function PriceGlowCard({
  children,
  highlighted,
}: {
  children: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition duration-300 hover:shadow-lg ${
        highlighted
          ? "border-[#00C853] bg-[#00C853]/5 shadow-md shadow-[#00C853]/10 hover:shadow-[#00C853]/20"
          : "border-gray-100 bg-gray-50/50 hover:border-[#00C853]/20"
      }`}
    >
      {children}
    </div>
  );
}

/** Wow-Moment: Service-Flow */
export function ServiceFlowWow() {
  const nodes = ["Hosting", "SSL", "Updates", "Backups", "Support", "Dev"];
  return (
    <div className="py-10" data-export="wow-service-flow">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center gap-3">
            <div className="rounded-xl border border-[#00C853]/30 bg-[#00C853]/10 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:scale-105 hover:bg-[#00C853]/20">
              {node}
            </div>
            {i < nodes.length - 1 ? (
              <span className="hidden text-[#00C853] sm:inline" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
