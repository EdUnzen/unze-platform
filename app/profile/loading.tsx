export default function ProfileLoading() {
  return (
    <div className="page-padding animate-pulse space-y-5 pb-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="h-32 bg-unze-border/40" />
        <div className="-mt-14 flex justify-center pb-6">
          <div className="h-28 w-28 rounded-full bg-unze-border/50" />
        </div>
        <div className="mx-auto mb-6 flex flex-col items-center gap-2 px-5">
          <div className="h-3 w-20 rounded bg-unze-border/40" />
          <div className="h-7 w-40 rounded-lg bg-unze-border/50" />
          <div className="h-4 w-28 rounded bg-unze-border/40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-unze-border/40" />
        <div className="h-24 rounded-2xl bg-unze-border/40" />
      </div>
      <div className="h-32 rounded-2xl bg-unze-border/40" />
    </div>
  );
}
