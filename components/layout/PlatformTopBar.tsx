import { CONNECT_HOME_PATH } from "@/lib/constants/site";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { PlatformTopBarActions } from "@/components/layout/PlatformTopBarActions";
import { getPlatformShellContext } from "@/services/shell/platform-shell.service";

export async function PlatformTopBar() {
  const { user } = await getPlatformShellContext();

  return (
    <header
      className="sticky top-0 z-30 border-b border-unze-border/60 bg-unze-surface-muted/95 px-4 py-3 backdrop-blur-md"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <UnzeLogo href={CONNECT_HOME_PATH} size="sm" className="-ml-0.5" />

        <PlatformTopBarActions userId={user?.id ?? null} />
      </div>
    </header>
  );
}
