import { getFocusTagStyle } from "@/lib/constants/focus-tag-styles";
import { cn } from "@/lib/utils/cn";

interface CommunityFocusChipsProps {
  focusTags: string[];
  className?: string;
}

export function CommunityFocusChips({ focusTags, className }: CommunityFocusChipsProps) {
  if (focusTags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {focusTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            getFocusTagStyle(tag),
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
