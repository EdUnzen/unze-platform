/** Dekorative Hintergrund-Gradienten — wiederverwendbar */

export function GradientOrbs({ variant = "light" }: { variant?: "light" | "dark" | "kontakt" }) {
  const colors =
    variant === "kontakt"
      ? "from-[#00C853]/20 via-indigo-500/15 to-violet-500/10"
      : variant === "dark"
        ? "from-[#00C853]/10 via-transparent to-indigo-500/10"
        : "from-[#00C853]/8 via-emerald-50/50 to-indigo-50/40";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br ${colors} blur-3xl`} />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tl from-indigo-200/30 to-[#00C853]/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#00C853]/5 blur-3xl" />
    </div>
  );
}
