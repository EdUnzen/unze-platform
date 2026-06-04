import { PlatformShell } from "@/components/layout/PlatformShell";

interface MobileShellProps {
  children: React.ReactNode;
}

/** @deprecated Nutze PlatformShell — einheitlicher Shell-Context */
export async function MobileShell({ children }: MobileShellProps) {
  return <PlatformShell>{children}</PlatformShell>;
}
