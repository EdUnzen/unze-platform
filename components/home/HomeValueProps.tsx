import { HOME_VALUE_PROPS } from "@/lib/constants/platform-copy";
import {
  Award,
  Briefcase,
  Calendar,
  Compass,
  ScrollText,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const ICONS = [Compass, UsersRound, Calendar, Briefcase, Award, ScrollText] as const;

export function HomeValueProps() {
  return (
    <section>
      <header className="mb-3 px-0.5">
        <h2 className="text-sm font-bold text-unze-ink">Was UNZE bietet</h2>
        <p className="mt-0.5 text-xs text-unze-ink-secondary">
          Von der Community bis zum Zertifikat {"\u2014"} alles auf einer Plattform.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {HOME_VALUE_PROPS.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex flex-col gap-2 rounded-2xl border border-unze-border bg-white p-3 shadow-card transition active:scale-[0.98] hover:border-unze-green/30 sm:p-4"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-unze-green-muted/50">
                <Icon className="h-4 w-4 text-unze-green" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs font-semibold text-unze-ink sm:text-sm">{item.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-unze-ink-secondary sm:text-xs">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
