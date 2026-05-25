import { BottomNav } from "@/components/navigation/BottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg bg-unze-surface-muted">
      <main className="min-h-dvh">{children}</main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
