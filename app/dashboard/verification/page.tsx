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

export default async function VerificationHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard/verification");

  const data = await loadVerificationHubData();
  if (!data) redirect("/auth/login");

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm font-medium text-unze-green">
          ← Dashboard
        </Link>
      </div>

      <PageHeader
        title="Verifizierung"
        subtitle="Status, Anträge & Prüfung"
      />

      <section className="mb-6 space-y-2">
        <Link
          href="/verify/creator"
          className="block rounded-2xl border border-unze-border bg-white p-4 text-sm font-medium text-unze-green"
        >
          + Creator-Verifizierung beantragen
        </Link>
      </section>

      {data.pending.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold text-unze-ink">
            Prüfung ({data.pending.length})
          </h2>
          <VerificationReviewPanel requests={data.pending} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold text-unze-ink">
          Meine Anträge
        </h2>
        {data.requests.length === 0 ? (
          <p className="text-sm text-unze-ink-muted">Noch keine Anträge.</p>
        ) : (
          <ul className="space-y-2">
            {data.requests.map((req) => (
              <li
                key={req.id}
                className="rounded-xl border border-unze-border bg-white px-4 py-3"
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
        )}
      </section>
    </div>
  );
}
