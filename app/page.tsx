import { HomeContentSkeleton } from "@/components/home/HomeContentSkeleton";
import { HomeGuestContent } from "@/components/home/HomeGuestContent";
import { HomeMemberContent } from "@/components/home/HomeMemberContent";
import { HomePwaWarmStart } from "@/components/home/HomePwaWarmStart";
import { PageHeader } from "@/components/layout/PageHeader";
import { PLATFORM_TAGLINE } from "@/lib/constants/platform-copy";
import { getCurrentUser } from "@/services/auth/auth.service";
import { Suspense } from "react";

export const revalidate = 60;

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="page-padding">
      <HomePwaWarmStart />
      <PageHeader
        title={user ? "Mein UNZE" : "Willkommen bei UNZE"}
        subtitle={
          user
            ? "Communities, Gruppen, Events und Anträge — dein Verwaltungs-Hub."
            : PLATFORM_TAGLINE
        }
      />

      <Suspense
        fallback={<HomeContentSkeleton variant={user ? "member" : "guest"} />}
      >
        {user ? (
          <HomeMemberContent userId={user.id} />
        ) : (
          <HomeGuestContent />
        )}
      </Suspense>
    </div>
  );
}
