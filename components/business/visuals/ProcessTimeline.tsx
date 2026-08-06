"use client";

import { useState } from "react";
import {
  Headphones,
  Lightbulb,
  MessageCircle,
  Rocket,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";

const STEP_ICONS: LucideIcon[] = [MessageCircle, Lightbulb, Wrench, Rocket, Headphones];

export function ProcessTimeline({
  steps,
}: {
  steps: readonly { step: string; detail: string }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="relative" data-export="process-timeline">
      <div
        className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent md:block"
        aria-hidden
      />
      <ol className="grid gap-8 md:grid-cols-5 md:gap-4">
        {steps.map((item, i) => {
          const Icon = STEP_ICONS[i] ?? MessageCircle;
          const isActive = active === i;
          return (
            <BusinessScrollReveal key={item.step} delay={i * 100}>
              <li
                className="group relative z-10 text-center"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <div
                  className={`relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ${
                    isActive
                      ? "scale-110 bg-[#00C853] text-white shadow-lg shadow-[#00C853]/30"
                      : "bg-white text-[#00C853] ring-1 ring-gray-200 group-hover:ring-[#00C853]/40"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition ${
                      isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                </div>
                <p className="mt-5 font-semibold text-gray-900">{item.step}</p>
                <p
                  className={`mt-2 text-xs leading-relaxed transition-colors ${
                    isActive ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {item.detail}
                </p>
              </li>
            </BusinessScrollReveal>
          );
        })}
      </ol>
    </div>
  );
}
