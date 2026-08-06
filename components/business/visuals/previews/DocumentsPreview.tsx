import { File, Folder, Image } from "lucide-react";
import { PreviewShell } from "./shared";

const DOCS = [
  { name: "Abnahmeprotokoll.pdf", folder: "Baustelle Müller", type: "pdf" },
  { name: "Grundriss_EG.png", folder: "Baustelle Müller", type: "image" },
  { name: "Rechnung_RE-1042.pdf", folder: "Buchhaltung", type: "pdf" },
  { name: "Angebot_AN-552.pdf", folder: "Angebote", type: "pdf" },
];

export function DocumentsPreview({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  if (compact) {
    return (
      <PreviewShell bare={bare} title="Dokumente">
        <div className="space-y-1 p-2">
          {DOCS.slice(0, 2).map((d) => (
            <div key={d.name} className="rounded-md bg-white p-1.5 ring-1 ring-gray-100">
              <p className="truncate text-[7px] font-medium">{d.name}</p>
            </div>
          ))}
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title="Dokumentenverwaltung">
      <div className="flex h-full p-3 md:p-4">
        <aside className="mr-3 w-24 shrink-0 space-y-1 border-r border-gray-100 pr-2">
          {["Baustellen", "Angebote", "Rechnungen", "Fotos"].map((f, i) => (
            <div
              key={f}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[7px] ${
                i === 0 ? "bg-[#00C853]/10 font-semibold text-[#00C853]" : "text-gray-500"
              }`}
            >
              <Folder className="h-2.5 w-2.5" />
              {f}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-[11px] font-bold text-gray-900">Baustelle Müller</h2>
          {DOCS.map((d) => (
            <article
              key={d.name}
              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2"
            >
              {d.type === "image" ? (
                <Image className="h-3.5 w-3.5 text-violet-500" />
              ) : (
                <File className="h-3.5 w-3.5 text-red-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[8px] font-medium text-gray-800">{d.name}</p>
                <p className="text-[6px] text-gray-400">{d.folder}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}
