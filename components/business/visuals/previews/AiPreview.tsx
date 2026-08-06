import { Bot, FileText, Sparkles, Zap } from "lucide-react";
import { PreviewShell } from "./shared";

const MESSAGES = [
  {
    role: "user" as const,
    text: "Erstelle ein Angebot für Projekt Müller — 40h Entwicklung, Hosting inklusive.",
  },
  {
    role: "ai" as const,
    text: "Entwurf erstellt. PDF bereit: 2.480 € netto, 14 Tage Lieferzeit. Soll ich die Rechnungsvorlage öffnen?",
    actions: ["PDF öffnen", "An Kunden senden"],
  },
  {
    role: "user" as const,
    text: "Ja, an t.mueller@mueller-gmbh.de senden.",
  },
  {
    role: "ai" as const,
    text: "Gesendet ✓ Eingangsbestätigung erhalten. Termin für Kick-off vorgeschlagen: 12. März, 10:00.",
    actions: ["Termin bestätigen"],
  },
];

export function AiPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="KI-Assistent" dark>
        <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-950 p-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
              <Bot className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[7px] font-semibold text-white/80">UNZE KI</span>
          </div>
          <div className="mt-2 flex-1 space-y-1.5 overflow-hidden">
            <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#00C853]/20 px-2 py-1 text-[6px] text-white/90">
              Angebot erstellen
            </div>
            <div className="max-w-[90%] rounded-lg rounded-tl-sm bg-white/10 px-2 py-1 text-[6px] text-white/75">
              PDF bereit — 2.480 €
            </div>
          </div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="KI-Assistent · Business Core" dark>
      <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-[#00C853]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white">UNZE KI-Assistent</p>
            <p className="flex items-center gap-1 text-[7px] text-white/50">
              <Sparkles className="h-2 w-2 text-violet-400" />
              Angebote, Dokumente & Workflows
            </p>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="rounded-md bg-white/5 px-2 py-1 text-[7px] text-white/50">
              <FileText className="inline h-2 w-2" /> Docs
            </span>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[7px] text-white/50">
              <Zap className="inline h-2 w-2" /> Auto
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-hidden px-4 py-4">
          {MESSAGES.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-[#00C853]/20 text-[9px] leading-relaxed text-white/90"
                    : "rounded-tl-sm border border-white/10 bg-white/5 text-[9px] leading-relaxed text-white/75"
                }`}
              >
                {m.text}
                {m.role === "ai" && m.actions ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.actions.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-[#00C853]/30 bg-[#00C853]/10 px-2 py-0.5 text-[7px] font-semibold text-[#00C853]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="flex-1 text-[8px] text-white/30">Nachricht oder Befehl eingeben…</span>
            <span className="rounded-lg bg-[#00C853] px-2 py-1 text-[7px] font-semibold text-white">
              Senden
            </span>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
