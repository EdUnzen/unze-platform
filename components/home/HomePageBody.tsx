import { HomeContentSkeleton } from "@/components/home/HomeContentSkeleton";
import { HomeGuestContent } from "@/components/home/HomeGuestContent";
import { HomeMemberContent } from "@/components/home/HomeMemberContent";
import { PageHeader } from "@/components/layout/PageHeader";
import { MEMBER_HUB_SUBTITLE, PLATFORM_TAGLINE } from "@/lib/constants/platform-copy";
import { getCurrentUser } from "@/services/auth/auth.service";
import { Suspense } from "react";

export async function HomePageBody() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader
        title={user ? "Mein UNZE" : "Willkommen bei UNZE"}
        subtitle={user ? MEMBER_HUB_SUBTITLE : PLATFORM_TAGLINE}
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
    </>
  );
}
