import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";

interface BusinessBenefitCardProps {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  delay?: number;
}

export function BusinessBenefitCard({
  title,
  text,
  imageSrc,
  imageAlt,
  delay = 0,
}: BusinessBenefitCardProps) {
  return (
    <BusinessScrollReveal delay={delay}>
      <article className="group h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className={`relative ${BUSINESS_VISUAL.photoAspect} overflow-hidden`}>
          <BusinessPhoto
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            imageClassName="transition duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-7">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
        </div>
      </article>
    </BusinessScrollReveal>
  );
}
