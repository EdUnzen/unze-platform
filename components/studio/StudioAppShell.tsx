import { StudioChrome } from "@/components/studio/StudioChrome";
import type { StudioUser } from "@/lib/studio/auth";
import type { ReactNode } from "react";

interface StudioAppShellProps {
  user: StudioUser;
  children: ReactNode;
}

export function StudioAppShell({ user, children }: StudioAppShellProps) {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <StudioChrome email={user.email} roleId={user.roleId}>
        {children}
      </StudioChrome>
    </div>
  );
}
