import { LANDING_WHY } from "@/lib/constants/landing-copy";
import { Layers, ShieldCheck, Sparkles, Wallet } from "lucide-react";

const ICONS = [Layers, ShieldCheck, Sparkles, Wallet] as const;

export function LandingWhySection() {
  const copy = LANDING_WHY;

  return (
    <section className="border-t border-gray-100 bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">{copy.intro}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {copy.differentiators.map((item, index) => {
            const Icon = ICONS[index] ?? Layers;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 transition duration-300 hover:border-[#00C853]/25 hover:bg-white hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C853]/10 text-[#00C853]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
