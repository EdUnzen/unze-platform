import { getMarketingBaseUrl } from "@/lib/constants/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getMarketingBaseUrl();
  const now = new Date();
  const routes = ["", "/discover", "/impressum", "/datenschutz", "/kontakt", "/business", "/agb", "/auth/login"];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
