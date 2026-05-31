import { CreatorVerificationForm } from "@/components/verification/CreatorVerificationForm";
import { VerificationReviewPanel } from "@/components/verification/VerificationReviewPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadVerificationHubData } from "@/app/dashboard/verification-actions";
import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_TYPE_LABELS,
} from "@/lib/verification/constants";
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
        title="Verifizierung"
        subtitle="Creator-Identität, Status und Anträge — alles an einem Ort"
      />

      <section className="mb-6 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-semibold text-unze-ink">Mein Status</h2>
        {data?.status?.status ? (
          <p className="text-sm text-unze-ink-secondary">
            {VERIFICATION_STATUS_LABELS[data.status.status]}
            {data.status.isVerifiedCreator ? " · Verifizierter Creator" : ""}
          </p>
        ) : (
          <p className="text-sm text-unze-ink-secondary">
            Noch nicht verifiziert — Antrag unten stellen.
          </p>
        )}
      </section>

      {data && data.requests.length > 0 && (
        <section className="mb-6 rounded-3xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-unze-ink">Meine Anträge</h2>
          <ul className="space-y-2">
            {data.requests.map((req) => (
              <li
                key={req.id}
                className="rounded-xl border border-unze-border bg-unze-surface-muted/30 px-4 py-3"
              >
                <p className="text-sm font-medium text-unze-ink">
                  {VERIFICATION_TYPE_LABELS[req.verificationType]}
                </p>
                <p className="text-xs text-unze-ink-muted">
                  {VERIFICATION_STATUS_LABELS[req.status]} ·{" "}
                  {new Date(req.createdAt).toLocaleDateString("de-DE")}
                </p>
                {req.rejectionReason && (
                  <p className="mt-1 text-xs text-red-600">{req.rejectionReason}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && data.pending.length > 0 && (
        <section className="mb-6 rounded-3xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-unze-ink">
            Zu prüfen ({data.pending.length})
          </h2>
          <VerificationReviewPanel requests={data.pending} />
        </section>
      )}

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-semibold text-unze-ink">
          Creator-Verifizierung beantragen
        </h2>
        <p className="mb-4 text-xs text-unze-ink-muted">
          Dokumente werden privat gespeichert und nur von Prüfern über Signed URLs
          eingesehen. Jeder Zugriff wird protokolliert.
        </p>
        <CreatorVerificationForm status={data?.status ?? null} />
      </section>
    </div>
  );
}
