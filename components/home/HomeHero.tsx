import { HOME_HERO_IMAGE, PLATFORM_TAGLINE } from "@/lib/constants/platform-copy";
import Image from "next/image";
import Link from "next/link";

interface HomeHeroProps {
  variant: "guest" | "member";
}

export function HomeHero({ variant }: HomeHeroProps) {
  const isGuest = variant === "guest";

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-card">
      <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[300px]">
        <Image
          src={HOME_HERO_IMAGE}
          alt="UNZE — Communities, Gruppen, Events und Services vernetzt auf einer Plattform"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 768px"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-4 sm:min-h-[260px] sm:p-5 md:min-h-[300px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200/90">
            {isGuest ? "Willkommen bei UNZE" : "Dein Netzwerk auf UNZE"}
          </p>
          <h2 className="mt-1 max-w-lg text-lg font-bold leading-snug text-white sm:text-xl md:text-2xl">
            {isGuest
              ? "Communities, Gruppen & Events — alles an einem Ort"
              : "Communities, Gruppen & Events — dein Verwaltungs-Hub"}
          </h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-white/90 sm:text-sm">
            {PLATFORM_TAGLINE}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {isGuest ? (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex rounded-xl bg-unze-green px-4 py-2.5 text-xs font-semibold text-white shadow-lg active:scale-[0.98] sm:text-sm"
                >
                  Anmelden
                </Link>
                <Link
                  href="/auth/login?mode=signup"
                  className="inline-flex rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm active:scale-[0.98] sm:text-sm"
                >
                  Kostenlos registrieren
                </Link>
              </>
            ) : (
              <Link
                href="/discover"
                className="inline-flex rounded-xl bg-unze-green px-4 py-2.5 text-xs font-semibold text-white shadow-lg active:scale-[0.98] sm:text-sm"
              >
                Discover öffnen
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
