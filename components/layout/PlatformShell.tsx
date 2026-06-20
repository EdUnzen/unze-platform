import { BottomNav } from "@/components/navigation/BottomNav";
import { PlatformTopBarActions } from "@/components/layout/PlatformTopBarActions";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { FirstVisitOnboarding } from "@/components/onboarding/FirstVisitOnboarding";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PwaBootstrap } from "@/components/pwa/PwaBootstrap";
import { RoutePrefetch } from "@/components/pwa/RoutePrefetch";
import { ShellHydrator } from "@/components/pwa/ShellHydrator";
import { getCurrentUser } from "@/services/auth/auth.service";

interface PlatformShellProps {
  children: React.ReactNode;
}

/**
 * Shell: nur Session serverseitig — Badges/Creator-Flags clientseitig
 * (localStorage + /api/pwa/shell) für schnelleren First Paint.
 */
export async function PlatformShell({ children }: PlatformShellProps) {
  const user = await getCurrentUser();

  return (
    <ShellHydrator userId={user?.id ?? null}>
      <div className="relative mx-auto min-h-dvh w-full max-w-lg bg-unze-surface-muted">
        <header
          className="sticky top-0 z-30 border-b border-unze-border/60 bg-unze-surface-muted/95 px-4 py-3 backdrop-blur-md"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <UnzeLogo href="/" size="sm" className="-ml-0.5" />
            <PlatformTopBarActions userId={user?.id ?? null} />
          </div>
        </header>

        <main className="min-h-dvh">{children}</main>

        <BottomNav />
        <FirstVisitOnboarding />
        <InstallPrompt />
        <RoutePrefetch />
        <PwaBootstrap userId={user?.id ?? null} />
      </div>
    </ShellHydrator>
  );
}
