import { CommunityVerificationPanel } from "@/components/verification/CommunityVerificationPanel";
import { VerificationReviewPanel } from "@/components/verification/VerificationReviewPanel";
import { loadCommunityVerificationData } from "@/app/dashboard/verification-actions";
import { getCurrentUser } from "@/services/auth/auth.service";
import { redirect } from "next/navigation";

interface CommunityVerificationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommunityVerificationPage({
  params,
}: CommunityVerificationPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const data = await loadCommunityVerificationData(slug);
  if (!data) {
    return (
      <p className="text-sm text-unze-ink-muted">Keine Berechtigung.</p>
    );
  }

  const canReview =
    data.community.viewerRole === "creator" ||
    data.community.viewerRole === "admin";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-base font-semibold text-unze-ink">
          Community-Verifizierung
        </h2>
        <p className="text-sm text-unze-ink-secondary">
          Vertrauens-Badge & Discover-Vorbereitung
        </p>
      </div>

      <CommunityVerificationPanel
        slug={slug}
        communityId={data.community.id}
        isVerified={data.community.isVerified}
        requests={data.requests}
      />

      {canReview && data.requests.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-unze-ink">
            Anträge prüfen
          </h3>
          <VerificationReviewPanel requests={data.requests} slug={slug} />
        </div>
      )}
    </section>
  );
}
