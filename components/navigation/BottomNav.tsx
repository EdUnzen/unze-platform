"use client";

import { NAV_ITEMS, type NavItemId } from "@/lib/constants/navigation";
import { useShellState } from "@/components/pwa/ShellHydrator";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlusButton } from "./PlusButton";
import { PlusMenu } from "./PlusMenu";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function getActiveNavId(pathname: string): NavItemId | null {
  const item = NAV_ITEMS.find((nav) => isNavActive(pathname, nav.href));
  return item?.id ?? null;
}

interface BottomNavProps {
  /** @deprecated ShellHydrator liefert Werte — Props optional für Tests */
  unreadNotifications?: number;
  showCreatorMenu?: boolean;
}

export function BottomNav({
  unreadNotifications: unreadProp,
  showCreatorMenu: creatorProp,
}: BottomNavProps = {}) {
  const pathname = usePathname();
  const [plusOpen, setPlusOpen] = useState(false);
  const activeId = getActiveNavId(pathname);
  const shell = useShellState();
  const unreadNotifications = unreadProp ?? shell.unreadCount;
  const showCreatorMenu = creatorProp ?? shell.showDashboard;

  return (
    <>
      <nav
        className="glass-nav fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-lg pb-[env(safe-area-inset-bottom)]"
        aria-label="Hauptnavigation"
      >
        <div className="flex h-nav-height items-center justify-around px-2">
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            const showNotifBadge = item.id === "home" && unreadNotifications > 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1",
                  active ? "text-unze-green" : "text-unze-ink-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn("h-6 w-6", active && "stroke-[2.5]")}
                  aria-hidden
                />
                {showNotifBadge && (
                  <span
                    className="absolute right-[calc(50%-18px)] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                    aria-label={`${unreadNotifications} ungelesene Benachrichtigungen`}
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="flex flex-1 justify-center">
            <PlusButton
              onClick={() => setPlusOpen((o) => !o)}
              active={plusOpen}
            />
          </div>

          {NAV_ITEMS.slice(2).map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1",
                  active ? "text-unze-green" : "text-unze-ink-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn("h-6 w-6", active && "stroke-[2.5]")}
                  aria-hidden
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <PlusMenu
        open={plusOpen}
        onClose={() => setPlusOpen(false)}
        showCreatorMenu={showCreatorMenu}
      />
    </>
  );
}
