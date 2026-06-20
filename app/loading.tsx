import { HomeContentSkeleton } from "@/components/home/HomeContentSkeleton";

export default function HomeLoading() {
  return (
    <div className="page-padding">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-unze-border/60" />
        <div className="mt-2 h-4 w-full max-w-sm rounded bg-unze-border/40" />
      </div>
      <HomeContentSkeleton variant="member" />
    </div>
  );
}
