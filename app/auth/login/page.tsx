import { AuthForm } from "@/components/auth/AuthForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { isSupabaseConfigured } from "@/lib/env";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    redirect?: string;
    error?: string;
    message?: string;
    verified?: string;
  }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Anmeldung nach E-Mail-Bestätigung fehlgeschlagen.",
  email_verification_failed: "E-Mail-Verifizierung fehlgeschlagen.",
  supabase_not_configured: "Supabase ist nicht konfiguriert.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = params.next ?? params.redirect ?? "/";
  const configured = isSupabaseConfigured();
  const errorKey = params.error ?? "";
  const errorMessage =
    params.message ?? ERROR_MESSAGES[errorKey] ?? (errorKey ? errorKey : null);
  const verified = params.verified === "1";

  return (
    <div className="page-padding">
      <PageHeader
        title="Willkommen"
        subtitle="Melde dich an oder erstelle dein UNZE-Konto"
      />

      {verified && (
        <div
          className="mb-4 rounded-2xl border border-unze-green/30 bg-unze-green-muted/30 px-4 py-3 text-sm text-unze-green-dark"
          role="status"
        >
          E-Mail bestätigt — du kannst dich jetzt anmelden.
        </div>
      )}

      {errorMessage && (
        <div
          className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {!configured ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Supabase nicht konfiguriert</p>
          <p className="mt-1">
            Kopiere <code className="rounded bg-amber-100 px-1">.env.example</code> nach{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> und trage deine
            Supabase-Keys ein.
          </p>
          <Link href="/" className="mt-3 inline-block font-medium text-unze-green">
            Zur Startseite
          </Link>
        </div>
      ) : (
        <AuthForm returnTo={returnTo} />
      )}
    </div>
  );
}
