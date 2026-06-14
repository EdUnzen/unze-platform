import { RoleBadge } from "@/components/ui/RoleBadge";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import { Shield } from "lucide-react";

interface RolesOverviewProps {
  members: CommunityMemberView[];
}

const ROLE_ORDER: CommunityRole[] = [
  "creator",
  "admin",
  "moderator",
  "verified_member",
  "member",
];

export function RolesOverview({ members }: RolesOverviewProps) {
  const counts = ROLE_ORDER.map((role) => ({
    role,
    count: members.filter((m) => m.role === role).length,
  })).filter((c) => c.count > 0);

  const moderators = members.filter(
    (m) => m.role === "moderator" || m.role === "admin",
  );

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold text-unze-ink">Rollenverteilung</p>
        <div className="flex flex-wrap gap-3">
          {counts.map(({ role, count }) => (
            <div
              key={role}
              className="flex items-center gap-2 rounded-2xl bg-unze-surface-muted/50 px-3 py-2"
            >
              <RoleBadge role={role} active size="md" />
              <span className="text-lg font-bold text-unze-ink">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-unze-ink">
          <Shield className="h-4 w-4 text-unze-green" aria-hidden />
          Moderatoren & Admins
        </h3>
        {moderators.length === 0 ? (
          <p className="text-sm text-unze-ink-muted">
            Noch keine Moderatoren ernannt. Weise Rollen unter Mitglieder zu.
          </p>
        ) : (
          <ul className="space-y-2">
            {moderators.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-unze-surface-muted px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-unze-ink">
                  {m.displayName ?? m.username ?? "Nutzer"}
                </span>
                <RoleBadge role={m.role} active />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-unze-ink-muted">
        Rollen ändern: Tab „Mitglieder“ → Dropdown pro Nutzer. Creator-Rolle ist
        geschützt.
      </p>
    </div>
  );
}
