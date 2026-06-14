import { GUEST_HERO_IMAGE, HOME_HERO_IMAGE, PLATFORM_TAGLINE } from "@/lib/constants/platform-copy";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

interface HomeHeroProps {
  variant: "guest" | "member";
}

export function HomeHero({ variant }: HomeHeroProps) {
  const isGuest = variant === "guest";

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5">
      <div
        className={cn(
          "relative",
          isGuest
            ? "min-h-[360px] sm:min-h-[400px] md:min-h-[440px]"
            : "min-h-[300px] sm:min-h-[340px] md:min-h-[380px]",
        )}
      >
        <Image
          src={isGuest ? GUEST_HERO_IMAGE : HOME_HERO_IMAGE}
          alt="UNZE — Communities, Gruppen, Events und Services vernetzt auf einer Plattform"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 768px"
          className={cn(
            "object-cover",
            isGuest ? "object-[center_40%]" : "object-[center_35%]",
          )}
        />

        {/* Leichter Top-Schutz — Motiv bleibt dominant */}
        <div
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent"
          aria-hidden
        />

        {/* Nur unterer Textbereich abdunkeln */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent",
            isGuest
              ? "h-[42%] from-black/92 via-black/50"
              : "h-[45%] from-black/88 via-black/40",
          )}
          aria-hidden
        />

        {/* Text + CTA am unteren Rand */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex flex-col",
            isGuest
              ? "px-4 pb-6 pt-24 sm:px-6 sm:pb-7"
              : "px-4 pb-5 pt-20 sm:px-5 sm:pb-6",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200/90">
            {isGuest ? "Willkommen bei UNZE" : "Mein UNZE"}
          </p>
          <h2 className="mt-2 max-w-lg text-xl font-bold leading-tight text-white sm:text-2xl md:text-[1.75rem]">
            {isGuest
              ? "Communities, Gruppen & Events — alles an einem Ort"
              : "Dein Netzwerk — Communities, Gruppen & Events"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">
            {PLATFORM_TAGLINE}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {isGuest ? (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex min-h-[48px] items-center rounded-2xl bg-unze-green px-6 py-3 text-sm font-bold text-white shadow-lg shadow-unze-green/30 active:scale-[0.98]"
                >
                  Anmelden
                </Link>
                <Link
                  href="/auth/login?mode=signup"
                  className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-white/50 bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm active:scale-[0.98]"
                >
                  Kostenlos registrieren
                </Link>
              </>
            ) : (
              <Link
                href="/discover"
                className="inline-flex min-h-[48px] items-center rounded-2xl bg-unze-green px-6 py-3 text-sm font-bold text-white shadow-lg shadow-unze-green/30 active:scale-[0.98]"
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
