import { HomeContentSkeleton } from "@/components/home/HomeContentSkeleton";
import { HomePageBody } from "@/components/home/HomePageBody";
import { HomePwaWarmStart } from "@/components/home/HomePwaWarmStart";
import { Suspense } from "react";

function HomePageFallback() {
  return (
    <>
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-unze-border/60" />
        <div className="mt-2 h-4 w-full max-w-sm rounded bg-unze-border/40" />
      </div>
      <HomeContentSkeleton variant="member" />
    </>
  );
}

export async function PlatformHome() {
  return (
    <div className="page-padding">
      <HomePwaWarmStart />
      <Suspense fallback={<HomePageFallback />}>
        <HomePageBody />
      </Suspense>
    </div>
  );
}
