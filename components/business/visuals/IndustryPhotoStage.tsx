import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { INDUSTRY_META, type IndustryId } from "@/lib/constants/business-industry-scenarios";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

type IndustryImageKey = keyof typeof BUSINESS_IMAGERY.industries;

const INDUSTRY_IMAGE: Record<IndustryId, IndustryImageKey> = {
  umzug: "umzug",
  reinigung: "reinigung",
  handwerk: "handwerk",
  arztpraxis: "arztpraxis",
};

/** Branchen-Kulisse ohne UI-Overlay — professionelle Fotopräsentation. */
export function IndustryPhotoStage({
  industry,
  className = "",
}: {
  industry: IndustryId;
  className?: string;
}) {
  const meta = INDUSTRY_META[industry];
  const image = BUSINESS_IMAGERY.industries[INDUSTRY_IMAGE[industry]];

  return (
    <article
      className={`group relative aspect-[4/5] overflow-hidden rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-900/10 ${className}`}
      data-export={`industry-photo-${industry}`}
    >
      <BusinessPhoto
        src={image.src}
        alt={image.alt}
        fill
        className="absolute inset-0 scale-105 object-cover transition duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-25 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/35 to-gray-950/10" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
          Referenz-Branche
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          {meta.label}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#00C853]">{meta.company}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{meta.tagline}</p>
      </div>
    </article>
  );
}
