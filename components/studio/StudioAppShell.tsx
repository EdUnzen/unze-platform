import { StudioMobileNav, StudioSidebarNav } from "@/components/studio/StudioNav";
import { STUDIO_BRAND } from "@/lib/studio/constants";
import type { StudioUser } from "@/lib/studio/auth";
import { LogOut } from "lucide-react";
import { Suspense, type ReactNode } from "react";

interface StudioAppShellProps {
  user: StudioUser;
  children: ReactNode;
}

function NavFallback() {
  return <nav className="flex-1 p-3" aria-hidden />;
}

export function StudioAppShell({ user, children }: StudioAppShellProps) {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-gray-100 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">UNZE Studio</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: STUDIO_BRAND.primary }}>
              Intern
            </p>
          </div>
          <Suspense fallback={<NavFallback />}>
            <StudioSidebarNav />
          </Suspense>
          <div className="border-t border-gray-100 p-4">
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">{user.roleId}</p>
            <form action="/api/studio/auth/logout" method="post" className="mt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Abmelden
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">UNZE Studio</p>
              <p className="text-sm font-semibold" style={{ color: STUDIO_BRAND.primary }}>
                Intern
              </p>
            </div>
            <form action="/api/studio/auth/logout" method="post">
              <button type="submit" className="text-xs text-gray-500 underline">
                Abmelden
              </button>
            </form>
          </header>

          <main className="flex-1 pb-20 lg:pb-6">{children}</main>

          <Suspense fallback={null}>
            <StudioMobileNav />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
