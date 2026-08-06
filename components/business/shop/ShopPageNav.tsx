"use client";

const LINKS = [
  { href: "#shop-analyse", label: "Analyse" },
  { href: "#shop-service", label: "Servicepakete" },
  { href: "#shop-vergleich", label: "Vergleich" },
] as const;

export function ShopPageNav() {
  return (
    <nav
      aria-label="Shop-Bereiche"
      className="sticky top-[6.75rem] z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-md"
    >
      <div className="container mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#00C853]/40 hover:bg-[#00C853]/5 hover:text-[#007a3d]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
