import { CreatorVerificationForm } from "@/components/verification/CreatorVerificationForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadVerificationHubData } from "@/app/dashboard/verification-actions";
import { getCurrentUser } from "@/services/auth/auth.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreatorVerificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/verify/creator");

  const data = await loadVerificationHubData();

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link href="/profile" className="text-sm font-medium text-unze-green">
          ← Profil
        </Link>
      </div>

      <PageHeader
        title="Creator-Verifizierung"
        subtitle="Identität oder Gewerbe — für vertrauenswürdige Creator-Profile"
      />

      <p className="mb-4 text-xs text-unze-ink-muted">
        Dokumente werden privat gespeichert und nur von Prüfern über Signed URLs
        eingesehen. Jeder Zugriff wird protokolliert.
      </p>

      <CreatorVerificationForm status={data?.status ?? null} />
    </div>
  );
}
