import { redirect } from "next/navigation";

interface BadgesRedirectProps {
  params: Promise<{ slug: string }>;
}

/** Legacy-Route → Auszeichnungen */
export default async function DashboardBadgesRedirect({ params }: BadgesRedirectProps) {
  const { slug } = await params;
  redirect(`/dashboard/community/${slug}/auszeichnungen`);
}
