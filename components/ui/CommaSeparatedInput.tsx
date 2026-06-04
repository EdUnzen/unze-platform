"use client";

import { cn } from "@/lib/utils/cn";
import { useId } from "react";

interface CommaSeparatedInputProps {
  id?: string;
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  maxTags?: number;
  className?: string;
  inputClassName?: string;
}

/** Kommagetrennte Eingabe — Rohtext bleibt erhalten (iOS-Komma funktioniert). */
export function CommaSeparatedInput({
  id: idProp,
  name,
  label,
  hint,
  placeholder,
  defaultValue = "",
  maxTags = 8,
  className,
  inputClassName,
}: CommaSeparatedInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-unze-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="text"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-base outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20 sm:text-sm",
          inputClassName,
        )}
      />
      {hint && <p className="mt-1 text-xs text-unze-ink-muted">{hint}</p>}
      <p className="mt-0.5 text-[11px] text-unze-ink-muted">
        Max. {maxTags} Einträge, durch Komma trennen
      </p>
    </div>
  );
}
