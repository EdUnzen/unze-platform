import { getAppEntryPath, platformUrl } from "@/lib/constants/site";
import { Smartphone } from "lucide-react";

export function PwaInstallHint() {
  return (
    <aside className="rounded-2xl border border-[#00C853]/20 bg-[#00C853]/5 p-5">
      <div className="flex gap-3">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#00C853]" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">UNZE als Web-App speichern</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {"Öffne UNZE auf dem Handy in Safari oder Chrome und wähle "}
            {'„Zum Home-Bildschirm hinzufügen“. So hast du Communities, Events und '}
            Services immer griffbereit.
          </p>
          <a
            href={getAppEntryPath()}
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-[#00C853] hover:underline"
          >
            App {"öffnen"} &rarr;
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a
            href={platformUrl("/auth/login")}
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-[#00C853] hover:underline"
          >
            Anmelden
          </a>
        </div>
      </div>
    </aside>
  );
}
