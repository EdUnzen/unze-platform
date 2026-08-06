"use client";

import { UnzeIdQr } from "@/components/unze-id/UnzeIdQr";
import { cn } from "@/lib/utils/cn";
import {
  CheckCircle2,
  Copy,
  QrCode,
  Shield,
  Ticket,
  ScanLine,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UnzeIdPanelProps {
  token: string;
  payload: string;
}

const HOW_IT_WORKS = [
  {
    icon: QrCode,
    title: "QR vorzeigen",
    text: "Zeige diesen Code am Eingang oder beim Check-in — z. B. bei Events, Communities oder Verifizierung.",
  },
  {
    icon: ScanLine,
    title: "Organisator scannt",
    text: "Creator, Moderatoren oder Scanner-Geräte lesen deine UNZE-ID. Du musst nichts manuell eingeben.",
  },
  {
    icon: Shield,
    title: "Server entscheidet",
    text: "Berechtigungen liegen nicht im QR-Code. UNZE prüft serverseitig, ob du Zutritt hast.",
  },
] as const;

export function UnzeIdPanel({ token, payload }: UnzeIdPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <article className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="border-b border-unze-border/60 bg-unze-green-muted/30 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-green-dark">
            Deine persönliche ID
          </p>
          <p className="mt-0.5 text-sm text-unze-ink-secondary">
            Ein Code für alle Verifizierungen auf UNZE
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 px-4 py-6">
          <div className="rounded-2xl border border-unze-border/80 bg-white p-3 shadow-sm">
            <UnzeIdQr payload={payload} size={220} />
          </div>

          <div className="w-full max-w-sm">
            <p className="text-center text-xs font-medium text-unze-ink-muted">
              ID-Nummer
            </p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-unze-ink">
                {token}
              </code>
              <button
                type="button"
                onClick={copyId}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition active:scale-[0.98]",
                  copied
                    ? "bg-unze-green text-white"
                    : "bg-white text-unze-green ring-1 ring-unze-border",
                )}
                aria-label="UNZE-ID kopieren"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Kopieren
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="max-w-sm text-center text-xs leading-relaxed text-unze-ink-secondary">
            {"Enthält keine Passwörter oder Zahlungsdaten — nur deine öffentliche UNZE-Kennung."}
          </p>
        </div>
      </article>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold text-unze-ink">So funktioniert&apos;s</h2>
        <ol className="mt-4 space-y-4">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
                  Schritt {index + 1}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-unze-ink">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-unze-ink-secondary">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-unze-border/80 bg-unze-surface-muted/50 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-unze-ink">
          <Ticket className="h-4 w-4 text-unze-green" aria-hidden />
          UNZE-ID vs. Event-Ticket
        </h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-unze-ink">UNZE-ID</dt>
            <dd className="mt-0.5 text-unze-ink-secondary">
              {"Dein dauerhafter Nachweis als UNZE-Nutzer — für Verifizierung und Zugangsprüfungen durch Organisatoren."}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-unze-ink">Event-Ticket</dt>
            <dd className="mt-0.5 text-unze-ink-secondary">
              {"Separater QR pro gebuchtem Event — nur für den Check-in dieses Termins. "}
              <Link href="/profile/tickets" className="font-medium text-unze-green">
                Meine Tickets
              </Link>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
