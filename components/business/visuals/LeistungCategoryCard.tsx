import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReferenceCardThumbnail } from "@/components/business/visuals/ReferenceShowcase";
import { LEISTUNG_CATEGORY_VISUALS } from "@/lib/constants/business-reference-showcase";

export function LeistungCategoryCard({
  title,
  description,
  href,
  highlights,
}: {
  title: string;
  description: string;
  href: string;
  highlights: readonly string[];
}) {
  const visual = LEISTUNG_CATEGORY_VISUALS[title] ?? LEISTUNG_CATEGORY_VISUALS["Business Core"];

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#00C853]/25 hover:shadow-lg"
      data-export={`leistung-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {"asset" in visual ? (
        <ReferenceCardThumbnail asset={visual.asset} alt={visual.asset.alt} />
      ) : (
        <ReferenceCardThumbnail mock={visual.mock} alt={title} />
      )}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900 md:text-xl">
          {title}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {highlights.map((h) => (
            <li
              key={h}
              className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
            >
              {h}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#00C853]">
          Entdecken
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
