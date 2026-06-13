import type { PlatformRole } from "@/types/database";

/** Plattform-Owner (UNZE) — voller Zugriff auf Owner Center */
export function isPlatformOwner(role: PlatformRole | string | null | undefined): boolean {
  return role === "owner" || role === "platform_admin";
}
