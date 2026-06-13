import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ResetPasswordPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const returnTo = params.next ?? "/auth/login";

  if (!isSupabaseConfigured()) {
    redirect("/auth/login?error=service_unavailable");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="page-padding flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center pb-28">
      <div className="mb-8 flex flex-col items-center text-center">
        <UnzeLogo href="/" size="lg" showTagline />
        <h1 className="mt-4 text-lg font-semibold text-unze-ink">Neues Passwort</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
          {user
            ? "Wähle ein neues Passwort für dein Konto."
            : "Der Link ist ungültig oder abgelaufen."}
        </p>
      </div>

      {user ? (
        <ResetPasswordForm returnTo={returnTo} />
      ) : (
        <div className="rounded-3xl bg-white p-6 text-center shadow-card">
          <p className="text-sm text-unze-ink-secondary">
            Bitte fordere einen neuen Link an.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-block rounded-xl bg-unze-green px-6 py-3 text-sm font-semibold text-white"
          >
            Link erneut anfordern
          </Link>
        </div>
      )}
    </div>
  );
}
