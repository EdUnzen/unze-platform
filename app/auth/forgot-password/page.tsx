import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { isSupabaseConfigured } from "@/lib/env";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="page-padding flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center pb-28">
      <div className="mb-8 flex flex-col items-center text-center">
        <UnzeLogo href="/" size="lg" showTagline />
        <h1 className="mt-4 text-lg font-semibold text-unze-ink">Passwort vergessen</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
          Gib deine E-Mail ein — wir senden dir einen Link zum Zurücksetzen.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-3xl bg-white p-6 text-center shadow-card">
          <p className="text-sm text-unze-ink-secondary">
            Passwort-Reset ist derzeit nicht verfügbar. Bitte versuche es später erneut.
          </p>
          <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-unze-green">
            Zur Anmeldung
          </Link>
        </div>
      ) : (
        <ForgotPasswordForm />
      )}
    </div>
  );
}
