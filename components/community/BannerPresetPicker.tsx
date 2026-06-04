"use client";

import {
  getBannerPresetsForCategory,
  getDefaultBannerPresetForCategory,
  type BannerPreset,
} from "@/lib/constants/category-banners";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { cn } from "@/lib/utils/cn";
import { useEffect, useMemo, useState } from "react";

interface BannerPresetPickerProps {
  category: string;
  selectedPresetId: string;
  bannerGradient: string;
  hasUpload?: boolean;
  onSelect: (preset: BannerPreset) => void;
}

export function BannerPresetPicker({
  category,
  selectedPresetId,
  bannerGradient,
  hasUpload = false,
  onSelect,
}: BannerPresetPickerProps) {
  const presets = useMemo(() => getBannerPresetsForCategory(category), [category]);
  const [activeId, setActiveId] = useState(selectedPresetId);

  useEffect(() => {
    const exists = presets.some((p) => p.id === selectedPresetId);
    if (!exists) {
      const fallback = getDefaultBannerPresetForCategory(category);
      setActiveId(fallback.id);
      onSelect(fallback);
    } else {
      setActiveId(selectedPresetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Kategorie-Wechsel
  }, [category]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="bannerPresetId" value={activeId} />
      <input type="hidden" name="bannerGradient" value={bannerGradient} />
      <input type="hidden" name="bannerUrl" value="" />

      <div>
        <p className="mb-2 text-sm font-medium text-unze-ink">Standardbanner wählen</p>
        <p className="mb-3 text-xs text-unze-ink-muted">
          {hasUpload
            ? "Dein Upload wird verwendet — oder wähle ein Kategorie-Banner als Alternative."
            : `Passend zu „${category}“ — wird automatisch gesetzt, wenn du kein Bild hochlädst.`}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {presets.map((preset) => {
            const isActive = preset.id === activeId && !hasUpload;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActiveId(preset.id);
                  onSelect(preset);
                }}
                className={cn(
                  "relative overflow-hidden rounded-xl ring-2 ring-offset-2 transition-all",
                  isActive ? "ring-unze-green" : "ring-transparent hover:ring-unze-border",
                )}
              >
                <CommunityCoverVisual
                  seed={preset.id}
                  bannerGradient={preset.gradient}
                  imageUrl={preset.imageUrl}
                  fallbackImageUrl={preset.imageUrl}
                  className="h-16"
                  overlay="subtle"
                />
                <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/50 px-1 py-0.5 text-[10px] font-medium text-white">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
