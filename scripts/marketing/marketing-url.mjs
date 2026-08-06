import { MARKETING_MODE_QUERY } from "./config.mjs";

/** Haengt ?marketing=1 an Routen fuer Marketing-Captures. */
export function marketingUrl(base, path) {
  const url = new URL(path, base);
  url.searchParams.set(MARKETING_MODE_QUERY, "1");
  return url.toString();
}

export const MARKETING_INIT_SCRIPT = () => {
  sessionStorage.setItem("unze-marketing-mode", "1");
  document.documentElement.dataset.marketingMode = "true";
};
