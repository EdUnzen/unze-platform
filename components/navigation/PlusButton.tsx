"use client";

import { cn } from "@/lib/utils/cn";
import { Plus } from "lucide-react";

interface PlusButtonProps {
  onClick: () => void;
  active?: boolean;
}

export function PlusButton({ onClick, active }: PlusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Creator-Menü öffnen"
      aria-expanded={active}
      className={cn(
        "relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-unze-green text-white shadow-fab transition-all duration-300",
        "active:scale-95 hover:bg-unze-green-light",
        active && "rotate-45 bg-unze-green-dark",
      )}
    >
      <Plus className="h-7 w-7 stroke-[2.5]" aria-hidden />
    </button>
  );
}
