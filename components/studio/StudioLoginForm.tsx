"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_EMAIL = "support@unze.app";

type AuthMode = "setup" | "login" | "none";

type EntryTicket = {
  email: string;
  password: string;
  loginUrl: string;
};

function buildEntryTicketText(ticket: EntryTicket): string {
  return [
    "UNZE Studio — Eintrittskarte",
    "─────────────────────────",
    `Login:    ${ticket.loginUrl}`,
    `E-Mail:   ${ticket.email}`,
    `Passwort: ${ticket.password}`,
    "─────────────────────────",
    "Bewahren Sie diese Daten sicher auf.",
  ].join("\n");
}

function StudioEntryTicket({
  ticket,
  onContinue,
}: {
  ticket: EntryTicket;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyTicket() {
    try {
      await navigator.clipboard.writeText(buildEntryTicketText(ticket));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="overflow-hidden rounded-xl border-2 border-emerald-500 bg-white shadow-sm">
        <div className="bg-emerald-600 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            UNZE Studio
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">Deine Eintrittskarte</h2>
        </div>
        <dl className="space-y-3 px-4 py-5 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Login</dt>
            <dd className="mt-0.5 break-all font-medium text-gray-900">{ticket.loginUrl}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">E-Mail</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{ticket.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Passwort</dt>
            <dd className="mt-0.5 break-all rounded-lg bg-emerald-50 px-3 py-2 font-mono text-base font-semibold text-emerald-900">
              {ticket.password}
            </dd>
          </div>
        </dl>
      </div>

      <p className="text-center text-xs text-gray-600">
        Speichern oder kopieren — das ist Ihr fester Studio-Zugang.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void copyTicket()}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          {copied ? "Kopiert ✓" : "Eintrittskarte kopieren"}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Weiter ins Studio
        </button>
      </div>
    </div>
  );
}

export function StudioLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [mode, setMode] = useState<AuthMode>("setup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [entryTicket, setEntryTicket] = useState<EntryTicket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkEmail() {
      try {
        const res = await fetch("/api/studio/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: DEFAULT_EMAIL }),
          cache: "no-store",
        });
        const json = (await res.json()) as { ok: boolean; mode?: AuthMode };
        if (cancelled) return;
        if (json.ok && (json.mode === "setup" || json.mode === "login")) {
          setMode(json.mode);
        }
      } catch {
        // Formular bleibt nutzbar — setup als Fallback
      }
    }

    void checkEmail();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "setup") {
        if (password !== passwordConfirm) {
          setError("Passwörter stimmen nicht überein");
          return;
        }

        const res = await fetch("/api/studio/auth/setup-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, passwordConfirm }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };

        if (!res.ok || !json.ok) {
          setError(json.error ?? "Passwort konnte nicht gesetzt werden");
          return;
        }

        setEntryTicket({
          email: email.trim(),
          password,
          loginUrl: `${window.location.origin}/admin`,
        });
        return;
      }

      const res = await fetch("/api/studio/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; redirect?: string };

      if (!res.ok || !json.ok) {
        setError(json.error ?? "Anmeldung fehlgeschlagen");
        return;
      }

      router.push(json.redirect ?? "/studio/app/uebersicht");
      router.refresh();
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  if (entryTicket) {
    return (
      <StudioEntryTicket
        ticket={entryTicket}
        onContinue={() => {
          router.push("/studio/app/uebersicht");
          router.refresh();
        }}
      />
    );
  }

  const isSetup = mode === "setup";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="studio-email" className="mb-1 block text-sm font-medium text-gray-700">
          E-Mail
        </label>
        <input
          id="studio-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isSetup ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Erstes Login — Passwort ist <strong>sichtbar</strong>. Danach erhalten Sie Ihre
          Eintrittskarte.
        </p>
      ) : null}

      <div>
        <label htmlFor="studio-password" className="mb-1 block text-sm font-medium text-gray-700">
          {isSetup ? "Neues Passwort (sichtbar)" : "Passwort (sichtbar)"}
        </label>
        <input
          id="studio-password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={isSetup ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      </div>

      {isSetup ? (
        <div>
          <label
            htmlFor="studio-password-confirm"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Passwort wiederholen (sichtbar)
          </label>
          <input
            id="studio-password-confirm"
            type="text"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Bitte warten…" : isSetup ? "Passwort festlegen & anmelden" : "Anmelden"}
      </button>
    </form>
  );
}
