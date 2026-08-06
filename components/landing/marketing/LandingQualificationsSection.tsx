import {
  LANDING_COMMUNITY_BADGES,
  LANDING_QUALIFICATIONS,
} from "@/lib/constants/landing-copy";
import { Award, BadgeCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const BADGE_ICONS = {
  Verifiziert: ShieldCheck,
  Beliebt: Sparkles,
  "Besonders aktiv": Sparkles,
  "Stark wachsend": TrendingUp,
} as const;

export function LandingQualificationsSection() {
  const qualifications = LANDING_QUALIFICATIONS;
  const badges = LANDING_COMMUNITY_BADGES;

  return (
    <section className="border-y border-gray-100 bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">
              {qualifications.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              {qualifications.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{qualifications.intro}</p>
            <ul className="mt-8 space-y-4">
              {qualifications.uses.map((use) => (
                <li key={use.title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-[#00C853]" aria-hidden />
                  <div>
                    <p className="font-semibold text-gray-900">{use.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{use.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-[#00C853]/20 bg-[#00C853]/5 px-4 py-3 text-sm leading-relaxed text-gray-700">
              {qualifications.note}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {badges.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              {badges.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{badges.intro}</p>
            <ul className="mt-8 space-y-3">
              {badges.badges.map((badge) => {
                const Icon =
                  BADGE_ICONS[badge.label as keyof typeof BADGE_ICONS] ?? BadgeCheck;
                return (
                  <li
                    key={badge.label}
                    className="flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Community-Badge
                      </p>
                      <p className="mt-0.5 font-semibold text-gray-900">{badge.label}</p>
                      <p className="mt-1 text-sm text-gray-600">{badge.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-gray-600">{badges.distinction}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
