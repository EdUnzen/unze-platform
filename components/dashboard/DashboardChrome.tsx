"use client";

import { DashboardDrawer } from "@/components/dashboard/DashboardDrawer";
import {
  DashboardShellProvider,
  useDashboardShell,
} from "@/components/dashboard/dashboard-shell-context";
import type { ManagedCommunity } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import type { ReactNode } from "react";

interface DashboardChromeProps {
  children: ReactNode;
  header: ReactNode;
  slug?: string;
  communityTitle?: string;
  viewerRole?: CommunityRole;
  accessLabel?: string;
  managedCommunities: ManagedCommunity[];
  attentionCounts: {
    applications: number;
    reports: number;
    removals: number;
    payments: number;
  };
  monetizationEnabled?: boolean;
}

function DashboardChromeInner({
  children,
  header,
  slug,
  communityTitle,
  viewerRole,
  accessLabel,
  managedCommunities,
  attentionCounts,
  monetizationEnabled,
}: DashboardChromeProps) {
  const { drawerOpen } = useDashboardShell();

  return (
    <>
      {header}
      <DashboardDrawer
        slug={slug}
        communityTitle={communityTitle}
        viewerRole={viewerRole}
        accessLabel={accessLabel}
        managedCommunities={managedCommunities}
        attentionCounts={attentionCounts}
        monetizationEnabled={monetizationEnabled}
      />
      <div
        className={drawerOpen ? "pointer-events-none select-none opacity-40" : undefined}
        aria-hidden={drawerOpen || undefined}
      >
        {children}
      </div>
    </>
  );
}

export function DashboardChrome(props: DashboardChromeProps) {
  return (
    <DashboardShellProvider>
      <DashboardChromeInner {...props} />
    </DashboardShellProvider>
  );
}
