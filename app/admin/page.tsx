import { StudioShell } from "@/components/studio/StudioShell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin-Zugang",
  robots: { index: false, follow: false },
};

const DEFAULT_EMAIL = "support@unze.app";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "Auth nicht konfiguriert",
  missing: "E-Mail und Passwort erforderlich",
  short: "Passwort muss mindestens 8 Zeichen haben",
  noaccess: "Kein Studio-Zugang für diese E-Mail.",
  mismatch: "Passwörter stimmen nicht überein",
  setfailed: "Passwort konnte nicht gesetzt werden",
  signinfailed: "Anmeldung fehlgeschlagen — Passwort prüfen oder erneut versuchen.",
  nostudio: "Kein Studio-Zugang konfiguriert.",
  unknown: "Anmeldung fehlgeschlagen — bitte erneut versuchen.",
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string; setup?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.unknown : null;
  const showSetupFields = params.setup !== "0";

  return (
    <StudioShell>
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
          <strong>Studio-Login (lokal):</strong>{" "}
          <code className="rounded bg-white px-1.5 py-0.5">http://localhost:3002/admin</code>
        </div>

        <h1 className="text-center text-2xl font-bold text-gray-900">Admin-Zugang</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Passwort sichtbar eingeben — danach erhalten Sie Ihre Eintrittskarte.
        </p>

        <div className="mt-8">
          <form
            method="POST"
            action="/api/studio/auth/form"
            className="mx-auto max-w-sm space-y-4"
          >
            <div>
              <label htmlFor="studio-email" className="mb-1 block text-sm font-medium text-gray-700">
                E-Mail
              </label>
              <input
                id="studio-email"
                name="email"
                type="email"
                defaultValue={DEFAULT_EMAIL}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="studio-password" className="mb-1 block text-sm font-medium text-gray-700">
                {showSetupFields ? "Neues Passwort (sichtbar)" : "Passwort (sichtbar)"}
              </label>
              <input
                id="studio-password"
                name="password"
                type="text"
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
              />
            </div>

            {showSetupFields ? (
              <div>
                <label
                  htmlFor="studio-password-confirm"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Passwort wiederholen (sichtbar)
                </label>
                <input
                  id="studio-password-confirm"
                  name="passwordConfirm"
                  type="text"
                  required
                  minLength={8}
                  placeholder="Gleiches Passwort nochmal"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                />
              </div>
            ) : (
              <input type="hidden" name="passwordConfirm" value="__login__" />
            )}

            {errorMessage ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              {showSetupFields ? "Passwort festlegen & anmelden" : "Anmelden"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            Passwort schon gesetzt?{" "}
            <a href="/admin?setup=0" className="text-emerald-700 underline">
              Nur anmelden
            </a>
          </p>
        </div>
      </div>
    </StudioShell>
  );
}
