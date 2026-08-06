import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ShopBrowserChromeProps = {
  children: ReactNode;
  url?: string;
  className?: string;
};

/** Minimale Browser-Leiste — macht Template-Vorschauen professioneller */
export function ShopBrowserChrome({
  children,
  url = "ihre-domain.de",
  className,
}: ShopBrowserChromeProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/90 px-3 py-2">
        <div className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-red-400/90" />
          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
        </div>
        <div className="mx-auto min-w-0 max-w-[70%] truncate rounded-md border border-gray-200/80 bg-white px-3 py-0.5 text-center text-[10px] text-gray-400">
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}
