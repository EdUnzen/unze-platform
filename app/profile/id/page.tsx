import { UnzeIdPanel } from "@/components/unze-id/UnzeIdPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUnzeIdForCurrentUser } from "@/services/unze-id/unze-id.service";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileUnzeIdPage() {
  const { token, payload, error } = await getUnzeIdForCurrentUser();
  if (error === "Nicht angemeldet") redirect("/auth/login?next=/profile/id");

  return (
    <div className="page-padding pb-8">
      <PageHeader
        title="UNZE-ID"
        subtitle="Dein pers�nlicher QR-Code f�r Verifizierung und Zugangspr�fungen"
        backHref="/profile"
        backLabel="Profil"
      />

      {payload && token ? (
        <UnzeIdPanel token={token} payload={payload} />
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-card">
          <QrCode className="mb-4 h-10 w-10 text-unze-ink-muted" aria-hidden />
          <p className="text-sm font-semibold text-unze-ink">UNZE-ID nicht verf�gbar</p>
          <p className="mt-2 max-w-xs text-sm text-unze-ink-secondary">
            {error ??
              "Deine ID konnte nicht geladen werden. Bitte lade die Seite neu oder melde dich erneut an."}
          </p>
          <Link
            href="/profile"
            className="mt-6 rounded-xl bg-unze-green px-6 py-3 text-sm font-semibold text-white active:scale-[0.98]"
          >
            Zur�ck zum Profil
          </Link>
        </div>
      )}

      {payload && token ? (
        <p className="mt-6 text-center">
          <Link href="/profile" className="text-sm font-medium text-unze-green">
            ? Zur�ck zum Profil
          </Link>
        </p>
      ) : null}
    </div>
  );
}
