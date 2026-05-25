import { loadInvitePageData } from "@/app/invite/actions";
import { InviteRedeemButton } from "@/components/community/InviteRedeemButton";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import { LogIn, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const { preview, isLoggedIn } = await loadInvitePageData(code);

  if (!preview) notFound();

  return (
    <div className="page-padding mx-auto max-w-md">
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-unze-green">
          Community-Einladung
        </p>
        <h1 className="mb-2 text-xl font-bold text-unze-ink">
          {preview.communityTitle}
        </h1>
        <p className="mb-4 text-sm text-unze-ink-secondary">
          Du wirst als{" "}
          <strong>{ROLE_LABELS[preview.assignedRole]}</strong> eingeladen.
        </p>

        {preview.expiresAt && (
          <p className="mb-4 text-xs text-unze-ink-muted">
            Gültig bis:{" "}
            {new Date(preview.expiresAt).toLocaleString("de-DE")}
          </p>
        )}

        {!preview.isValid && preview.invalidReason && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {preview.invalidReason}
          </div>
        )}

        {preview.isValid && (
          <>
            {!isLoggedIn ? (
              <Link
                href={`/auth/login?redirect=/invite/${code}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Anmelden & beitreten
              </Link>
            ) : (
              <InviteRedeemButton code={code} />
            )}
          </>
        )}

        <Link
          href={`/community/${preview.communitySlug}`}
          className="mt-4 block text-center text-sm text-unze-green"
        >
          Community ansehen
        </Link>
      </div>
    </div>
  );
}
