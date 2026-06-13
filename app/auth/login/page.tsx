import { AuthForm } from "@/components/auth/AuthForm";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { isSupabaseConfigured } from "@/lib/env";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    redirect?: string;
    error?: string;
    message?: string;
    verified?: string;
    mode?: string;
  }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Anmeldung nach E-Mail-Bestätigung fehlgeschlagen.",
  email_verification_failed: "E-Mail-Verifizierung fehlgeschlagen.",
  password_reset_failed: "Passwort-Reset-Link ungültig oder abgelaufen.",
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
    <div className="page-padding flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center pb-28">
      <div className="mb-8 flex flex-col items-center text-center">
        <UnzeLogo href="/" size="lg" showTagline />
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
          Die Plattform für Communities, Gruppen &amp; Services — organisieren,
          verifizieren und monetarisieren.
        </p>
      </div>

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
            {process.env.VERCEL
              ? "Trage NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables ein und redeploye."
              : "Kopiere .env.example nach .env.local und trage deine Supabase-Keys ein."}
          </p>
          <Link href="/" className="mt-3 inline-block font-medium text-unze-green">
            Zur Startseite
          </Link>
        </div>
      ) : (
        <AuthForm
          returnTo={returnTo}
          initialMode={params.mode === "signup" ? "signup" : "login"}
        />
      )}
    </div>
  );
}
