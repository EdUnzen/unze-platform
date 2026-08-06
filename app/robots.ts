import { getMarketingBaseUrl } from "@/lib/constants/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = getMarketingBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/owner/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
