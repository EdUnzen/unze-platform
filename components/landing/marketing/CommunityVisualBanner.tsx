import Image from "next/image";
import { resolvePublicCommunityVisual } from "@/lib/marketing/community-visuals";
import type { PublicCommunityCard } from "@/lib/marketing/public-directory.service";

type Props = {
  community: Pick<
    PublicCommunityCard,
    "bannerUrl" | "bannerGradient" | "category" | "bannerPresetId" | "title"
  >;
  className?: string;
  priority?: boolean;
  overlay?: "light" | "dark";
};

export function CommunityVisualBanner({
  community,
  className = "relative aspect-[16/10] w-full overflow-hidden",
  priority,
  overlay = "dark",
}: Props) {
  const visual = resolvePublicCommunityVisual(community);
  const overlayClass =
    overlay === "dark"
      ? "bg-gradient-to-t from-black/55 via-black/15 to-transparent"
      : "bg-gradient-to-t from-white/80 via-white/20 to-transparent";

  return (
    <div className={className} style={{ background: visual.gradient }}>
      <Image
        src={visual.imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={priority}
      />
      <div className={`absolute inset-0 ${overlayClass}`} aria-hidden />
    </div>
  );
}
