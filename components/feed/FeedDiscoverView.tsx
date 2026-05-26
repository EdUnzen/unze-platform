"use client";

import type { FeedPost } from "@/lib/mappers/post.mapper";
import { cn } from "@/lib/utils/cn";
import { LayoutGrid, Rows3 } from "lucide-react";
import { useState } from "react";
import { FeedEmptyState, FeedPostCard } from "./FeedPostCard";

interface FeedDiscoverViewProps {
  posts: FeedPost[];
  isLoggedIn: boolean;
  emptyMessage?: string;
}

export function FeedDiscoverView({
  posts,
  isLoggedIn,
  emptyMessage = "Noch keine Beiträge im Feed.",
}: FeedDiscoverViewProps) {
  const [mode, setMode] = useState<"list" | "swipe">("list");

  if (posts.length === 0) {
    return <FeedEmptyState message={emptyMessage} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-1 rounded-2xl bg-unze-surface-muted p-1">
        <button
          type="button"
          onClick={() => setMode("list")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
            mode === "list"
              ? "bg-white text-unze-ink shadow-sm"
              : "text-unze-ink-muted",
          )}
        >
          <Rows3 className="h-3.5 w-3.5" aria-hidden />
          Liste
        </button>
        <button
          type="button"
          onClick={() => setMode("swipe")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
            mode === "swipe"
              ? "bg-white text-unze-ink shadow-sm"
              : "text-unze-ink-muted",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          Swipe
        </button>
      </div>

      {mode === "swipe" ? (
        <ul
          className="flex max-h-[min(72dvh,640px)] snap-y snap-mandatory flex-col gap-3 overflow-y-auto pb-2 scrollbar-none"
          data-testid="feed-swipe-stack"
        >
          {posts.map((post) => (
            <li key={post.id}>
              <FeedPostCard
                post={post}
                isLoggedIn={isLoggedIn}
                variant="swipe"
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3" data-testid="feed-post-list">
          {posts.map((post) => (
            <li key={post.id}>
              <FeedPostCard post={post} isLoggedIn={isLoggedIn} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
