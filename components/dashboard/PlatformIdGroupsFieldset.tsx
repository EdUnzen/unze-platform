import type { PlatformIdentityType } from "@/types/access";
import {
  getPlatformIdentityOption,
  PLATFORM_IDENTITY_GROUPS,
} from "@/lib/constants/access";
import { cn } from "@/lib/utils/cn";

interface PlatformIdGroupsFieldsetProps {
  selected: PlatformIdentityType[];
  inputName?: string;
  className?: string;
}

export function PlatformIdGroupsFieldset({
  selected,
  inputName = "requiredPlatformIds",
  className,
}: PlatformIdGroupsFieldsetProps) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="mb-1 text-xs font-medium text-unze-ink">
        Pflicht-Plattform-IDs
      </legend>
      <p className="text-[11px] text-unze-ink-muted">
        Nur ausw{"\u00e4"}hlen, was f{"\u00fc"}r deine Community wirklich n{"\u00f6"}tig ist.
      </p>
      <p className="text-[10px] text-unze-ink-muted">
        Mitglieder tragen die ID bei der Bewerbung nach {"\u2014"} z. B. Discord oder WhatsApp.
      </p>
      {PLATFORM_IDENTITY_GROUPS.map((group) => (
        <div
          key={group.id}
          className="rounded-xl border border-unze-border/70 bg-unze-surface-muted/40 p-3"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-unze-ink-muted">
            {group.label}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.values.map((value) => {
              const opt = getPlatformIdentityOption(value);
              if (!opt) return null;
              return (
                <label
                  key={value}
                  className="flex min-h-[36px] items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    name={inputName}
                    value={value}
                    defaultChecked={selected.includes(value)}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
