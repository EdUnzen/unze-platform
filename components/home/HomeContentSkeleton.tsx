export function HomeContentSkeleton({ variant }: { variant: "guest" | "member" }) {
  return (
    <div className="animate-pulse space-y-5">
      <div
        className={
          variant === "guest"
            ? "h-[360px] rounded-3xl bg-unze-border/40"
            : "h-[300px] rounded-3xl bg-unze-border/40"
        }
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-unze-border/35" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-40 rounded-3xl bg-unze-border/30" />
        <div className="h-40 rounded-3xl bg-unze-border/30" />
      </div>
    </div>
  );
}
