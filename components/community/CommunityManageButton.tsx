import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface CommunityManageButtonProps {
  slug: string;
  userId: string | null;
}

export async function CommunityManageButton({
  slug,
  userId,
}: CommunityManageButtonProps) {
  if (!userId) return null;

  const { canAccess } = await getDashboardCommunityAccess(slug, userId);
  if (!canAccess) return null;

  return (
    <Link
      href={`/dashboard/community/${slug}`}
      data-testid="community-manage-link"
      className="flex items-center justify-center gap-2 rounded-xl border border-unze-green bg-unze-green-muted/30 py-3 text-sm font-semibold text-unze-green-dark active:scale-[0.98]"
    >
      <LayoutDashboard className="h-4 w-4" aria-hidden />
      Verwalten
    </Link>
  );
}
