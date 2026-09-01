import { STUDIO_AREA_GROUPS, type StudioNavIcon, type StudioNavItem } from "@/lib/studio/constants";
import {
  Camera,
  FileText,
  Inbox,
  LayoutGrid,
  Receipt,
  ShoppingBag,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export const STUDIO_NAV_ICONS: Record<StudioNavIcon, LucideIcon> = {
  overview: LayoutGrid,
  inbox: Inbox,
  users: Users,
  tag: Tag,
  file: FileText,
  receipt: Receipt,
  shop: ShoppingBag,
  camera: Camera,
};

export function isStudioNavActive(pathname: string, href: string): boolean {
  if (href === "/studio/app/uebersicht") {
    return pathname === href || pathname.startsWith("/studio/app/uebersicht/");
  }
  if (href === "/studio/app") {
    return pathname === href || pathname.startsWith("/studio/app/inquiries");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getStudioAreaItems(): StudioNavItem[] {
  return STUDIO_AREA_GROUPS.flatMap((group) => [...group.items]);
}
