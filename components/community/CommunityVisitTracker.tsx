"use client";

import { trackVisitedCommunitySlug } from "@/lib/pwa/client-cache";
import { useEffect } from "react";

export function CommunityVisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackVisitedCommunitySlug(slug);
  }, [slug]);
  return null;
}
