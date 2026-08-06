import {
  GUEST_HERO_IMAGE,
  HOME_HERO_IMAGE,
  PLATFORM_PILLARS,
  PLATFORM_TAGLINE,
} from "@/lib/constants/platform-copy";
import { HERO_GUEST_COPY, HERO_MEMBER_COPY } from "@/lib/constants/cta-copy";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

interface HomeHeroProps {
  variant: "guest" | "member";
}

export function HomeHero({ variant }: HomeHeroProps) {
  const isGuest = variant === "guest";
  const copy = isGuest ? HERO_GUEST_COPY : HERO_MEMBER_COPY;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5",
        "bg-gradient-to-br from-[#0c3d2e] via-unze-green-dark to-emerald-800",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden>
        <Image
          src={isGuest ? GUEST_HERO_IMAGE : HOME_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 768px"
          className="object-cover object-center"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/45"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center px-5 text-center",
          isGuest ? "py-12 sm:py-14 md:py-16" : "py-10 sm:py-12 md:py-14",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/90">
          {copy.eyebrow}
        </p>

        <h2
          className={cn(
            "mt-3 max-w-xl font-bold leading-tight text-white",
            isGuest ? "text-2xl sm:text-3xl md:text-[2rem]" : "text-xl sm:text-2xl md:text-[1.75rem]",
          )}
        >
          {copy.headline}
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-[15px]">
          {PLATFORM_TAGLINE}
        </p>

        <ul className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
          {PLATFORM_PILLARS.map((pillar) => (
            <li
              key={pillar}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
            >
              {pillar}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
          {isGuest ? (
            <>
              <Link
                href="/auth/login?mode=signup"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl bg-unze-green px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition active:scale-[0.98] sm:flex-none sm:min-w-[180px]"
              >
                {HERO_GUEST_COPY.primary}
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition active:scale-[0.98] sm:flex-none sm:min-w-[140px]"
              >
                {HERO_GUEST_COPY.secondary}
              </Link>
            </>
          ) : (
            <Link
              href="/discover"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-unze-green px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-black/25 transition active:scale-[0.98] sm:min-w-[240px] sm:w-auto"
            >
              {HERO_MEMBER_COPY.primary}
            </Link>
          )}
        </div>

        {isGuest && (
          <Link
            href="/discover"
            className="mt-4 text-xs font-semibold text-emerald-100/90 underline-offset-2 hover:text-white hover:underline"
          >
            {HERO_GUEST_COPY.tertiaryLink}
          </Link>
        )}
      </div>
    </section>
  );
}
