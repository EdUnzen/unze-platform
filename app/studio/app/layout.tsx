import { StudioAppShell } from "@/components/studio/StudioAppShell";
import { getStudioSession } from "@/lib/studio/auth";
import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "UNZE Studio",
  description: "Internes Arbeitsportal für UNZE Business",
  robots: { index: false, follow: false },
  manifest: "/studio/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "UNZE Studio",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1DB872",
};

export default async function StudioAppLayout({ children }: { children: ReactNode }) {
  const studioUser = await getStudioSession();
  if (!studioUser) {
    redirect("/admin");
  }

  return <StudioAppShell user={studioUser}>{children}</StudioAppShell>;
}
