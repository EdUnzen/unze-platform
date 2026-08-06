/** Session-only flag for Marketing-Screenshots/Videos (not persisted across browser restarts). */
export const MARKETING_MODE_SESSION_KEY = "unze-marketing-mode";

/** URL query: ?marketing=1 */
export const MARKETING_MODE_QUERY = "marketing";

export function isMarketingQuery(value: string | null | undefined): boolean {
  return value === "1" || value === "true";
}
