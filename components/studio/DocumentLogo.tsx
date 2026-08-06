"use client";

import { STUDIO_COMPANY_PROFILE } from "@/lib/studio/company-profile";
import { useState } from "react";

export function DocumentLogo() {
  const [src, setSrc] = useState<string>(STUDIO_COMPANY_PROFILE.logoSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={STUDIO_COMPANY_PROFILE.brandName}
      className="h-11 w-auto max-w-[160px] object-contain"
      onError={() => {
        if (src !== STUDIO_COMPANY_PROFILE.logoFallbackSrc) {
          setSrc(STUDIO_COMPANY_PROFILE.logoFallbackSrc);
        }
      }}
    />
  );
}
