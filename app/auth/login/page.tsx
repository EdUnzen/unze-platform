import { AuthForm } from "@/components/auth/AuthForm";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { AUTH_CALLBACK_ERRORS } from "@/lib/auth/user-facing-errors";
import { PLATFORM_DESCRIPTION } from "@/lib/constants/platform-copy";
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = params.next ?? params.redirect ?? "/";
  const configured = isSupabaseConfigured();
  const errorKey = params.error ?? "";
  const errorMessage =
    params.message ??
    AUTH_CALLBACK_ERRORS[errorKey] ??
    (errorKey && !errorKey.includes("_") ? errorKey : null);
  const verified = params.verified === "1";

  return (
    <div className="page-padding flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center pb-28">
      <div className="mb-8 flex flex-col items-center text-center">
        <UnzeLogo href="/" size="lg" showTagline />
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
          {PLATFORM_DESCRIPTION}
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
          <p className="font-medium">Anmeldung vorübergehend nicht verfügbar</p>
          <p className="mt-1">
            UNZE wird gerade vorbereitet. Bitte versuche es in Kürze erneut oder kehre zur
            Startseite zurück.
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
