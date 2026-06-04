"use client";

import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { getDefaultBannerPresetForCategory } from "@/lib/constants/category-banners";
import { cn } from "@/lib/utils/cn";
import { Camera, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";

interface CommunityBannerUploadProps {
  category: string;
  bannerGradient: string;
  previewUrl: string;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function CommunityBannerUpload({
  category,
  bannerGradient,
  previewUrl,
  onFileSelect,
  className,
}: CommunityBannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fallback = getDefaultBannerPresetForCategory(category);

  const displayUrl = localPreview ?? previewUrl;

  const handleFile = (file: File | null) => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (!file) {
      setLocalPreview(null);
      onFileSelect(null);
      return;
    }
    setLocalPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-2xl">
        <CommunityCoverVisual
          seed={`upload-${category}`}
          bannerGradient={bannerGradient}
          imageUrl={displayUrl}
          fallbackImageUrl={fallback.imageUrl}
          className="h-40 sm:h-44"
          overlay="card"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-unze-green px-3 py-2 text-xs font-semibold text-white shadow-lg active:scale-95"
        >
          <Camera className="h-4 w-4" aria-hidden />
          Banner hochladen
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="bannerFile"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          handleFile(file);
        }}
      />

      <p className="flex items-center gap-2 text-xs text-unze-ink-muted">
        <ImagePlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
        JPG, PNG oder WebP · max. 8 MB · funktioniert auf iPhone, Android & Desktop
      </p>
    </div>
  );
}
