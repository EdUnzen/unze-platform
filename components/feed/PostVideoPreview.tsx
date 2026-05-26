import type { PostMediaItem } from "@/types/post";
import { cn } from "@/lib/utils/cn";
import { Play } from "lucide-react";
import Link from "next/link";

interface PostVideoPreviewProps {
  media: PostMediaItem;
  postId: string;
  className?: string;
  variant?: "feed" | "detail";
}

export function PostVideoPreview({
  media,
  postId,
  className,
  variant = "feed",
}: PostVideoPreviewProps) {
  const thumb = media.thumbnailUrl ?? media.url;

  return (
    <Link
      href={`/post/${postId}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-black",
        variant === "feed" ? "aspect-[4/5] max-h-[320px]" : "aspect-video",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={media.alt ?? "Video-Vorschau"}
        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-unze-ink shadow-lg">
          <Play className="ml-0.5 h-6 w-6" aria-hidden />
        </span>
      </div>
      {media.durationSec !== undefined && media.durationSec > 0 && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {formatDuration(media.durationSec)}
        </span>
      )}
    </Link>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
