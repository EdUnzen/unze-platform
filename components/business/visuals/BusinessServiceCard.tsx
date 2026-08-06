import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import {
  BUSINESS_IMAGERY,
  getServiceImageKey,
} from "@/lib/constants/business-imagery";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";

interface BusinessServiceCardProps {
  title: string;
  text: string;
  href: string;
  delay?: number;
}

export function BusinessServiceCard({
  title,
  text,
  href,
  delay = 0,
}: BusinessServiceCardProps) {
  const key = getServiceImageKey(href);
  const image = BUSINESS_IMAGERY.services[key];

  return (
    <BusinessScrollReveal delay={delay}>
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-[#00C853]/25 hover:shadow-xl"
      >
        <div className={`relative ${BUSINESS_VISUAL.photoAspect} overflow-hidden sm:aspect-[16/10]`}>
          <BusinessPhoto
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            imageClassName="transition duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
            aria-hidden
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{text}</p>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition group-hover:gap-2 group-hover:text-gray-800">
            Mehr erfahren
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </BusinessScrollReveal>
  );
}
