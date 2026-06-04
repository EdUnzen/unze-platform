import { UserAvatar } from "@/components/ui/UserAvatar";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import { BadgeCheck, Crown, Shield, Star, Users } from "lucide-react";

interface CommunityMemberShowcaseProps {
  members: CommunityMemberView[];
}

function displayRole(member: CommunityMemberView): string {
  if (member.roleTitle?.trim()) return member.roleTitle.trim();
  return ROLE_LABELS[member.role] ?? member.role;
}

function MemberRow({
  member,
  badge,
}: {
  member: CommunityMemberView;
  badge?: "vip" | "verified";
}) {
  const name = member.displayName ?? member.username ?? "Mitglied";

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/30 px-3 py-2.5">
      <UserAvatar name={name} seed={member.userId} avatarUrl={member.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-unze-ink">{name}</p>
        <p className="text-[11px] text-unze-ink-muted">{displayRole(member)}</p>
      </div>
      {badge === "vip" && (
        <Crown className="h-4 w-4 shrink-0 text-amber-500" aria-label="VIP" />
      )}
      {(badge === "verified" || member.isVerified) && (
        <BadgeCheck className="h-4 w-4 shrink-0 text-unze-green" aria-label="Verifiziert" />
      )}
    </li>
  );
}

function MemberSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Shield;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
        <Icon className="h-3.5 w-3.5 text-unze-green" aria-hidden />
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function isVipMember(member: CommunityMemberView): boolean {
  const title = member.roleTitle?.toLowerCase() ?? "";
  return member.role === "verified_member" && title.includes("vip");
}

export function CommunityMemberShowcase({ members }: CommunityMemberShowcaseProps) {
  const byRole = (roles: CommunityRole[]) =>
    members.filter((m) => roles.includes(m.role));

  const creators = members.filter((m) => m.role === "creator");
  const moderators = byRole(["moderator", "admin"]);
  const experts = byRole(["expert"]);
  const vips = members.filter(isVipMember);
  const verified = members.filter(
    (m) => m.role === "verified_member" && !isVipMember(m),
  );

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-unze-ink-muted">
        Mitgliederbereich wird bald sichtbar.
      </p>
    );
  }

  return (
    <div className="space-y-5" data-testid="community-member-showcase">
      <header className="flex items-center gap-2 border-b border-unze-border/50 pb-3">
        <Users className="h-4 w-4 text-unze-green" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-unze-ink">Mitgliederbereich</h2>
          <p className="text-xs text-unze-ink-secondary">
            Creator, Team, Experten &amp; verifizierte Mitglieder
          </p>
        </div>
      </header>

      {creators.length > 0 && (
        <MemberSection title="Creator" icon={Star}>
          {creators.map((m) => (
            <MemberRow key={m.id} member={m} badge="verified" />
          ))}
        </MemberSection>
      )}

      {moderators.length > 0 && (
        <MemberSection title="Moderatoren" icon={Shield}>
          {moderators.map((m) => (
            <MemberRow key={m.id} member={m} badge={m.isVerified ? "verified" : undefined} />
          ))}
        </MemberSection>
      )}

      {experts.length > 0 && (
        <MemberSection title="Experten" icon={BadgeCheck}>
          {experts.map((m) => (
            <MemberRow key={m.id} member={m} badge="verified" />
          ))}
        </MemberSection>
      )}

      {vips.length > 0 && (
        <MemberSection title="VIPs" icon={Crown}>
          {vips.map((m) => (
            <MemberRow key={m.id} member={m} badge="vip" />
          ))}
        </MemberSection>
      )}

      {verified.length > 0 && (
        <MemberSection title="Verifizierte Mitglieder" icon={BadgeCheck}>
          {verified.map((m) => (
            <MemberRow key={m.id} member={m} badge="verified" />
          ))}
        </MemberSection>
      )}

      <p className="text-[11px] text-unze-ink-muted">
        Individuelle Bezeichnungen werden vom Creator vergeben. Technisch bleiben Rollen
        über das Dashboard verwaltbar.
      </p>
    </div>
  );
}
